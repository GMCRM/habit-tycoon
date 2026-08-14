-- Fix undo_habit_business_completion() displaying a streak of 0 right after
-- undoing a completion, even when the habit had a real ongoing streak before
-- today's (mistaken) tap.
--
-- Root cause: current_progress is meant to always hold the completion tally
-- for whatever period last_completed_at falls in (both complete_habit_business
-- and complete_habit_business_yesterday keep that invariant). The undo RPC
-- broke it: when the undone completion was the only one in today's period and
-- an earlier completion exists, last_completed_at correctly rewinds to that
-- earlier completion's timestamp -- but current_progress was simply
-- old_progress - 1 (i.e. 0), which describes *today's* now-empty period, not
-- the earlier period last_completed_at now points to.
--
-- The client's getEffectiveStreak() (habit-interval.service.ts) relies on that
-- invariant to decide whether the *previous* period's goal was actually met
-- when the stored streak looks stale: current_progress >= goal_value. With the
-- invariant broken, it read "0 >= goal_value" as false and displayed a streak
-- of 0 instead of the real, restored streak value.
--
-- Fix: recompute current_progress from the actual completion rows in the
-- period containing the new last_completed_at, instead of blindly
-- decrementing the old value.
CREATE OR REPLACE FUNCTION undo_habit_business_completion(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit RECORD;
    v_now_local TIMESTAMP;
    v_today_local TIMESTAMP;
    v_today_start TIMESTAMPTZ;
    v_today_end TIMESTAMPTZ;
    v_completion RECORD;
    v_previous_completed_at TIMESTAMPTZ;
    v_goal_value INTEGER;
    v_was_goal_completing_tap BOOLEAN;
    v_previous_streak INTEGER;
    v_new_current_progress INTEGER;
    v_progress_period_start TIMESTAMPTZ;
    v_progress_period_end TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    SELECT * INTO v_habit
    FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found';
    END IF;

    -- The UI never sends joint-venture rows through this path (the undo
    -- button is hidden for JV cards — home.page.html) but re-validate here
    -- anyway, matching complete_habit_business's own defense-in-depth style.
    IF v_habit.is_joint_venture THEN
        RAISE EXCEPTION 'Use the joint-venture check-in undo flow for this business';
    END IF;

    v_now_local := p_occurred_at AT TIME ZONE p_client_timezone;
    v_today_local := date_trunc('day', v_now_local);
    v_today_start := v_today_local AT TIME ZONE p_client_timezone;
    v_today_end := (v_today_local + INTERVAL '1 day') AT TIME ZONE p_client_timezone;

    IF v_habit.last_completed_at IS NULL
       OR v_habit.last_completed_at < v_today_start
       OR v_habit.last_completed_at >= v_today_end THEN
        RAISE EXCEPTION 'No completion found for today to undo';
    END IF;

    SELECT * INTO v_completion
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND completed_at >= v_today_start
      AND completed_at < v_today_end
    ORDER BY completed_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Could not find today''s completion record';
    END IF;

    -- Only decrement the streak if today's completion was the one that
    -- actually reached goal_value — undoing an earlier, partial-progress tap
    -- on a multi-completion habit must leave the streak untouched.
    v_goal_value := COALESCE(v_habit.goal_value, 1);
    v_was_goal_completing_tap := COALESCE(v_habit.current_progress, 0) >= v_goal_value;
    v_previous_streak := CASE WHEN v_was_goal_completing_tap
        THEN GREATEST(0, COALESCE(v_habit.streak, 0) - 1)
        ELSE v_habit.streak END;

    -- Find the previous completion to set as the new last_completed_at (NULL
    -- if this was the only completion ever).
    SELECT completed_at INTO v_previous_completed_at
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND id != v_completion.id
    ORDER BY completed_at DESC
    LIMIT 1;

    -- current_progress must reflect the tally for whichever period
    -- v_previous_completed_at now falls in — which may be an earlier day than
    -- today if this was the only completion today. Recompute it from the
    -- actual remaining rows in that period rather than assuming it's still
    -- today's (now decremented) progress.
    IF v_previous_completed_at IS NULL THEN
        v_new_current_progress := 0;
    ELSE
        v_progress_period_start := date_trunc('day', v_previous_completed_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
        v_progress_period_end := v_progress_period_start + INTERVAL '1 day';

        SELECT COUNT(*) INTO v_new_current_progress
        FROM habit_completions
        WHERE habit_business_id = p_habit_business_id
          AND user_id = v_user_id
          AND id != v_completion.id
          AND completed_at >= v_progress_period_start
          AND completed_at < v_progress_period_end;
    END IF;

    UPDATE habit_businesses
    SET streak = v_previous_streak,
        current_progress = v_new_current_progress,
        total_completions = GREATEST(0, COALESCE(total_completions, 0) - 1),
        total_earnings = GREATEST(0, COALESCE(total_earnings, 0) - v_completion.earnings),
        last_completed_at = v_previous_completed_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    -- Not clamped to 0 -- intentional: if the earnings were already spent,
    -- undo must still remove the full amount (even negative) so purchases
    -- made with them aren't left unpaid for.
    PERFORM adjust_user_cash(v_user_id, -v_completion.earnings);

    -- Unlike the old JS (which swallowed a delete failure here because, by
    -- this point in the old non-atomic flow, cash/stats had already been
    -- irrevocably committed as separate prior statements), a failure here
    -- now rolls back the entire transaction — either the full undo succeeds,
    -- or none of it does, instead of leaving a stale completion row behind
    -- while cash/stats were already reversed.
    DELETE FROM habit_completions WHERE id = v_completion.id;

    RETURN jsonb_build_object('earnings', v_completion.earnings);
END;
$$;
GRANT EXECUTE ON FUNCTION undo_habit_business_completion(UUID, TIMESTAMPTZ, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
