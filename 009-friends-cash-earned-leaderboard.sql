-- Function to aggregate habit cash earned per user for the leaderboard
-- Uses SECURITY DEFINER to bypass RLS so we can read friend completions
DROP FUNCTION IF EXISTS get_users_cash_earned(UUID [], TEXT);
CREATE OR REPLACE FUNCTION get_users_cash_earned(
        user_ids UUID [],
        period TEXT -- 'weekly' or 'monthly'
    ) RETURNS TABLE (user_id UUID, total_earned NUMERIC) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE cutoff TIMESTAMP WITH TIME ZONE;
BEGIN IF period = 'monthly' THEN cutoff := NOW() - INTERVAL '30 days';
ELSE -- Default to weekly
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
GRANT EXECUTE ON FUNCTION get_users_cash_earned(UUID [], TEXT) TO authenticated;