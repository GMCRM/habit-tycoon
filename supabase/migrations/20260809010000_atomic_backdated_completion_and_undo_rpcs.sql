-- Replace the non-atomic, multi-step client-side flows in
-- completeHabitYesterday() and undoHabitCompletion() (habit-business.service.ts)
-- with single atomic RPCs, mirroring the pattern complete_habit_business already
-- uses (see 20260807050000_joint_venture_checkin.sql:266). The old flows did
-- 4-6 sequential, independently-awaited Supabase calls each; a partial failure
-- mid-sequence (e.g. the stock-price-update RPC failing after cash was already
-- paid, or the completion-delete failing after cash/stats were already reversed
-- on undo) could leave stock price/dividends/completion-row state inconsistent
-- with what was actually paid out.

CREATE OR REPLACE FUNCTION complete_habit_business_yesterday(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit RECORD;
    v_interval TEXT;
    v_now_local TIMESTAMP;
    v_today_local TIMESTAMP;
    v_yesterday_local TIMESTAMP;
    v_today_start TIMESTAMPTZ;
    v_yesterday_start TIMESTAMPTZ;
    v_day_before_yesterday_start TIMESTAMPTZ;
    v_previous_period_start TIMESTAMPTZ;
    v_yesterday_dow INTEGER;
    v_candidate_dow INTEGER;
    v_candidate_local TIMESTAMP;
    v_existing_count INTEGER;
    v_new_streak INTEGER;
    v_base_earnings NUMERIC;
    v_stock_boost NUMERIC := 0;
    v_boosted_base NUMERIC;
    v_streak_multiplier NUMERIC := 0;
    v_total_earnings NUMERIC;
    v_stock RECORD;
    v_completion_id UUID;
    v_completion_time TIMESTAMPTZ;
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

    IF v_habit.is_joint_venture THEN
        RAISE EXCEPTION 'Backdated completion is not available for joint ventures';
    END IF;

    -- Backdating is only offered in the UI for goal_value = 1 habits (see
    -- HabitIntervalService.didMissYesterday) — enforced here too as defense
    -- in depth, matching complete_habit_business's own re-validation of
    -- things the client already gates.
    IF COALESCE(v_habit.goal_value, 1) != 1 THEN
        RAISE EXCEPTION 'Backdated completion is only available for once-per-period habits';
    END IF;

    IF v_habit.recurrence_interval IN ('specific_days', '7d') THEN
        v_interval := 'specific_days';
    ELSIF v_habit.frequency = 'weekly' THEN
        v_interval := 'specific_days';
    ELSE
        v_interval := '24h';
    END IF;

    -- All calendar-day arithmetic below happens on a *naive* local timestamp
    -- (v_now_local) rather than directly on TIMESTAMPTZ values. Subtracting/
    -- adding INTERVAL 'N days' on a TIMESTAMPTZ is resolved using the
    -- session's TimeZone GUC (UTC on Supabase), NOT p_client_timezone -- so
    -- on a DST-transition day in the caller's zone it silently subtracts a
    -- literal 24h instead of that zone's actual (23h/25h) calendar day, and
    -- re-truncating that already-wrong instant can land on the wrong *day*
    -- entirely. `timestamp` (no zone) arithmetic has no such dependency.
    -- We convert back to TIMESTAMPTZ exactly once per boundary, right where
    -- it's needed for a `completed_at` comparison or for storage.
    v_now_local := p_occurred_at AT TIME ZONE p_client_timezone;
    v_today_local := date_trunc('day', v_now_local);
    v_yesterday_local := v_today_local - INTERVAL '1 day';

    v_today_start := v_today_local AT TIME ZONE p_client_timezone;
    v_yesterday_start := v_yesterday_local AT TIME ZONE p_client_timezone;
    v_day_before_yesterday_start := (v_yesterday_local - INTERVAL '1 day') AT TIME ZONE p_client_timezone;

    IF v_interval = 'specific_days' THEN
        v_yesterday_dow := EXTRACT(DOW FROM v_yesterday_local)::INTEGER;
        IF v_habit.active_days IS NULL OR NOT (v_yesterday_dow = ANY(v_habit.active_days)) THEN
            RAISE EXCEPTION 'Yesterday was not a scheduled day for this habit';
        END IF;
    END IF;

    SELECT COUNT(*) INTO v_existing_count
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND completed_at >= v_yesterday_start
      AND completed_at < v_today_start;

    IF v_existing_count > 0 THEN
        RAISE EXCEPTION 'This habit was already completed yesterday';
    END IF;

    -- Streak: was the previous due period (the day before yesterday for
    -- '24h', or the most recent active day before yesterday for
    -- 'specific_days') completed?
    IF v_interval = 'specific_days' THEN
        v_previous_period_start := NULL;
        IF v_habit.active_days IS NOT NULL AND array_length(v_habit.active_days, 1) > 0 THEN
            FOR i IN 1..7 LOOP
                v_candidate_local := v_yesterday_local - (i || ' days')::interval;
                v_candidate_dow := EXTRACT(DOW FROM v_candidate_local)::INTEGER;
                IF v_candidate_dow = ANY(v_habit.active_days) THEN
                    v_previous_period_start := v_candidate_local AT TIME ZONE p_client_timezone;
                    EXIT;
                END IF;
            END LOOP;
        END IF;
        IF v_previous_period_start IS NULL THEN
            v_previous_period_start := v_day_before_yesterday_start;
        END IF;
    ELSE
        v_previous_period_start := v_day_before_yesterday_start;
    END IF;

    v_new_streak := 1;
    IF v_habit.last_completed_at IS NOT NULL
       AND v_habit.last_completed_at >= v_previous_period_start
       AND v_habit.last_completed_at < v_yesterday_start THEN
        v_new_streak := COALESCE(v_habit.streak, 0) + 1;
    END IF;

    -- Earnings at yesterday's rate: stock ownership boost applied to base pay
    -- first (1% per tradeable share actually purchased by investors), then
    -- the streak bonus on top of the boosted base (capped +100%).
    v_base_earnings := v_habit.earnings_per_completion;
    SELECT * INTO v_stock FROM business_stocks WHERE habit_business_id = p_habit_business_id;
    IF FOUND THEN
        v_stock_boost := v_base_earnings * (
            GREATEST(0, (v_stock.total_shares_issued - v_stock.shares_owned_by_owner) - v_stock.shares_available)::NUMERIC / 100
        );
    END IF;
    v_boosted_base := v_base_earnings + v_stock_boost;

    IF v_new_streak > 1 THEN
        v_streak_multiplier := LEAST((v_new_streak - 1) * 0.1, 1);
    END IF;
    v_total_earnings := v_boosted_base + (v_boosted_base * v_streak_multiplier);

    -- Completion timestamp = yesterday at 6pm in the client's local time,
    -- matching the JS implementation this replaces.
    v_completion_time := (v_yesterday_local + INTERVAL '18 hours') AT TIME ZONE p_client_timezone;

    BEGIN
        INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at)
        VALUES (p_habit_business_id, v_user_id, v_total_earnings, v_new_streak, v_completion_time)
        RETURNING id INTO v_completion_id;
    EXCEPTION WHEN unique_violation THEN
        -- Defense-in-depth mirror of the legacy JS's explicit 23505 handling
        -- (habit-business.service.ts). No unique constraint currently exists
        -- on habit_completions (see 20260224201656_rollback_unique_constraint.sql)
        -- but keep this in case one is reintroduced.
        RAISE EXCEPTION 'This habit was already completed yesterday';
    END;

    -- current_progress is NOT touched — it tracks the *current* (today's) period.
    UPDATE habit_businesses
    SET streak = v_new_streak,
        total_completions = COALESCE(total_completions, 0) + 1,
        total_earnings = COALESCE(total_earnings, 0) + v_total_earnings,
        last_completed_at = v_completion_time,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    BEGIN
        PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost);
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    BEGIN
        PERFORM update_stock_price_by_streak(p_habit_business_id);
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    PERFORM adjust_user_cash(v_user_id, v_total_earnings);

    RETURN jsonb_build_object('earnings', v_total_earnings, 'streak', v_new_streak);
END;
$$;
GRANT EXECUTE ON FUNCTION complete_habit_business_yesterday(UUID, TIMESTAMPTZ, TEXT) TO authenticated;


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

    v_new_current_progress := GREATEST(0, COALESCE(v_habit.current_progress, 0) - 1);

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
