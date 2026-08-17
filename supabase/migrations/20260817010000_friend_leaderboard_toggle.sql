-- Per-friend "show on my leaderboards" toggle.
--
-- Lets a user hide a specific friend from the leaderboards *they* view
-- (net worth, weekly cash earned, weekly habits completed) without
-- unfriending them or deleting any of their data — the friendship and all
-- of that friend's stats stay intact, so flipping the toggle back on later
-- makes them reappear. This is purely a viewer-side display preference:
-- it only affects what the toggling user sees, never what anyone else sees
-- (contrast with show_stocks/show_marketplace on this same table, which
-- gate what the *friend* is allowed to see/do). Defaults to visible (on)
-- for every friend — a missing row means "show", same convention as the
-- other two columns here.
--
-- The live leaderboards (net worth, and the current in-progress week for
-- cash/habits) are assembled client-side from SocialService.getFriends(),
-- so no RPC changes are needed there — the client filters using this new
-- column alongside show_stocks/show_marketplace. The historical/frozen
-- weekly leaderboard (get_weekly_leaderboard_history) computes its friend
-- group server-side, so it gets the same filter applied below, but only
-- for weeks not yet frozen for that viewer — already-frozen snapshots stay
-- immutable, consistent with this function's existing behavior.

ALTER TABLE friend_visibility_settings
    ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT true;

-- ─── get_weekly_leaderboard_history: exclude friends the viewer has hidden
-- from their leaderboards when computing a not-yet-frozen week. Byte-for-byte
-- identical to the live version (20260817000000_weekly_leaderboard_history.sql)
-- otherwise. ───
CREATE OR REPLACE FUNCTION get_weekly_leaderboard_history(
    p_metric TEXT,
    p_week_start TIMESTAMPTZ,
    p_week_end TIMESTAMPTZ
) RETURNS TABLE (
    ranked_user_id UUID,
    display_name TEXT,
    value NUMERIC,
    rank INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_viewer UUID := auth.uid();
BEGIN
    IF v_viewer IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF p_metric NOT IN ('cash_earned', 'habits_completed') THEN
        RAISE EXCEPTION 'Invalid metric: %', p_metric;
    END IF;
    IF p_week_end > NOW() THEN
        RAISE EXCEPTION 'Cannot snapshot a week that has not ended yet';
    END IF;

    -- Already frozen for this viewer — serve it back unchanged.
    IF EXISTS (
        SELECT 1 FROM weekly_leaderboard_snapshots s
        WHERE s.viewer_id = v_viewer AND s.week_start = p_week_start AND s.metric = p_metric
    ) THEN
        RETURN QUERY
        SELECT s.ranked_user_id, s.display_name, s.value, s.rank
        FROM weekly_leaderboard_snapshots s
        WHERE s.viewer_id = v_viewer AND s.week_start = p_week_start AND s.metric = p_metric
        ORDER BY s.rank;
        RETURN;
    END IF;

    -- First time this viewer has opened this week: compute it from the
    -- permanent completions log (self + current accepted friends who
    -- haven't been toggled off this viewer's leaderboards) and freeze it.
    -- ON CONFLICT guards a race between two concurrent first-opens.
    INSERT INTO weekly_leaderboard_snapshots (
        viewer_id, week_start, week_end, metric, ranked_user_id, display_name, value, rank
    )
    SELECT
        v_viewer,
        p_week_start,
        p_week_end,
        p_metric,
        totals.user_id,
        totals.name,
        totals.value,
        ROW_NUMBER() OVER (
            ORDER BY totals.value DESC, (totals.user_id <> v_viewer)
        )::INTEGER
    FROM (
        SELECT
            up.id AS user_id,
            up.name,
            COALESCE(
                CASE WHEN p_metric = 'cash_earned' THEN SUM(hc.earnings) ELSE COUNT(hc.id) END,
                0
            )::NUMERIC AS value
        FROM user_profiles up
        LEFT JOIN habit_completions hc
            ON hc.user_id = up.id
            AND hc.completed_at >= p_week_start
            AND hc.completed_at < p_week_end
        WHERE up.id = v_viewer
           OR (
                EXISTS (
                    SELECT 1 FROM friendships f
                    WHERE f.status = 'accepted'
                      AND (
                        (f.user_id = v_viewer AND f.friend_id = up.id)
                        OR (f.user_id = up.id AND f.friend_id = v_viewer)
                      )
                )
                AND NOT EXISTS (
                    SELECT 1 FROM friend_visibility_settings fvs
                    WHERE fvs.owner_id = v_viewer
                      AND fvs.friend_id = up.id
                      AND fvs.show_on_leaderboard = false
                )
           )
        GROUP BY up.id, up.name
    ) totals
    ON CONFLICT (viewer_id, week_start, metric, ranked_user_id) DO NOTHING;

    RETURN QUERY
    SELECT s.ranked_user_id, s.display_name, s.value, s.rank
    FROM weekly_leaderboard_snapshots s
    WHERE s.viewer_id = v_viewer AND s.week_start = p_week_start AND s.metric = p_metric
    ORDER BY s.rank;
END;
$$;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard_history(TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

NOTIFY pgrst, 'reload schema';
