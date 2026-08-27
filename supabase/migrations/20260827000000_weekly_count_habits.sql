-- Add a third habit schedule: 'weekly_count' — "do this X times this week,
-- any days you like" — without the exploit a naive version would allow.
--
-- The existing schedule types ('24h', 'specific_days') both use a one-day
-- period, so `goal_value` completions in a period always take at least
-- `goal_value` real days for a specific_days habit (one per active day) or
-- exactly 1 day for a '24h' habit. A weekly goal with a 7-day period has no
-- such floor: nothing stops a user from tapping Complete `goal_value` times
-- in one sitting on day 1 and collecting a full week's earnings instantly,
-- then using the existing sell-and-rebuy loop (deleteHabitBusiness ->
-- Marketplace listing -> buy a fresh habit) to repeat that "instant week"
-- faster than a real week passes.
--
-- Two guards close this, both extending patterns already used elsewhere in
-- this schema rather than inventing new ones:
--
-- 1. Day cap: complete_habit_business() rejects a second completion attempt
--    on the same local calendar day for a 'weekly_count' habit, the same
--    way it already rejects a tap once the period's goal is fully met.
--    Since this guarantees at most one completion row per day, the existing
--    "count completions since period_start >= goal_value" check keeps
--    working unmodified once period_start is the start of the calendar
--    week instead of the start of the day — a completion row *is* a
--    distinct day, so no separate distinct-day counting is needed.
--
-- 2. Anti-churn: create_marketplace_listing() blocks selling a
--    'weekly_count' habit until its first calendar week has fully elapsed,
--    mirroring this function's own existing "loss penalty to prevent
--    exploitation" framing (habit-business.service.ts's deleteHabitBusiness
--    doc comment) — selling early would otherwise let a user front-load one
--    week's goal, sell, and rebuy to shorten the real 7-day cadence.
--
-- Backdated completion (complete_habit_business_yesterday) and undo
-- (undo_habit_business_completion) both assume a one-day period elsewhere
-- in their logic; backdating is explicitly out of scope for this schedule
-- type for now (rejected with a clear message) rather than half-generalized,
-- while undo gets the minimal period-boundary branch it needs, since the
-- day cap above guarantees at most one completion per day either way.

-- ─── 1. Allow the new recurrence_interval value ───
ALTER TABLE habit_businesses
DROP CONSTRAINT IF EXISTS habit_businesses_recurrence_interval_check;

ALTER TABLE habit_businesses
ADD CONSTRAINT habit_businesses_recurrence_interval_check
CHECK (recurrence_interval IN ('24h', 'specific_days', 'weekly_count'));

