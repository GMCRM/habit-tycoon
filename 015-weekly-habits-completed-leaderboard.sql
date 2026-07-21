-- Function to count habits completed per user in the trailing 7 days, for the leaderboard
-- Uses SECURITY DEFINER to bypass RLS so we can read friend completions
DROP FUNCTION IF EXISTS get_users_habits_completed(UUID []);
CREATE OR REPLACE FUNCTION get_users_habits_completed(user_ids UUID []) RETURNS TABLE (user_id UUID, total_completed BIGINT) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT hc.user_id,
    COUNT(*)::BIGINT AS total_completed
FROM habit_completions hc
WHERE hc.user_id = ANY(user_ids)
    AND hc.completed_at >= NOW() - INTERVAL '7 days'
GROUP BY hc.user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION get_users_habits_completed(UUID []) TO authenticated;
