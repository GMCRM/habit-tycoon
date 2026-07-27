-- Atomic habit-completion RPC.
--
-- completeHabit() in habit-business.service.ts currently orchestrates a habit
-- completion as 5+ sequential, non-atomic client calls (fetch habit, insert
-- completion, update habit, dividends RPC, stock-price RPC, milestone RPC,
-- adjust_user_cash RPC). A failure partway through (most notably the final
-- cash-credit call) can leave a completion recorded with cash never
-- credited — see the 20260723211207 migration's own writeup of the
-- equivalent lost-update race on plain cash adjustments.
--
-- This function consolidates the whole flow into one Postgres transaction so
-- either all of it lands or none of it does, and locks the habit row
-- (FOR UPDATE) so a widget completion and an app completion racing the same
-- habit serialize instead of double-crediting. It's a straight port of
-- completeHabit()'s algorithm (period/streak resolution, stock-boost +
-- streak-bonus earnings math, duplicate-prevention checks), reusing the
-- existing dividend/stock-price/milestone/cash RPCs rather than
-- reimplementing them.
--
-- Local-midnight period boundaries are computed client-side today
-- (HabitIntervalService, device-local time) — Postgres has no notion of the
-- caller's device timezone, so the caller passes its IANA timezone name
-- (Intl.DateTimeFormat().resolvedOptions().timeZone on web,
-- TimeZone.current.identifier in the iOS widget) and boundaries are resolved
-- via `AT TIME ZONE` against that, matching the client's own local-midnight
-- semantics exactly (this deliberately differs from reset_outdated_habits(),
-- which uses UTC boundaries for its own, separate purpose).
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
    v_base_earnings NUMERIC;
    v_stock_boost NUMERIC := 0;
    v_boosted_base NUMERIC;
    v_streak_multiplier NUMERIC := 0;
    v_total_earnings NUMERIC;
    v_stock RECORD;
    v_completion_id UUID;
    v_candidate_dow INTEGER;
    v_candidate_start TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Lock the row for the duration of the transaction so a concurrent
    -- completion attempt (double-tap, widget racing the app) serializes
    -- instead of both reading the same stale current_progress/streak.
    SELECT * INTO v_habit
    FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found';
    END IF;

    -- Resolve interval — mirrors HabitIntervalService.resolveInterval.
    IF v_habit.recurrence_interval IN ('specific_days', '7d') THEN
        v_interval := 'specific_days';
    ELSIF v_habit.frequency = 'weekly' THEN
        v_interval := 'specific_days';
    ELSE
        v_interval := '24h';
    END IF;

    -- Current period start = the caller's local midnight, mirroring
    -- HabitIntervalService.getCurrentPeriodStart (same for both interval
    -- types today).
    v_period_start := date_trunc('day', p_occurred_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

    v_goal_value := COALESCE(v_habit.goal_value, 1);
    v_current_progress := COALESCE(v_habit.current_progress, 0);

    -- Stale progress from a prior period: treat as 0 for this attempt (the
    -- authoritative reset happens via reset_outdated_habits() on app-open;
    -- this is the same defensive guard completeHabit() has today).
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

    IF v_is_goal_completed THEN
        -- Previous period window — mirrors HabitIntervalService.getPreviousPeriodWindow:
        -- '24h' → [yesterday midnight, today midnight); 'specific_days' → the
        -- most recent previous active day, walking back up to 7 days.
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
                v_new_streak := v_habit.streak + 1; -- previous period's goal was met: streak continues
            ELSE
                v_new_streak := 1; -- previous period's goal was missed: streak resets
            END IF;
        ELSE
            v_new_streak := 1; -- first-ever completion, or no previous window to check
        END IF;
    END IF;

    -- Earnings — mirrors completeHabit()'s stock-boost + streak-bonus math.
    v_base_earnings := v_habit.earnings_per_completion;
    v_stock_boost := 0;
    IF v_is_goal_completed THEN
        SELECT * INTO v_stock FROM business_stocks WHERE habit_business_id = p_habit_business_id;
        IF FOUND THEN
            -- 1% of base pay per tradeable share actually purchased by investors
            v_stock_boost := v_base_earnings * (
                GREATEST(0, (v_stock.total_shares_issued - v_stock.shares_owned_by_owner) - v_stock.shares_available)::NUMERIC / 100
            );
        END IF;
    END IF;
    v_boosted_base := v_base_earnings + v_stock_boost;

    IF v_is_goal_completed AND v_new_streak > 1 THEN
        v_streak_multiplier := LEAST((v_new_streak - 1) * 0.1, 1); -- capped at +100%
    END IF;
    v_total_earnings := v_boosted_base + (v_boosted_base * v_streak_multiplier);

    INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at)
    VALUES (p_habit_business_id, v_user_id, v_total_earnings, v_new_streak, p_occurred_at)
    RETURNING id INTO v_completion_id;

    UPDATE habit_businesses
    SET current_progress = v_current_progress,
        total_completions = COALESCE(total_completions, 0) + 1,
        total_earnings = COALESCE(total_earnings, 0) + v_total_earnings,
        last_completed_at = p_occurred_at,
        updated_at = NOW(),
        streak = CASE WHEN v_is_goal_completed THEN v_new_streak ELSE streak END
    WHERE id = p_habit_business_id;

    IF v_is_goal_completed THEN
        -- Non-fatal side effects, matching completeHabit()'s existing
        -- behavior: a dividend/price/notification failure never blocks the
        -- completion itself.
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

        BEGIN
            PERFORM notify_friends_of_milestone(p_habit_business_id, v_user_id);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    -- Cash credit is the one fatal step, matching completeHabit()'s existing
    -- behavior — but because the whole function is one transaction, a
    -- failure here now rolls back the completion insert and habit update
    -- too, instead of leaving them committed with cash never credited
    -- (the actual bug this migration fixes).
    PERFORM adjust_user_cash(v_user_id, v_total_earnings);

    RETURN jsonb_build_object('earnings', v_total_earnings, 'streak', v_new_streak);
END;
$$;
GRANT EXECUTE ON FUNCTION complete_habit_business(UUID, TIMESTAMPTZ, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
