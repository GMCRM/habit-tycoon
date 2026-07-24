-- Prevent stock-riding pump-and-dump abuse of business upgrades.
--
-- EXPLOIT: upgradeHabitBusiness() updates a habit_businesses row in place
-- (same id), so any business_stocks/stock_holdings attached to it ride
-- straight through a tier upgrade. A user could create a Lemonade Stand,
-- have a friend buy stock in it, instantly upgrade the same business all
-- the way to a top-tier business (e.g. Oil Company), and the friend could
-- immediately sell for a huge, ungated payout - handing a new player
-- effectively unlimited money with no habit-completion grind involved.
--
-- Worse, habit_businesses' UPDATE RLS policy has no column restriction, so
-- a user could get the same result even more directly by writing `streak`
-- on their own row via a raw client call - the legacy
-- update_stock_price_on_streak_change trigger would then snap the stock
-- price to the max multiplier instantly, unsmoothed, bypassing all
-- app-layer logic entirely.
--
-- FIX (four parts, all enforced at the DB layer so they can't be bypassed
-- by calling the client SDK directly instead of going through the app):
--   1. A BEFORE UPDATE trigger on habit_businesses enforces a 24h cooldown
--      between tier upgrades, and restricts `streak` to only the two
--      transitions the app itself ever produces (+1, or reset to <=1).
--   2. The legacy unsmoothed update_stock_price_on_streak_change trigger is
--      dropped - it's redundant with the app-invoked update_stock_price_by_streak
--      RPC and would otherwise undo the smoothing added below.
--   3. update_stock_price_by_streak() now caps upward price movement to
--      +50%/day of real elapsed time toward the target valuation, instead
--      of jumping straight to it. Price drops (streak breaks) still apply
--      instantly - that direction isn't exploitable.
--   4. Purchased shares can't be sold for 48h after purchase (or after a
--      top-up), closing the immediate buy-then-cash-out window.

-- ─── 1. Upgrade cooldown + streak-tamper guard ───

ALTER TABLE habit_businesses ADD COLUMN IF NOT EXISTS last_upgraded_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION guard_habit_business_mutation() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.business_type_id IS DISTINCT FROM OLD.business_type_id THEN
        IF now() - COALESCE(OLD.last_upgraded_at, OLD.created_at) < INTERVAL '24 hours' THEN
            RAISE EXCEPTION 'This business can only be upgraded once every 24 hours';
        END IF;
        NEW.last_upgraded_at := now();
    END IF;

    -- Streak may only move by the transitions the app itself produces:
    -- +1 (check-in), -1 (undoHabitCompletion), or a reset to 0/1 (missed
    -- day / first completion). Anything else - e.g. a raw client write
    -- jumping streak to force the max stock-price multiplier - is rejected.
    IF NEW.streak IS DISTINCT FROM OLD.streak THEN
        IF NOT (NEW.streak = OLD.streak + 1 OR NEW.streak = OLD.streak - 1 OR NEW.streak <= 1) THEN
            RAISE EXCEPTION 'Invalid streak transition';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_habit_business_mutation_trigger ON habit_businesses;
CREATE TRIGGER guard_habit_business_mutation_trigger
    BEFORE UPDATE ON habit_businesses
    FOR EACH ROW EXECUTE FUNCTION guard_habit_business_mutation();

-- ─── 2. Drop the legacy unsmoothed per-streak price trigger ───
-- Redundant with update_stock_price_by_streak(), which the app already
-- calls after every habit completion - left in place, it would snap the
-- price instantly on every streak change and undo the smoothing below.

DROP TRIGGER IF EXISTS update_stock_price_trigger ON habit_businesses;
DROP FUNCTION IF EXISTS update_stock_price_on_streak_change();
DROP FUNCTION IF EXISTS calculate_stock_price_multiplier(INTEGER);

-- ─── 3. Smooth stock price growth toward the target valuation ───

