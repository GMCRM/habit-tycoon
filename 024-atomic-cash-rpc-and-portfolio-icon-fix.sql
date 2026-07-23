-- Two independent fixes found in a full-project bug sweep:
--
-- 1) Lost-update race on habit-completion/undo cash awards.
--    ROOT CAUSE: completeHabit(), completeHabitYesterday() and
--    undoHabitCompletion() in habit-business.service.ts read
--    user_profiles.cash, add/subtract the earnings amount in JS, then write
--    the new value back — two round trips with no locking in between. Two
--    overlapping calls (double-tap, two devices, a habit completion racing a
--    dividend payout) can both read the same starting cash value; whichever
--    write lands second silently overwrites the first, losing one side's
--    earnings/deduction. purchase_stock_shares/sell_stock_shares already
--    avoid this by doing the increment inside a single atomic SQL statement
--    (see 017-fix-net-worth-calculation.sql) — this adds the equivalent for
--    plain cash adjustments (habit earnings, undo, dividends already use
--    this pattern via process_habit_completion_dividends).
--
-- 2) get_user_stock_portfolio still leaks the private per-habit icon.
--    013-fix-portfolio-missing-owner-id.sql switched business_name to the
--    public business_type name for privacy, but left business_icon sourced
--    from hb.business_icon (the private, per-habit-business field) instead
--    of bt.icon (the public business-type field) — the same class of leak
--    023-professional-achievement-notifications.sql eliminated elsewhere.
--    Currently inert only because business_icon happens to always be copied
--    from business_type.icon at creation/upgrade time.

-- ─── adjust_user_cash: atomic cash increment/decrement ───
DROP FUNCTION IF EXISTS adjust_user_cash(UUID, NUMERIC);
CREATE OR REPLACE FUNCTION adjust_user_cash(p_user_id UUID, p_delta NUMERIC) RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_new_cash NUMERIC;
BEGIN
    UPDATE user_profiles
    SET cash = cash + p_delta,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING cash INTO v_new_cash;

    IF v_new_cash IS NULL THEN
        RAISE EXCEPTION 'User profile not found: %', p_user_id;
    END IF;

    PERFORM recalculate_net_worth(p_user_id);

    RETURN v_new_cash;
END;
$$;
GRANT EXECUTE ON FUNCTION adjust_user_cash(UUID, NUMERIC) TO authenticated;

-- ─── get_user_stock_portfolio: use the public business-type icon, not the private per-habit one ───
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
        business_streak INTEGER
    ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    bt.icon as business_icon,
    -- Public business type name/icon, never the private per-habit name/icon
    hb.user_id as owner_id,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    -- Estimated dividend per completion: apply same GREATEST($0.01) floor as the payout function
    GREATEST(
        ROUND(
            (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * (
                sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC
            ),
            2
        ),
        0.01
    ) as daily_dividend_rate,
    hb.streak
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
