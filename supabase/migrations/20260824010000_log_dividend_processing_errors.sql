-- Every call site that pays stockholders (process_habit_completion_dividends,
-- process_joint_venture_streak_bonus_dividend) is wrapped in
-- `EXCEPTION WHEN OTHERS THEN NULL` so a dividend failure never blocks the
-- habit completion itself — but that also means a genuine bug in that path
-- (a bad column reference, a broken downstream function, anything) fails
-- completely silently: no error to the user, nothing in Postgres' logs,
-- just a dividend that quietly never happened. That's exactly the shape of
-- bug report that's impossible to diagnose without visibility into what
-- actually went wrong.
--
-- Fix: change `NULL` to `RAISE WARNING '...: %', SQLERRM` in the dividend
-- call sites only (every other swallowed exception in these functions —
-- update_stock_price_by_streak, notify_friends_of_milestone — is left as a
-- silent NULL, since those are cosmetic side effects, not money). This is
-- purely observability — habit completion still succeeds exactly as before
-- even when the dividend call fails; the only difference is the failure
-- now shows up in Supabase's Postgres logs (Dashboard → Logs → Postgres
-- Logs) instead of vanishing with zero trace.
--
-- complete_habit_business (live version:
-- 20260824000000_pay_dividends_on_every_completion_v2.sql) and
-- complete_habit_business_yesterday (live version:
-- 20260823000000_snapshot_business_type_on_completion.sql) are otherwise
-- byte-for-byte identical to their live versions.
CREATE OR REPLACE FUNCTION complete_habit_business(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit RECORD;
    v_interval TEXT;
    v_period_start TIMESTAMPTZ;
    v_previous_start TIMESTAMPTZ;
    v_previous_end TIMESTAMPTZ;
    v_current_progress INTEGER;
    v_goal_value INTEGER;
    v_is_goal_completed BOOLEAN;
    v_period_completions INTEGER;
    v_previous_period_count INTEGER;
    v_new_streak INTEGER;
    v_projected_streak INTEGER;
    v_base_earnings NUMERIC;
    v_stock_boost NUMERIC := 0;
    v_boosted_base NUMERIC;
    v_streak_multiplier NUMERIC := 0;
    v_total_earnings NUMERIC;
    v_stock RECORD;
    v_completion_id UUID;
    v_candidate_dow INTEGER;
    v_candidate_start TIMESTAMPTZ;
    v_business_type_name TEXT;
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
        RAISE EXCEPTION 'Use complete_joint_venture_checkin for joint venture businesses';
    END IF;

    IF v_habit.recurrence_interval IN ('specific_days', '7d') THEN
        v_interval := 'specific_days';
    ELSIF v_habit.frequency = 'weekly' THEN
        v_interval := 'specific_days';
    ELSE
        v_interval := '24h';
    END IF;

    v_period_start := date_trunc('day', p_occurred_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

    v_goal_value := COALESCE(v_habit.goal_value, 1);
    v_current_progress := COALESCE(v_habit.current_progress, 0);

    IF v_habit.last_completed_at IS NOT NULL AND v_habit.last_completed_at < v_period_start THEN
        v_current_progress := 0;
    END IF;

    IF v_current_progress >= v_goal_value THEN
        RAISE EXCEPTION 'Goal already completed! %/% done.', v_current_progress, v_goal_value;
    END IF;

    SELECT COUNT(*) INTO v_period_completions
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND completed_at >= v_period_start;

    IF v_period_completions >= v_goal_value THEN
        RAISE EXCEPTION 'Already completed %/% times this period.', v_period_completions, v_goal_value;
    END IF;

    v_current_progress := v_current_progress + 1;
    v_is_goal_completed := v_current_progress >= v_goal_value;
    v_new_streak := v_habit.streak;

    -- Project the streak this period is building toward. This lookback only
    -- reads the *previous* period's completions, so — unlike the streak
    -- itself — it's valid to compute on every tap of the day, not only the
    -- goal-completing one.
    v_previous_start := NULL;
    v_previous_end := NULL;

    IF v_interval = 'specific_days' THEN
        IF v_habit.active_days IS NOT NULL AND array_length(v_habit.active_days, 1) > 0 THEN
            FOR i IN 1..7 LOOP
                v_candidate_start := v_period_start - (i || ' days')::interval;
                v_candidate_dow := EXTRACT(DOW FROM v_candidate_start AT TIME ZONE p_client_timezone)::INTEGER;
                IF v_candidate_dow = ANY(v_habit.active_days) THEN
                    v_previous_start := v_candidate_start;
                    v_previous_end := v_previous_start + INTERVAL '1 day';
                    EXIT;
                END IF;
            END LOOP;
        END IF;
    ELSE
        v_previous_start := v_period_start - INTERVAL '1 day';
        v_previous_end := v_period_start;
    END IF;

    IF v_previous_start IS NOT NULL THEN
        SELECT COUNT(*) INTO v_previous_period_count
        FROM habit_completions
        WHERE habit_business_id = p_habit_business_id
          AND user_id = v_user_id
          AND completed_at >= v_previous_start
          AND completed_at < v_previous_end;

        IF v_previous_period_count >= v_goal_value THEN
            v_projected_streak := v_habit.streak + 1;
        ELSE
            v_projected_streak := 1;
        END IF;
    ELSE
        v_projected_streak := 1;
    END IF;

    -- The streak only "officially" advances once the day's goal is actually
    -- met — keep that persistence behavior exactly as before.
    IF v_is_goal_completed THEN
        v_new_streak := v_projected_streak;
    END IF;

    v_base_earnings := v_habit.earnings_per_completion;

    -- Stock boost and streak bonus are computed (and paid) on every
    -- completion, not gated behind v_is_goal_completed, so a multi-tap
    -- goal splits its full day's bonus evenly across all of its taps
    -- instead of dumping it all on the last one.
    SELECT * INTO v_stock FROM business_stocks WHERE habit_business_id = p_habit_business_id;
    IF FOUND THEN
        v_stock_boost := v_base_earnings * (
            GREATEST(0, (v_stock.total_shares_issued - v_stock.shares_owned_by_owner) - v_stock.shares_available)::NUMERIC / 100
        );
    ELSE
        v_stock_boost := 0;
    END IF;
    v_boosted_base := v_base_earnings + v_stock_boost;

    IF v_projected_streak > 1 THEN
        v_streak_multiplier := LEAST((v_projected_streak - 1) * 0.1, 1);
    ELSE
        v_streak_multiplier := 0;
    END IF;
    v_total_earnings := v_boosted_base + (v_boosted_base * v_streak_multiplier);

    SELECT name INTO v_business_type_name FROM business_types WHERE id = v_habit.business_type_id;

    INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at, business_type_name, business_icon)
    VALUES (p_habit_business_id, v_user_id, v_total_earnings, v_new_streak, p_occurred_at, COALESCE(v_business_type_name, 'Business'), COALESCE(v_habit.business_icon, '✅'))
    RETURNING id INTO v_completion_id;

    UPDATE habit_businesses
    SET current_progress = v_current_progress,
        total_completions = COALESCE(total_completions, 0) + 1,
        total_earnings = COALESCE(total_earnings, 0) + v_total_earnings,
        last_completed_at = p_occurred_at,
        updated_at = NOW(),
        streak = CASE WHEN v_is_goal_completed THEN v_new_streak ELSE streak END
    WHERE id = p_habit_business_id;

    -- Pay stockholders on every completion, not just the goal-completing
    -- one — this is the owner's per-tap earnings event, same as the payout
    -- above, and stockholders are entitled to their cut of every one of
    -- them, not just the last tap of the day.
    BEGIN
        PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'process_habit_completion_dividends failed for completion %: %', v_completion_id, SQLERRM;
    END;

    IF v_is_goal_completed THEN
        BEGIN
            PERFORM update_stock_price_by_streak(p_habit_business_id);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        BEGIN
            PERFORM notify_friends_of_milestone(p_habit_business_id, v_user_id);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    PERFORM adjust_user_cash(v_user_id, v_total_earnings);

    RETURN jsonb_build_object('earnings', v_total_earnings, 'streak', v_new_streak);
END;
$$;
GRANT EXECUTE ON FUNCTION complete_habit_business(UUID, TIMESTAMPTZ, TEXT) TO authenticated;

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
    v_business_type_name TEXT;
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

    v_completion_time := (v_yesterday_local + INTERVAL '18 hours') AT TIME ZONE p_client_timezone;

    SELECT name INTO v_business_type_name FROM business_types WHERE id = v_habit.business_type_id;

    BEGIN
        INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at, business_type_name, business_icon)
        VALUES (p_habit_business_id, v_user_id, v_total_earnings, v_new_streak, v_completion_time, COALESCE(v_business_type_name, 'Business'), COALESCE(v_habit.business_icon, '✅'))
        RETURNING id INTO v_completion_id;
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'This habit was already completed yesterday';
    END;

    UPDATE habit_businesses
    SET streak = v_new_streak,
        total_completions = COALESCE(total_completions, 0) + 1,
        total_earnings = COALESCE(total_earnings, 0) + v_total_earnings,
        last_completed_at = v_completion_time,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    BEGIN
        PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'process_habit_completion_dividends failed for completion %: %', v_completion_id, SQLERRM;
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

NOTIFY pgrst, 'reload schema';