DROP FUNCTION IF EXISTS update_stock_price_by_streak(UUID);
CREATE OR REPLACE FUNCTION update_stock_price_by_streak(habit_business_uuid UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_streak INTEGER;
business_base_cost NUMERIC;
base_price NUMERIC;
streak_multiplier NUMERIC;
target_price NUMERIC;
new_price NUMERIC;
stock_uuid UUID;
prev_price NUMERIC;
prev_update TIMESTAMPTZ;
elapsed_hours NUMERIC;
max_price NUMERIC;
BEGIN
SELECT hb.streak,
    bt.base_cost INTO current_streak,
    business_base_cost
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE hb.id = habit_business_uuid;
IF current_streak IS NULL THEN RAISE EXCEPTION 'Habit business not found';
END IF;

SELECT id,
    current_stock_price,
    last_price_update INTO stock_uuid,
    prev_price,
    prev_update
FROM business_stocks
WHERE habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN 0;
END IF;

-- Calculate base price as 10% of business base cost
base_price := COALESCE(business_base_cost * 0.1, 1);

-- Streak multiplier: same curve as before
IF current_streak <= 1 THEN streak_multiplier := 1.0;
ELSIF current_streak <= 7 THEN streak_multiplier := 1.0 + (current_streak - 1) * 0.083;
ELSIF current_streak <= 14 THEN streak_multiplier := 1.5 + (current_streak - 7) * 0.071;
ELSIF current_streak <= 30 THEN streak_multiplier := 2.0 + (current_streak - 14) * 0.0625;
ELSE streak_multiplier := 3.0 + LEAST((current_streak - 30) * 0.05, 2.0);
END IF;

target_price := ROUND(base_price * streak_multiplier, 2);

-- Cap upward movement at +50%/day of real elapsed time since the last
-- price update, so a business that just jumped tiers (or streak) can't
-- have its attached stock cashed out at the new valuation instantly -
-- it has to ramp up over real time. Drops apply immediately.
IF target_price > COALESCE(prev_price, target_price) THEN
    elapsed_hours := GREATEST(EXTRACT(EPOCH FROM (now() - COALESCE(prev_update, now() - INTERVAL '999 hours'))) / 3600.0, 0);
    max_price := prev_price * (1 + 0.5 * elapsed_hours / 24.0);
    new_price := LEAST(target_price, max_price);
ELSE
    new_price := target_price;
END IF;

UPDATE business_stocks
SET current_stock_price = new_price,
    price_multiplier = streak_multiplier,
    last_price_update = NOW()
WHERE id = stock_uuid;
RETURN new_price;
END;
$$;
GRANT EXECUTE ON FUNCTION update_stock_price_by_streak(UUID) TO authenticated;
COMMENT ON FUNCTION update_stock_price_by_streak(UUID) IS 'Update stock price based on business type base cost and current streak, capping upward movement to +50%/day of real elapsed time to prevent instant pump-and-dump after a tier upgrade or streak jump.';

-- ─── 4. Vesting period before purchased shares can be sold ───

ALTER TABLE stock_holdings ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMPTZ NOT NULL DEFAULT now();

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
BEGIN
SELECT business_stocks.current_stock_price,
    business_stocks.shares_available INTO stock_price,
    available_shares
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
IF stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
IF available_shares < shares_to_buy THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Not enough shares available'
);
END IF;
total_cost := stock_price * shares_to_buy;
SELECT cash INTO buyer_cash
FROM user_profiles
WHERE id = buyer_id;
IF buyer_cash < total_cost THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
END IF;
SELECT id INTO existing_holding_id
FROM stock_holdings
WHERE holder_id = buyer_id
    AND stock_id = stock_uuid;
IF existing_holding_id IS NOT NULL THEN
SELECT shares_owned + shares_to_buy,
    total_invested + total_cost INTO new_total_shares,
    new_total_invested
FROM stock_holdings
WHERE id = existing_holding_id;
new_avg_price := new_total_invested / new_total_shares;
-- A top-up resets the vesting clock for the whole holding (simplification:
-- no per-lot tracking) - intentional, otherwise an attacker could vest a
-- single share early and top up right before selling.
UPDATE stock_holdings
SET shares_owned = new_total_shares,
    average_purchase_price = new_avg_price,
    total_invested = new_total_invested,
    last_purchase_at = NOW(),
    updated_at = NOW()
