-- Fix the per-holding "daily dividend rate" estimate in get_user_stock_portfolio
-- to match the real payout formula.
--
-- Same drift already fixed on the marketplace preview
-- (20260811030000_fix_expected_dividend_preview_formula.sql) had never been
-- applied here: this column still used the pre-20260810 formula —
--   - a 1%-per-streak-day multiplier capped at day 100 (2x), instead of the
--     real 10%-per-streak-day capped at day 11 (2x);
--   - no stock-ownership boost at all, even though the real payout folds it
--     into the base before splitting across shares.
--
-- Rebuild it to mirror complete_habit_business's v_stock_boost /
-- v_streak_multiplier math and process_habit_completion_dividends' per-share
-- split (complete_income / total_shares_issued * shares_owned), using the
-- business's current streak in place of the not-yet-happened next
-- completion. Everything else in this function is byte-for-byte identical
-- to the live version (20260816020000_add_ramp_anchor_to_portfolio.sql).
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
        base_price NUMERIC,
        ramp_start_price NUMERIC,
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
        active_days INTEGER[]
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
    COALESCE(bt.base_cost * 0.1, 1) as base_price,
    COALESCE(bs.ramp_start_price, bs.current_stock_price) as ramp_start_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    -- Same base + stock-boost + streak-bonus math as complete_habit_business's
    -- v_total_earnings, split across total_shares_issued and scaled to this
    -- holding's shares, exactly like process_habit_completion_dividends.
    -- Minimum $0.01 per completion regardless of holding size.
    GREATEST(
        ROUND(
            (
                (
                    hb.earnings_per_completion + hb.earnings_per_completion * (
                        GREATEST(
                            0,
                            (COALESCE(bs.total_shares_issued, 100) - COALESCE(bs.shares_owned_by_owner, 100)) - COALESCE(bs.shares_available, 0)
                        )::NUMERIC / 100
                    )
                ) * (
                    1 + CASE
                        WHEN hb.streak > 0 THEN LEAST(hb.streak * 0.1, 1)
                        ELSE 0
                    END
                )
            ) * sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC,
            2
        ),
        0.01
    ) as daily_dividend_rate,
    hb.streak,
    hb.goal_value,
    hb.current_progress,
    hb.last_completed_at,
    hb.recurrence_interval,
    hb.active_days
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
