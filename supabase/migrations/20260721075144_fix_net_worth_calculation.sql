-- Fix net worth so it's actually cash + business value + portfolio value.
--
-- ROOT CAUSE: user_profiles.net_worth was hand-maintained as a shadow copy of
-- cash — every RPC/client code path that changed cash was supposed to apply
-- the same delta to net_worth. In practice several paths (business creation,
-- business upgrade, dividend payouts, manual "buy stock" from habit-checkin,
-- the business-deletion stock-refund trigger) only updated cash and forgot
-- net_worth, and none of them ever factored in the value of stock holdings
-- or owned businesses at all — buying stock or a business just made net
-- worth go down by the purchase price with no offsetting asset value added.
--
-- FIX: net_worth is redefined as
--   cash + SUM(active habit_businesses: COALESCE(cost, business_type.base_cost) * 0.7)
--        + SUM(active stock holdings: shares_owned * current_stock_price)
-- (the 0.7 business multiplier matches the existing "sell business" payout —
-- see deleteHabitBusiness's sellValue calculation) and recomputed from
-- scratch via recalculate_net_worth() after every mutation, instead of being
-- nudged by ad hoc deltas. This self-heals any drift already on the row.

DROP FUNCTION IF EXISTS recalculate_net_worth(UUID);
CREATE OR REPLACE FUNCTION recalculate_net_worth(p_user_id UUID) RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_net_worth NUMERIC;
BEGIN
    SELECT COALESCE(up.cash, 0)
        + COALESCE((
            SELECT SUM(COALESCE(hb.cost, bt.base_cost, 0) * 0.7)
            FROM habit_businesses hb
                JOIN business_types bt ON hb.business_type_id = bt.id
            WHERE hb.user_id = p_user_id
                AND hb.is_active = true
        ), 0)
        + COALESCE((
            SELECT SUM(sh.shares_owned * bs.current_stock_price)
            FROM stock_holdings sh
                JOIN business_stocks bs ON sh.stock_id = bs.id
                JOIN habit_businesses hb2 ON bs.habit_business_id = hb2.id
            WHERE sh.holder_id = p_user_id
                AND sh.shares_owned > 0
                AND hb2.is_active = true
        ), 0)
    INTO v_net_worth
    FROM user_profiles up
    WHERE up.id = p_user_id;

    UPDATE user_profiles
    SET net_worth = COALESCE(v_net_worth, 0),
        updated_at = NOW()
    WHERE id = p_user_id;

    RETURN COALESCE(v_net_worth, 0);
END;
$$;
GRANT EXECUTE ON FUNCTION recalculate_net_worth(UUID) TO authenticated;

-- ─── purchase_stock_shares: stop subtracting cost from net_worth, recalc instead ───
DROP FUNCTION IF EXISTS purchase_stock_shares(UUID, UUID, INTEGER);
CREATE OR REPLACE FUNCTION purchase_stock_shares(
        buyer_id UUID,
        stock_uuid UUID,
        shares_to_buy INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stock_price NUMERIC;
available_shares INTEGER;
total_cost NUMERIC;
buyer_cash NUMERIC;
existing_holding_id UUID;
new_total_shares INTEGER;
new_total_invested NUMERIC;
new_avg_price NUMERIC;
BEGIN -- Get stock details
SELECT business_stocks.current_stock_price,
    business_stocks.shares_available INTO stock_price,
    available_shares
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
IF stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Check if enough shares are available
IF available_shares < shares_to_buy THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Not enough shares available'
);
END IF;
-- Calculate total cost
total_cost := stock_price * shares_to_buy;
-- Check buyer's cash
SELECT cash INTO buyer_cash
FROM user_profiles
WHERE id = buyer_id;
IF buyer_cash < total_cost THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
END IF;
-- Check if user already has holdings in this stock
SELECT id INTO existing_holding_id
FROM stock_holdings
WHERE holder_id = buyer_id
    AND stock_id = stock_uuid;
IF existing_holding_id IS NOT NULL THEN -- Update existing holding
SELECT shares_owned + shares_to_buy,
    total_invested + total_cost INTO new_total_shares,
    new_total_invested
FROM stock_holdings
WHERE id = existing_holding_id;
new_avg_price := new_total_invested / new_total_shares;
UPDATE stock_holdings
SET shares_owned = new_total_shares,
    average_purchase_price = new_avg_price,
    total_invested = new_total_invested,
    updated_at = NOW()
WHERE id = existing_holding_id;
ELSE -- Create new holding
INSERT INTO stock_holdings (
        holder_id,
        stock_id,
        shares_owned,
        average_purchase_price,
        total_invested,
        total_dividends_earned
    )
VALUES (
        buyer_id,
        stock_uuid,
        shares_to_buy,
        stock_price,
        total_cost,
        0
    );
END IF;
-- Update stock availability
UPDATE business_stocks
SET shares_available = business_stocks.shares_available - shares_to_buy,
    updated_at = NOW()
WHERE business_stocks.id = stock_uuid;
-- Record transaction
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        buyer_id,
        NULL,
        -- IPO purchase, no seller
        shares_to_buy,
        stock_price,
        total_cost,
        'purchase'
    );