WHERE id = existing_holding_id;
ELSE
INSERT INTO stock_holdings (
        holder_id,
        stock_id,
        shares_owned,
        average_purchase_price,
        total_invested,
        total_dividends_earned,
        last_purchase_at
    )
VALUES (
        buyer_id,
        stock_uuid,
        shares_to_buy,
        stock_price,
        total_cost,
        0,
        NOW()
    );
END IF;
UPDATE business_stocks
SET shares_available = business_stocks.shares_available - shares_to_buy,
    updated_at = NOW()
WHERE business_stocks.id = stock_uuid;
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
        shares_to_buy,
        stock_price,
        total_cost,
        'purchase'
    );
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
net_proceeds NUMERIC;
hours_until_vested NUMERIC;
BEGIN
SELECT current_stock_price INTO v_current_stock_price
FROM business_stocks
WHERE id = stock_uuid;
IF v_current_stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
SELECT * INTO holding_record
FROM stock_holdings
WHERE holder_id = seller_id
    AND stock_id = stock_uuid;
IF holding_record IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'No holdings found');
END IF;
IF holding_record.shares_owned < shares_to_sell THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Insufficient shares to sell'
);
END IF;
IF now() - holding_record.last_purchase_at < INTERVAL '48 hours' THEN
    hours_until_vested := CEIL(EXTRACT(EPOCH FROM (holding_record.last_purchase_at + INTERVAL '48 hours' - now())) / 3600.0);
    RETURN jsonb_build_object(
        'success',
        false,
        'error',
        'These shares are still vesting - sellable in ' || hours_until_vested || ' more hour(s)'
    );
END IF;
total_sale_value := v_current_stock_price * shares_to_sell;
transaction_fee := total_sale_value * 0.02;
net_proceeds := total_sale_value - transaction_fee;
capital_gains := (
    v_current_stock_price - holding_record.average_purchase_price
) * shares_to_sell;
IF holding_record.shares_owned = shares_to_sell THEN
DELETE FROM stock_holdings
WHERE id = holding_record.id;
ELSE
UPDATE stock_holdings
SET shares_owned = shares_owned - shares_to_sell,
    total_invested = total_invested - (
        holding_record.average_purchase_price * shares_to_sell
    ),
    updated_at = NOW()
WHERE id = holding_record.id;
END IF;
UPDATE business_stocks
SET shares_available = shares_available + shares_to_sell,
    updated_at = NOW()
WHERE id = stock_uuid;
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
        seller_id,
        shares_to_sell,
        v_current_stock_price,
        total_sale_value,
        'sale'
    );
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

-- ─── Surface vesting info to the portfolio UI ───

DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_id UUID,
        owner_name TEXT,
        shares_owned INTEGER,
        average_purchase_price NUMERIC,
        current_stock_price NUMERIC,
        total_invested NUMERIC,
        current_value NUMERIC,
        profit_loss NUMERIC,
        total_dividends_earned NUMERIC,
        daily_dividend_rate NUMERIC,
        business_streak INTEGER,
        goal_value INTEGER,
        current_progress INTEGER,
        last_completed_at TIMESTAMPTZ,
        recurrence_interval TEXT,
        active_days INTEGER[],
        last_purchase_at TIMESTAMPTZ
    ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    bt.icon as business_icon,
    hb.user_id as owner_id,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    GREATEST(
        ROUND(
            (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * (
                sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC
            ),
            2
        ),
        0.01
    ) as daily_dividend_rate,
    hb.streak,
    hb.goal_value,
    hb.current_progress,
    hb.last_completed_at,
    hb.recurrence_interval,
    hb.active_days,
    sh.last_purchase_at
FROM stock_holdings sh
    INNER JOIN business_stocks bs ON sh.stock_id = bs.id
    INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id
    INNER JOIN user_profiles up ON hb.user_id = up.id
WHERE sh.holder_id = user_uuid
    AND sh.shares_owned > 0
    AND hb.is_active = true
ORDER BY current_value DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