-- ─── 2. complete_habit_business(): week-long period + same-day cap ───
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
    v_day_start TIMESTAMPTZ;
    v_previous_start TIMESTAMPTZ;
    v_previous_end TIMESTAMPTZ;
    v_current_progress INTEGER;
    v_goal_value INTEGER;
    v_is_goal_completed BOOLEAN;
    v_period_completions INTEGER;
    v_today_completions INTEGER;
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

    IF v_habit.recurrence_interval = 'weekly_count' THEN
        v_interval := 'weekly_count';
    ELSIF v_habit.recurrence_interval IN ('specific_days', '7d') THEN
        v_interval := 'specific_days';
    ELSIF v_habit.frequency = 'weekly' THEN
        v_interval := 'specific_days';
    ELSE
        v_interval := '24h';
    END IF;

    v_day_start := date_trunc('day', p_occurred_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

    IF v_interval = 'weekly_count' THEN
        v_period_start := date_trunc('week', p_occurred_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
    ELSE
        v_period_start := v_day_start;
    END IF;

    v_goal_value := COALESCE(v_habit.goal_value, 1);
    v_current_progress := COALESCE(v_habit.current_progress, 0);

    IF v_habit.last_completed_at IS NOT NULL AND v_habit.last_completed_at < v_period_start THEN
        v_current_progress := 0;
    END IF;

    IF v_current_progress >= v_goal_value THEN
        RAISE EXCEPTION 'Goal already completed! %/% done.', v_current_progress, v_goal_value;
    END IF;

    -- Same-day cap for 'weekly_count' only: at most one completion per local
    -- calendar day, checked before the period-completions check below so a
    -- second tap the same day gets this friendlier, more specific message
    -- instead of "0/3 already completed this period".
    IF v_interval = 'weekly_count' THEN
        SELECT COUNT(*) INTO v_today_completions
        FROM habit_completions
        WHERE habit_business_id = p_habit_business_id
          AND user_id = v_user_id
          AND completed_at >= v_day_start;

        IF v_today_completions >= 1 THEN
            RAISE EXCEPTION 'Already logged today — come back tomorrow to log another day toward your weekly goal.';
        END IF;
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

    IF v_interval = 'weekly_count' THEN
        v_previous_start := v_period_start - INTERVAL '7 days';
        v_previous_end := v_period_start;
    ELSIF v_interval = 'specific_days' THEN
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

    -- Clear any outstanding "do your habit!" reminders this user was sent
    -- for this habit — they just did it, so the nudge no longer applies.
    DELETE FROM social_pokes
    WHERE type = 'stockholder_reminder'
      AND to_user_id = v_user_id
      AND (metadata->>'habit_business_id')::UUID = p_habit_business_id;

    -- Pay stockholders on every completion, not just the goal-completing
    -- one — this is the owner's per-tap earnings event, same as the payout
    -- above, and stockholders are entitled to their cut of every one of
    -- them, not just the last tap of the day.
    BEGIN
        PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
    EXCEPTION WHEN OTHERS THEN
        NULL;
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

-- ─── 3. reset_outdated_habits(): week rollover for 'weekly_count' ───
CREATE OR REPLACE FUNCTION reset_outdated_habits(
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS TABLE (
    id UUID,
    business_name TEXT,
    streak INTEGER,
    was_completed BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    habit_record RECORD;
    now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    FOR habit_record IN
        SELECT
            hb.id,
            hb.business_name,
            hb.recurrence_interval,
            hb.active_days,
            hb.goal_value,
            hb.current_progress,
            hb.streak,
            hb.last_completed_at
        FROM habit_businesses hb
        WHERE hb.user_id = auth.uid()
          AND hb.is_active = true
          AND hb.current_progress > 0
    LOOP
        DECLARE
            period_start TIMESTAMP WITH TIME ZONE;
            goal_was_met BOOLEAN;
            today_dow    INTEGER;
        BEGIN
            IF habit_record.recurrence_interval = 'weekly_count' THEN
                period_start := date_trunc('week', now_ts AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

            ELSIF habit_record.recurrence_interval = '24h' THEN
                period_start := date_trunc('day', now_ts AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

            ELSIF habit_record.recurrence_interval = 'specific_days' THEN
                today_dow := EXTRACT(DOW FROM now_ts AT TIME ZONE p_client_timezone)::INTEGER;
                -- Skip if today is not in the habit's active days
                IF habit_record.active_days IS NULL
                   OR NOT (today_dow = ANY(habit_record.active_days)) THEN
                    CONTINUE;
                END IF;
                -- Active day: treat period like a daily period (local midnight)
                period_start := date_trunc('day', now_ts AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

            ELSE
                CONTINUE; -- Unknown interval — skip
            END IF;

            -- Only process if the last completion predates the current period start
            IF habit_record.last_completed_at IS NULL
               OR habit_record.last_completed_at < period_start THEN

                goal_was_met := habit_record.current_progress >= habit_record.goal_value;

                IF goal_was_met THEN
                    -- Period completed: preserve streak, reset progress
                    UPDATE habit_businesses
                    SET current_progress = 0,
                        updated_at = now_ts
                    WHERE id = habit_record.id;
                ELSE
                    -- Period missed with partial progress: break streak, reset progress
                    UPDATE habit_businesses
                    SET current_progress = 0,
                        streak = 0,
                        updated_at = now_ts
                    WHERE id = habit_record.id;
                END IF;

                id            := habit_record.id;
                business_name := habit_record.business_name;
                streak        := CASE WHEN goal_was_met THEN habit_record.streak ELSE 0 END;
                was_completed := goal_was_met;
                RETURN NEXT;
            END IF;
        END;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION reset_outdated_habits(TEXT) TO authenticated;

-- ─── 4. undo_habit_business_completion(): week-scoped progress recompute ───
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
    -- v_previous_completed_at now falls in — which may be an earlier day (or,
    -- for 'weekly_count', an earlier week) than today if this was the only
    -- completion today. Recompute it from the actual remaining rows in that
    -- period rather than assuming it's still today's (now decremented)
    -- progress. A 'weekly_count' habit can have at most one completion per
    -- calendar day (enforced in complete_habit_business), so counting rows
    -- in the week window is equivalent to counting distinct completed days.
    IF v_previous_completed_at IS NULL THEN
        v_new_current_progress := 0;
    ELSE
        IF v_habit.recurrence_interval = 'weekly_count' THEN
            v_progress_period_start := date_trunc('week', v_previous_completed_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
            v_progress_period_end := v_progress_period_start + INTERVAL '7 days';
        ELSE
            v_progress_period_start := date_trunc('day', v_previous_completed_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
            v_progress_period_end := v_progress_period_start + INTERVAL '1 day';
        END IF;

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

-- ─── 5. complete_habit_business_yesterday(): explicitly out of scope for 'weekly_count' ───
-- Backdating a single day doesn't map cleanly onto a week-long goal without
-- generalizing this function's day-only period math too — rejected with a
-- clear message instead of a half-correct implementation. Otherwise
-- unchanged from the prior version (20260824010000_log_dividend_processing_
-- errors.sql), just with the new guard added right after the existing
-- joint-venture guard, before the goal_value/interval resolution that would
-- otherwise silently mis-treat a 1x/week habit as a plain daily one.
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

    IF v_habit.recurrence_interval = 'weekly_count' THEN
        RAISE EXCEPTION 'Backdated completion is not available for weekly habits yet.';
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

-- ─── 6. create_marketplace_listing(): minimum one-week hold for 'weekly_count' ───
-- Blocks the anti-churn loophole: without this, a user could front-load one
-- week's goal on day 1, sell that same day (or the next) via the existing
-- Marketplace flow, and immediately buy a fresh habit to repeat the
-- front-load — collecting many "weeks" of pay within a single real week.
CREATE OR REPLACE FUNCTION create_marketplace_listing(
    p_user_id UUID,
    p_habit_business_id UUID,
    p_reason TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_business habit_businesses%ROWTYPE;
    v_base_sell_value NUMERIC;
    v_listing_price NUMERIC;
    v_prev_listed_at TIMESTAMPTZ;
    v_listed_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
    v_earliest_sell_at TIMESTAMPTZ;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    IF p_reason NOT IN ('upgrade', 'habit_deletion') THEN
        RAISE EXCEPTION 'Invalid reason';
    END IF;

    SELECT * INTO v_business FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = p_user_id;

    IF v_business.id IS NULL THEN
        RAISE EXCEPTION 'Habit business not found or not owned by user';
    END IF;

    -- Uses the database session's timezone (UTC) rather than the seller's
    -- local timezone — this RPC isn't passed one, and unlike the payout math
    -- in complete_habit_business() this is only a coarse anti-churn floor,
    -- not something that needs to line up with the user's own midnight to
    -- the hour. Off by at most a few hours around the boundary either way.
    IF v_business.recurrence_interval = 'weekly_count' THEN
        v_earliest_sell_at := date_trunc('week', v_business.created_at) + INTERVAL '7 days';
        IF NOW() < v_earliest_sell_at THEN
            RAISE EXCEPTION 'This weekly habit can''t be sold until its first week ends on %. Give it a full week before deciding.', to_char(v_earliest_sell_at, 'Mon DD');
        END IF;
    END IF;

    -- Mirrors getBaseSellValue()/calculateMarketplaceListingPrice() in
    -- habit-business.service.ts — kept in sync manually, same as that
    -- service's own getMarketplaceListingPrice() preview method.
    v_base_sell_value := COALESCE(v_business.marketplace_base_value, FLOOR(v_business.cost * 0.7));
    v_listing_price := ROUND(v_base_sell_value * (1 + LEAST(GREATEST(COALESCE(v_business.streak, 0), 0), 100) * 0.01), 2);

    -- Stagger against this seller's own most recently *scheduled* listing
    -- (whatever its current status) — see file header for the chain logic.
    SELECT MAX(listed_at) INTO v_prev_listed_at
    FROM marketplace_listings WHERE seller_id = p_user_id;

    IF v_prev_listed_at IS NULL THEN
        v_listed_at := NOW();
    ELSE
        v_listed_at := GREATEST(NOW(), v_prev_listed_at + INTERVAL '12 hours');
    END IF;
    v_expires_at := v_listed_at + INTERVAL '24 hours';

    INSERT INTO marketplace_listings (
        seller_id, habit_business_id, business_type_id, business_name, business_icon,
        base_cost, earnings_per_completion, base_sell_value, streak_at_listing, listing_price, reason,
        listed_at, expires_at
    ) VALUES (
        p_user_id, v_business.id, v_business.business_type_id, v_business.business_name, v_business.business_icon,
        v_business.cost, v_business.earnings_per_completion, v_base_sell_value, COALESCE(v_business.streak, 0), v_listing_price, p_reason,
        v_listed_at, v_expires_at
    );

    RETURN jsonb_build_object(
        'listing_price', v_listing_price,
        'listed_at', v_listed_at
    );
END;
$$;
GRANT EXECUTE ON FUNCTION create_marketplace_listing(UUID, UUID, TEXT) TO authenticated;

-- ─── 7. resolve_marketplace_purchase(): weekly_count goal_value <= 7 ───
-- Otherwise unchanged from the prior version
-- (20260814010000_block_marketplace_purchase_into_joint_venture.sql) — a
-- buyer starting a brand-new habit from a purchased business type can pick
-- any schedule, including 'weekly_count', so this needs the same bound as
-- HabitBusinessService.validateGoalValue()'s client-side check.
CREATE OR REPLACE FUNCTION resolve_marketplace_purchase(
    p_buyer_id UUID,
    p_purchase_id UUID,
    p_target_habit_business_id UUID DEFAULT NULL,
    p_habit_description TEXT DEFAULT NULL,
    p_recurrence_interval TEXT DEFAULT NULL,
    p_goal_value INTEGER DEFAULT NULL,
    p_active_days INTEGER[] DEFAULT NULL,
    p_business_name TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_purchase marketplace_purchases%ROWTYPE;
    v_target_base_cost NUMERIC;
    v_target_business_type_id INTEGER;
    v_target_bonus_percent SMALLINT;
    v_target_is_joint_venture BOOLEAN;
    v_new_base_value NUMERIC;
    v_new_earnings NUMERIC;
    v_bonus_percent SMALLINT;
    v_next_order INTEGER;
    v_result_id UUID;
BEGIN
    IF p_buyer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_purchase FROM marketplace_purchases
    WHERE id = p_purchase_id AND buyer_id = p_buyer_id AND resolved = false
    FOR UPDATE;

    IF v_purchase.id IS NULL THEN
        RAISE EXCEPTION 'Purchase not found or already resolved';
    END IF;

    -- 70% of the business's tier price (never decays), not 70% of the sale
    -- price (would compound the discount on every resale).
    v_new_base_value := FLOOR(v_purchase.base_cost * 0.7);

    -- Same capped streak-bonus formula as the listing price
    -- (calculateMarketplaceListingPrice() / create_marketplace_listing()) — the
    -- buyer paid for this bonus, so it now becomes their business's base pay.
    v_bonus_percent := LEAST(GREATEST(v_purchase.streak_at_purchase, 0), 100);
    v_new_earnings := ROUND(
        v_purchase.earnings_per_completion * (1 + v_bonus_percent * 0.01),
        2
    );

    IF p_target_habit_business_id IS NOT NULL THEN
        SELECT bt.base_cost, hb.business_type_id, hb.marketplace_bonus_percent, hb.is_joint_venture
        INTO v_target_base_cost, v_target_business_type_id, v_target_bonus_percent, v_target_is_joint_venture
        FROM habit_businesses hb
        JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.id = p_target_habit_business_id
          AND hb.user_id = p_buyer_id
          AND hb.is_active = true;

        IF v_target_base_cost IS NULL THEN
            RAISE EXCEPTION 'Target business not found';
        END IF;
        IF v_target_is_joint_venture THEN
            RAISE EXCEPTION 'This is a joint venture — use the group upgrade flow instead.';
        END IF;
        IF v_target_base_cost > v_purchase.base_cost THEN
            RAISE EXCEPTION 'Target business is a higher level than the purchased business';
        END IF;

        IF v_target_business_type_id = v_purchase.business_type_id THEN
            -- Same business type: a true merge/absorption, not a displacement.
            -- Stack the bonus percents (capped at 100) instead of one
            -- replacing the other, and don't list the old business — it
            -- isn't being displaced, it's being combined into this one.
            v_bonus_percent := LEAST(COALESCE(v_target_bonus_percent, 0) + v_bonus_percent, 100);
            v_new_earnings := ROUND(v_purchase.earnings_per_completion * (1 + v_bonus_percent * 0.01), 2);
        ELSE
            -- Different business type: the old business is being displaced by
            -- a different one ("upgrade"), so list it on the Marketplace
            -- before it's overwritten below — matches upgradeHabitBusiness()
            -- and the joint-venture upgrade RPC's own listing step. Kept
            -- non-fatal: the purchase resolution always proceeds regardless
            -- of whether this listing succeeds.
            BEGIN
                PERFORM create_marketplace_listing(p_buyer_id, p_target_habit_business_id, 'upgrade');
            EXCEPTION WHEN OTHERS THEN
                NULL; -- non-fatal, matches the single-owner upgradeHabitBusiness() flow's own tolerance
            END;
        END IF;

        -- business_name/habit_description are the habit's own identity and are
        -- deliberately left untouched here — only the underlying business
        -- (type/icon/cost/earnings) is being swapped out.
        UPDATE habit_businesses
        SET business_type_id = v_purchase.business_type_id,
            business_icon = v_purchase.business_icon,
            cost = v_purchase.base_cost,
            earnings_per_completion = v_new_earnings,
            marketplace_base_value = v_new_base_value,
            marketplace_bonus_percent = NULLIF(v_bonus_percent, 0),
            updated_at = NOW()
        WHERE id = p_target_habit_business_id;

        v_result_id := p_target_habit_business_id;
    ELSE
        IF p_habit_description IS NULL OR p_recurrence_interval IS NULL OR p_goal_value IS NULL THEN
            RAISE EXCEPTION 'habit_description, recurrence_interval, and goal_value are required to start a new habit';
        END IF;
        IF p_recurrence_interval = 'weekly_count' THEN
            IF p_goal_value < 1 OR p_goal_value > 7 THEN
                RAISE EXCEPTION 'Goal value must be between 1 and 7 for a weekly habit';
            END IF;
        ELSIF p_goal_value < 1 OR p_goal_value > 20 THEN
            RAISE EXCEPTION 'Goal value must be between 1 and 20';
        END IF;

        SELECT COALESCE(COUNT(*), 0) + 1 INTO v_next_order
        FROM habit_businesses WHERE user_id = p_buyer_id AND is_active = true;

        INSERT INTO habit_businesses (
            user_id, business_type_id, business_name, business_icon, cost,
            habit_description, recurrence_interval, frequency, active_days, goal_value,
            current_progress, earnings_per_completion, streak, total_completions, total_earnings,
            display_order, user_custom_order, is_active, marketplace_base_value, marketplace_bonus_percent
        ) VALUES (
            p_buyer_id, v_purchase.business_type_id,
            COALESCE(NULLIF(TRIM(p_business_name), ''), v_purchase.business_name),
            v_purchase.business_icon, v_purchase.base_cost,
            p_habit_description, p_recurrence_interval, 'daily',
            CASE WHEN p_recurrence_interval = 'specific_days' THEN COALESCE(p_active_days, ARRAY[]::INTEGER[]) ELSE NULL END,
            p_goal_value,
            0, v_new_earnings, 0, 0, 0,
            v_next_order, v_next_order, true, v_new_base_value, NULLIF(v_bonus_percent, 0)
        ) RETURNING id INTO v_result_id;
    END IF;

    UPDATE marketplace_purchases
    SET resolved = true, resolved_habit_business_id = v_result_id
    WHERE id = p_purchase_id;

    PERFORM recalculate_net_worth(p_buyer_id);

    RETURN v_result_id;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_marketplace_purchase(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER[], TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
