-- Fix the "Expected/Share" preview shown on stock cards to match the real
-- payout formula.
--
-- get_friend_businesses_for_stocks()'s potential_dividend column feeds the
-- "Expected/Share" figure on the Available Stocks card
-- (stocks-content.component.html). It was never updated when the actual
-- payout math in process_habit_completion_dividends() /
-- complete_habit_business() was rewritten across
-- 20260810010000_fix_dividend_per_share_formula.sql and
-- 20260811000000_include_streak_bonus_in_dividend_income.sql, so it has
-- drifted completely out of sync with what stockholders actually receive:
--   - It applies a 1% -per-streak-day multiplier capped at day 100 (2x);
--     the real payout applies 10%-per-streak-day capped at day 11 (2x).
--   - It applies a 1.5x "goal completed" bonus that doesn't exist anywhere
--     in the real payout — a completed goal only *gates* whether a
--     dividend is paid that day, it doesn't scale it.
--   - It never accounts for the stock-ownership boost (extra earnings from
--     shares already sold to investors), which the real payout folds in
--     before splitting across shares.
--
-- Rebuild potential_dividend to mirror complete_habit_business's
-- v_stock_boost / v_streak_multiplier / v_total_earnings math exactly
-- (using the business's *current* streak in place of the post-completion
-- projected streak, since projecting today's not-yet-happened completion
-- isn't available to a pure preview query), then divide by
-- total_shares_issued exactly like process_habit_completion_dividends does.
-- Everything else in this function is byte-for-byte identical to the live
-- version (20260807060000_joint_venture_stock_exclusion.sql).
CREATE OR REPLACE FUNCTION get_friend_businesses_for_stocks(user_uuid UUID) RETURNS TABLE (
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_id UUID,
        owner_name TEXT,
        streak INTEGER,
        frequency TEXT,
        goal_value INTEGER,
        current_progress INTEGER,
        earnings_per_completion NUMERIC,
        stock_id UUID,
        stock_price NUMERIC,
        base_price NUMERIC,
        price_multiplier NUMERIC,
        shares_available INTEGER,
        total_shares INTEGER,
        potential_dividend NUMERIC,
        last_completed_at TIMESTAMPTZ,
        recurrence_interval TEXT,
        active_days INTEGER[]
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT hb.id,
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    hb.user_id,
    up.name,
    hb.streak,
    hb.frequency,
    hb.goal_value,
    hb.current_progress,
    hb.earnings_per_completion,
    bs.id as stock_id,
    COALESCE(
        bs.current_stock_price,
        COALESCE(hb.earnings_per_completion, 1) * COALESCE(bs.price_multiplier, 1)
    ) as stock_price,
    COALESCE(hb.earnings_per_completion, 1) as base_price,
    bs.price_multiplier,
    bs.shares_available,
    bs.total_shares_issued,
    -- Same base + stock-boost + streak-bonus math as complete_habit_business's
    -- v_total_earnings, split across total_shares_issued exactly like
    -- process_habit_completion_dividends. Minimum $0.01 per share regardless
    -- of pool size.
    GREATEST(
        ROUND(
            (
                (
                    COALESCE(hb.earnings_per_completion, 1) + COALESCE(hb.earnings_per_completion, 1) * (
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
            ) / COALESCE(NULLIF(bs.total_shares_issued, 0), 100),
            2
        ),
        0.01
    ) as potential_dividend,
    hb.last_completed_at,
    hb.recurrence_interval,
    hb.active_days
FROM habit_businesses hb
    INNER JOIN user_profiles up ON hb.user_id = up.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id -- Add join for business type
    LEFT JOIN business_stocks bs ON hb.id = bs.habit_business_id
    INNER JOIN friendships f ON (
        f.user_id = user_uuid
        AND f.friend_id = hb.user_id
    )
    OR (
        f.friend_id = user_uuid
        AND f.user_id = hb.user_id
    )
WHERE hb.is_active = true
    AND hb.user_id != user_uuid -- Don't show user's own businesses
    AND f.status = 'accepted' -- Only friends
    AND (
        bs.shares_available > 0
        OR bs.shares_available IS NULL
    ) -- Available shares or no stock created yet
    -- Joint venture: exclude if the viewer is themselves a co-owner of this
    -- business (no-op for non-JV businesses — zero business_co_owners rows).
    AND NOT EXISTS (
        SELECT 1 FROM business_co_owners bco
        WHERE bco.habit_business_id = hb.id AND bco.user_id = user_uuid
    )
ORDER BY hb.streak DESC,
    hb.business_name;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
