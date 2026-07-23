-- Migration: Add fields needed to compute a habit's "effective" (read-time
-- corrected) streak for friend/portfolio stock rows.
--
-- habit_businesses.streak is only ever zeroed out by completeHabit() (on the
-- owner's next completion) or the reset_outdated_habits() RPC (only run when
-- the owner opens Home) — so it can sit stale after a streak actually broke.
-- The Angular app now derives the true current streak client-side via
-- HabitIntervalService.getEffectiveStreak(), but that needs last_completed_at,
-- recurrence_interval and active_days (plus, for the portfolio RPC,
-- goal_value/current_progress) on the row — none of which the stock-facing
-- RPCs currently return. This migration adds just those columns; everything
-- else is left byte-for-byte identical to the live versions.
--
-- Run this in the Supabase SQL Editor.

-- get_friend_businesses_for_stocks: already returns goal_value/current_progress,
-- just needs last_completed_at/recurrence_interval/active_days added.
DROP FUNCTION IF EXISTS get_friend_businesses_for_stocks(UUID);
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
    -- Minimum $0.01 per share per completion regardless of pool size
    GREATEST(
        ROUND(
            (
                (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * CASE
                    WHEN hb.current_progress >= hb.goal_value THEN 1.5
                    ELSE 1
                END
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
ORDER BY hb.streak DESC,
    hb.business_name;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;

-- get_user_stock_portfolio: needs all five fields added (returns none of them today).
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