-- Deduct cash from buyer (net_worth is recalculated below, not nudged by delta)
UPDATE user_profiles
SET cash = cash - total_cost,
    updated_at = NOW()
WHERE id = buyer_id;
PERFORM recalculate_net_worth(buyer_id);
RETURN jsonb_build_object(
    'success',
    true,
    'shares_purchased',
    shares_to_buy,
    'total_cost',
    total_cost,
    'new_cash_balance',
    buyer_cash - total_cost
);
END;
$$;
GRANT EXECUTE ON FUNCTION purchase_stock_shares(UUID, UUID, INTEGER) TO authenticated;

-- ─── sell_stock_shares: same fix ───
DROP FUNCTION IF EXISTS sell_stock_shares(UUID, UUID, INTEGER);
CREATE OR REPLACE FUNCTION sell_stock_shares(
        seller_id UUID,
        stock_uuid UUID,
        shares_to_sell INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_current_stock_price NUMERIC;
holding_record RECORD;
total_sale_value NUMERIC;
capital_gains NUMERIC;
transaction_fee NUMERIC := 0.02;
-- 2% transaction fee
net_proceeds NUMERIC;
BEGIN -- Get current stock price
SELECT current_stock_price INTO v_current_stock_price
FROM business_stocks
WHERE id = stock_uuid;
IF v_current_stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Get user's holding
SELECT * INTO holding_record
FROM stock_holdings
WHERE holder_id = seller_id
    AND stock_id = stock_uuid;
IF holding_record IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'No holdings found');
END IF;
-- Check if user has enough shares to sell
IF holding_record.shares_owned < shares_to_sell THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Insufficient shares to sell'
);
END IF;
-- Calculate sale proceeds
total_sale_value := v_current_stock_price * shares_to_sell;
transaction_fee := total_sale_value * 0.02;
-- 2% fee
net_proceeds := total_sale_value - transaction_fee;
-- Calculate capital gains/loss
capital_gains := (
    v_current_stock_price - holding_record.average_purchase_price
) * shares_to_sell;
-- Update or remove holding
IF holding_record.shares_owned = shares_to_sell THEN -- Selling all shares - remove holding
DELETE FROM stock_holdings
WHERE id = holding_record.id;
ELSE -- Partial sale - update holding
UPDATE stock_holdings
SET shares_owned = shares_owned - shares_to_sell,
    total_invested = total_invested - (
        holding_record.average_purchase_price * shares_to_sell
    ),
    updated_at = NOW()
WHERE id = holding_record.id;
END IF;
-- Update stock availability (shares go back to available pool)
UPDATE business_stocks
SET shares_available = shares_available + shares_to_sell,
    updated_at = NOW()
WHERE id = stock_uuid;
-- Record the transaction
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        NULL,
        -- No specific buyer (back to market)
        seller_id,
        shares_to_sell,
        v_current_stock_price,
        total_sale_value,
        'sale'
    );
-- Add proceeds to seller's cash, then recalculate net worth from scratch
UPDATE user_profiles
SET cash = cash + net_proceeds,
    updated_at = NOW()
WHERE id = seller_id;
PERFORM recalculate_net_worth(seller_id);
RETURN jsonb_build_object(
    'success',
    true,
    'shares_sold',
    shares_to_sell,
    'sale_price_per_share',
    v_current_stock_price,
    'total_sale_value',
    total_sale_value,
    'transaction_fee',
    transaction_fee,
    'net_proceeds',
    net_proceeds,
    'capital_gains',
    capital_gains
);
END;
$$;
GRANT EXECUTE ON FUNCTION sell_stock_shares(UUID, UUID, INTEGER) TO authenticated;

