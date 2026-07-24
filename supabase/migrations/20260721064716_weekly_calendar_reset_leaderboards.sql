-- Switch the weekly leaderboards from a rolling 7-day window to a fixed
-- calendar week, so they actually reset (client passes the start of the
-- user's current local week; falls back to a rolling 7-day window if omitted).

DROP FUNCTION IF EXISTS get_users_cash_earned(UUID [], TEXT);
CREATE OR REPLACE FUNCTION get_users_cash_earned(
        user_ids UUID [],
        period TEXT DEFAULT 'weekly', -- 'weekly' or 'monthly'
        week_start TIMESTAMPTZ DEFAULT NULL
    ) RETURNS TABLE (user_id UUID, total_earned NUMERIC) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE cutoff TIMESTAMP WITH TIME ZONE;
BEGIN
IF week_start IS NOT NULL THEN
    cutoff := week_start;
ELSIF period = 'monthly' THEN
    cutoff := NOW() - INTERVAL '30 days';
ELSE
    cutoff := NOW() - INTERVAL '7 days';
END IF;
RETURN QUERY
SELECT hc.user_id,
    COALESCE(SUM(hc.earnings), 0)::NUMERIC AS total_earned
FROM habit_completions hc
WHERE hc.user_id = ANY(user_ids)
    AND hc.completed_at >= cutoff
GROUP BY hc.user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION get_users_cash_earned(UUID [], TEXT, TIMESTAMPTZ) TO authenticated;

DROP FUNCTION IF EXISTS get_users_habits_completed(UUID []);
CREATE OR REPLACE FUNCTION get_users_habits_completed(
        user_ids UUID [],
        week_start TIMESTAMPTZ DEFAULT NULL
    ) RETURNS TABLE (user_id UUID, total_completed BIGINT) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE cutoff TIMESTAMP WITH TIME ZONE;
BEGIN
IF week_start IS NOT NULL THEN
    cutoff := week_start;
ELSE
    cutoff := NOW() - INTERVAL '7 days';
END IF;
RETURN QUERY
SELECT hc.user_id,
    COUNT(*)::BIGINT AS total_completed
FROM habit_completions hc
WHERE hc.user_id = ANY(user_ids)
    AND hc.completed_at >= cutoff
GROUP BY hc.user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION get_users_habits_completed(UUID [], TIMESTAMPTZ) TO authenticated;
