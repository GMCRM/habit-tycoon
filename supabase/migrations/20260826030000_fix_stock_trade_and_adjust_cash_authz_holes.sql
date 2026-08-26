-- CRITICAL security fixes found in a follow-up RPC authorization sweep
-- (same bug-hunt pass that found the RLS holes fixed in the three
-- 20260826*_fix_*.sql migrations above). Both of these are worse than a
-- plain RLS gap: SECURITY DEFINER functions bypass RLS entirely, so a
-- missing internal auth check here is directly exploitable with a single
-- RPC call and no dependency on any table policy.
--
-- 1) adjust_user_cash(p_user_id, p_delta) is the atomic cash-adjustment
--    primitive every money-moving RPC in this project calls internally
--    (habit completions, dividends, marketplace, joint ventures — see the
--    dozens of PERFORM adjust_user_cash(...) call sites across the
--    migrations that added those features). It takes p_user_id as a plain
--    parameter with no check that it's the caller, and — unlike every
--    other RPC that takes a user-identifying parameter — it was directly
--    GRANTed EXECUTE TO authenticated. Any authenticated client could call
--    `supabase.rpc('adjust_user_cash', {p_user_id: '<any-uuid>', p_delta: 1e9})`
--    directly and set an arbitrary cash delta on ANY user's account,
--    bypassing every one of those wrapper RPCs' business-logic checks
--    entirely (no purchase, no valid habit completion, nothing).
--
--    FIX: revoke the client-facing grant. adjust_user_cash still needs to
--    accept an arbitrary target user id (dividends/marketplace/joint
--    ventures legitimately credit *other* users), so the fix isn't adding
--    an auth.uid() check here — it's ensuring only the app's own
--    SECURITY DEFINER wrapper functions can reach it. Those still can:
--    a nested SECURITY DEFINER call executes as the *calling* function's
--    owner, not as `authenticated`, so this is transparent to every one
--    of the existing internal callers and requires no code changes there.
--    Confirmed no client code calls adjust_user_cash directly today.
--
-- 2) purchase_stock_shares(buyer_id, ...) and sell_stock_shares(seller_id,
--    ...) never check that buyer_id/seller_id is the caller — every other
--    RPC in this project that takes a caller-identifying id parameter
--    does (`IF p_x IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION ...`,
--    see purchase_marketplace_listing, create_marketplace_listing,
--    resolve_marketplace_purchase, and every joint-venture RPC), but these
--    two were missed. Any authenticated client could force a stock trade
--    on another user's account — draining their cash via an unwanted
--    forced purchase, or forcibly liquidating their holdings via a forced
--    sale — with no interaction from the victim.
--
--    FIX: add the same `IS DISTINCT FROM auth.uid()` guard used
--    everywhere else in this project. Bodies are otherwise unchanged from
--    20260816030000_refresh_stock_price_before_trade.sql.

REVOKE EXECUTE ON FUNCTION adjust_user_cash(UUID, NUMERIC) FROM authenticated;

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
v_habit_business_id UUID;
BEGIN
IF buyer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
END IF;
IF EXISTS (
    SELECT 1 FROM business_co_owners bco
    JOIN business_stocks bs ON bs.habit_business_id = bco.habit_business_id
    WHERE bs.id = stock_uuid AND bco.user_id = buyer_id
) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Co-owners cannot invest in their own joint venture');
END IF;
IF EXISTS (
    SELECT 1 FROM business_stocks bs
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    JOIN friend_visibility_settings fvs ON fvs.owner_id = hb.user_id AND fvs.friend_id = buyer_id
    WHERE bs.id = stock_uuid AND NOT hb.is_joint_venture AND fvs.show_stocks = false
) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This stock is not available for you to purchase');
END IF;
SELECT habit_business_id INTO v_habit_business_id
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
IF v_habit_business_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Bring the price up to date before reading it, so the trade executes at
-- the live ramp value rather than a stale cron/completion-event snapshot.
PERFORM update_stock_price_by_streak(v_habit_business_id);
SELECT business_stocks.current_stock_price,
    business_stocks.shares_available INTO stock_price,
    available_shares
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
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
v_habit_business_id UUID;
BEGIN
IF seller_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
END IF;
SELECT habit_business_id INTO v_habit_business_id
FROM business_stocks
WHERE id = stock_uuid;
IF v_habit_business_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Bring the price up to date before reading it, so the trade executes at
-- the live ramp value rather than a stale cron/completion-event snapshot.
PERFORM update_stock_price_by_streak(v_habit_business_id);
SELECT current_stock_price INTO v_current_stock_price
FROM business_stocks
WHERE id = stock_uuid;
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

NOTIFY pgrst, 'reload schema';