-- ─── process_habit_completion_dividends: dividends were only updating cash, never net_worth ───
DROP FUNCTION IF EXISTS process_habit_completion_dividends(UUID);
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(completion_uuid UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE habit_business_uuid UUID;
business_owner_id UUID;
stock_uuid UUID;
base_earnings NUMERIC;
stock_boost NUMERIC := 0;
total_dividend_pool NUMERIC;
dividend_payment_uuid UUID;
stockholder RECORD;
dividend_per_share NUMERIC;
stockholder_dividend NUMERIC;
shares_owned_by_owner INTEGER;
total_shares_issued INTEGER;
shares_owned_by_others INTEGER;
other_ownership_percentage NUMERIC;
stock_boost_percentage NUMERIC;
holder_count INTEGER;
BEGIN -- Get completion details
SELECT habit_business_id,
    user_id,
    earnings INTO habit_business_uuid,
    business_owner_id,
    base_earnings
FROM habit_completions
WHERE id = completion_uuid;
-- Get stock details
SELECT bs.id,
    bs.shares_owned_by_owner,
    bs.total_shares_issued INTO stock_uuid,
    shares_owned_by_owner,
    total_shares_issued
FROM business_stocks bs
WHERE bs.habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN;
-- No stock exists for this business
END IF;
-- How many external stockholders are there?
SELECT COUNT(*) INTO holder_count
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0;
IF holder_count = 0 THEN RETURN;
-- No stockholders, nothing to pay
END IF;
-- Calculate stock boost: 5% bonus per 10% of shares owned by others
shares_owned_by_others := total_shares_issued - shares_owned_by_owner;
other_ownership_percentage := (
    shares_owned_by_others::NUMERIC / total_shares_issued::NUMERIC
) * 100;
stock_boost_percentage := FLOOR(other_ownership_percentage / 10) * 5;
stock_boost := base_earnings * (stock_boost_percentage / 100);
-- Dividend pool (may be 0 when ownership is < 10% — minimums will still apply)
total_dividend_pool := stock_boost * 0.5;
-- Record the dividend payment event
INSERT INTO dividend_payments (
        stock_id,
        habit_completion_id,
        business_owner_id,
        base_earnings,
        stock_boost_amount,
        total_dividend_pool
    )
VALUES (
        stock_uuid,
        completion_uuid,
        business_owner_id,
        base_earnings,
        stock_boost,
        total_dividend_pool
    )
RETURNING id INTO dividend_payment_uuid;
-- Compute per-share rate (may be 0; minimum will be enforced per stockholder)
SELECT COALESCE(SUM(shares_owned), 0) INTO dividend_per_share
FROM stock_holdings
WHERE stock_id = stock_uuid;
IF dividend_per_share > 0 THEN dividend_per_share := total_dividend_pool / dividend_per_share;
ELSE dividend_per_share := 0;
END IF;
FOR stockholder IN
SELECT holder_id,
    shares_owned
FROM stock_holdings
WHERE stock_id = stock_uuid
    AND shares_owned > 0 LOOP stockholder_dividend := stockholder.shares_owned * dividend_per_share;
-- Always pay at least $0.01 per stockholder per completion
stockholder_dividend := GREATEST(stockholder_dividend, 0.01);
INSERT INTO stock_dividend_distributions (
        dividend_payment_id,
        stockholder_id,
        shares_owned,
        dividend_per_share,
        total_dividend
    )
VALUES (
        dividend_payment_uuid,
        stockholder.holder_id,
        stockholder.shares_owned,
        dividend_per_share,
        stockholder_dividend
    );
UPDATE user_profiles
SET cash = cash + stockholder_dividend,
    updated_at = NOW()
WHERE id = stockholder.holder_id;
PERFORM recalculate_net_worth(stockholder.holder_id);
UPDATE stock_holdings
SET total_dividends_earned = total_dividends_earned + stockholder_dividend,
    updated_at = NOW()
WHERE holder_id = stockholder.holder_id
    AND stock_id = stock_uuid;
END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID) TO authenticated;

-- ─── business-deletion stock refund trigger: refunded stockholders' cash, never net_worth ───
CREATE OR REPLACE FUNCTION handle_business_deletion_stock_refunds() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stock_record RECORD;
holding_record RECORD;
refund_amount DECIMAL(12, 2);
current_stock_price DECIMAL(10, 2);
BEGIN -- Only process if the business is being deactivated (soft delete)
IF OLD.is_active = true
AND NEW.is_active = false THEN -- Get the stock record for this business
SELECT * INTO stock_record
FROM business_stocks
WHERE habit_business_id = NEW.id;
-- If there's a stock record, process refunds
IF FOUND THEN -- Get current stock price
current_stock_price := stock_record.current_stock_price;
-- Refund all stockholders
FOR holding_record IN
SELECT sh.*
FROM stock_holdings sh
WHERE sh.stock_id = stock_record.id
    AND sh.shares_owned > 0 LOOP -- Calculate refund: shares * current stock price
    refund_amount := holding_record.shares_owned * current_stock_price;
-- Add refund to user's cash, then recalculate net worth from scratch
UPDATE user_profiles
SET cash = cash + refund_amount,
    updated_at = NOW()
WHERE id = holding_record.holder_id;
PERFORM recalculate_net_worth(holding_record.holder_id);
-- Create a transaction record for the forced sale
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type,
        created_at
    )
VALUES (
        stock_record.id,
        NULL,
        -- No buyer for business deletion
        holding_record.holder_id,
        holding_record.shares_owned,
        current_stock_price,
        refund_amount,
        'business_deletion_refund',
        NOW()
    );
END LOOP;
-- Update the stock record to mark it as deleted
UPDATE business_stocks
SET is_active = false,
    updated_at = NOW()
WHERE id = stock_record.id;
END IF;
END IF;
-- Recalculate the business owner's own net worth too (their business_value component just changed)
PERFORM recalculate_net_worth(NEW.user_id);
RETURN NEW;
END;
$$;

-- One-time backfill: fix every existing user's net_worth immediately instead of
-- waiting for their next cash-mutating action to self-heal it.
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT id FROM user_profiles LOOP
        PERFORM recalculate_net_worth(r.id);
    END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';
