-- Weekly leaderboard history: let a user page back through past weeks'
-- cash-earned / habits-completed leaderboards and see how they ranked.
--
-- The existing weekly leaderboards (get_users_cash_earned / get_users_habits_completed,
-- see 20260721064716_weekly_calendar_reset_leaderboards.sql) only ever answer
-- "since week_start until now" — there's no upper bound, so they can't
-- reconstruct what a past week looked like once the current date has moved
-- past it. This migration adds a real per-viewer snapshot table plus a
-- lazy-compute-and-freeze RPC:
--
--   * The first time a viewer opens a given past week, its leaderboard is
--     computed from the permanent habit_completions log (bounded by both
--     week_start and week_end this time) against that viewer's CURRENT
--     accepted-friend group, and the result is frozen into
--     weekly_leaderboard_snapshots.
--   * Every subsequent open of that same week, for that same viewer, just
--     reads the frozen rows back — so it never drifts even if friends are
--     later added/removed or a completion is undone.
--
-- This project has no scheduler/cron (see the note in
-- 20260724070000_weekly_leaderboard_achievements.sql), so there's no
-- server-side moment when "the week ends" to proactively snapshot at —
-- snapshotting lazily on first view is the same pragmatic pattern already
-- used elsewhere (e.g. reset_outdated_daily_habits() firing on app load).
--
-- The friend group is necessarily "whoever the viewer is friends with the
-- first time they check", not a true historical friend-group-at-the-time —
-- friendships aren't logged with enough history to reconstruct that, and
-- this is an accepted tradeoff consistent with get_weekly_receipt's own
-- caveats. The current (in-progress) week is never snapshotted — it keeps
-- using the live get_users_cash_earned / get_users_habits_completed RPCs,
-- unchanged, since it's still accruing.
--
-- Net worth is intentionally excluded: unlike cash-earned/habits-completed,
-- it isn't derived from an append-only log (business/stock values change in
-- place), so there is no way to recompute what it was in a past week.

CREATE TABLE IF NOT EXISTS weekly_leaderboard_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    viewer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    week_start TIMESTAMPTZ NOT NULL,
    week_end TIMESTAMPTZ NOT NULL,
    metric TEXT NOT NULL CHECK (metric IN ('cash_earned', 'habits_completed')),
    ranked_user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    display_name TEXT NOT NULL,
    value NUMERIC NOT NULL,
    rank INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (viewer_id, week_start, metric, ranked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_leaderboard_snapshots_lookup
    ON weekly_leaderboard_snapshots(viewer_id, week_start, metric);

ALTER TABLE weekly_leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own leaderboard snapshots" ON weekly_leaderboard_snapshots;
CREATE POLICY "Users can view their own leaderboard snapshots"
    ON weekly_leaderboard_snapshots FOR SELECT
    USING (auth.uid() = viewer_id);
-- No INSERT/UPDATE/DELETE policy for regular users — rows are only ever
-- written by the SECURITY DEFINER function below.

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
    -- permanent completions log (self + current accepted friends) and freeze
    -- it. ON CONFLICT guards a race between two concurrent first-opens.
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
           OR EXISTS (
                SELECT 1 FROM friendships f
                WHERE f.status = 'accepted'
                  AND (
                    (f.user_id = v_viewer AND f.friend_id = up.id)
                    OR (f.user_id = up.id AND f.friend_id = v_viewer)
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
