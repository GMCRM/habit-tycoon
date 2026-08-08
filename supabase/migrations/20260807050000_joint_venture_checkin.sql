-- Joint Venture — daily check-in, per-person base pay, group streak bonus.
--
-- Replaces complete_habit_business for joint venture rows only (guarded out
-- at the bottom of this file). Each co-owner checks in independently; every
-- check-in immediately pays that co-owner the full, undivided base payout
-- (confirmed: partial-day co-owners still get paid — no streak bonus, since
-- the group didn't complete the day). Only once every co-owner has checked
-- in for the same calendar day (measured in the business's fixed
-- joint_venture_timezone) does the day count toward the shared streak, at
-- which point every co-owner who already checked in today gets topped up
-- with a streak-bonus amount — DOUBLE the normal rate (20%/day instead of
-- 10%/day, capped at the same day-11 cap point).
--
-- If full attendance is never reached before the day rolls over, nothing
-- above fires for that day — there's no cron anywhere in this app. The next
-- day this RPC runs, the "was yesterday full?" check simply finds it wasn't
-- and resets the streak to 1 on the next full day, mirroring the same lazy
-- correction HabitIntervalService.getEffectiveStreak() already applies to
-- solo habits.

CREATE TABLE IF NOT EXISTS joint_venture_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    co_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (habit_business_id, co_owner_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_joint_venture_checkins_business_date ON joint_venture_checkins(habit_business_id, check_in_date);

ALTER TABLE joint_venture_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Co-owners can view check-ins for their own businesses" ON joint_venture_checkins;
CREATE POLICY "Co-owners can view check-ins for their own businesses" ON joint_venture_checkins FOR
SELECT USING (
    EXISTS (
        SELECT 1 FROM business_co_owners bco
        WHERE bco.habit_business_id = joint_venture_checkins.habit_business_id AND bco.user_id = auth.uid()
    )
);
-- No client INSERT/UPDATE/DELETE policy — only complete_joint_venture_checkin() writes here.

CREATE OR REPLACE FUNCTION complete_joint_venture_checkin(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit habit_businesses%ROWTYPE;
    v_today DATE;
    v_yesterday DATE;
    v_stock RECORD;
    v_base_earnings NUMERIC;
    v_stock_boost NUMERIC := 0;
    v_base_amount NUMERIC;
    v_completion_id UUID;
    v_checkins_before_this_one INTEGER;
    v_checked_in_today INTEGER;
    v_total_co_owners INTEGER;
    v_yesterday_checkins INTEGER;
    v_prior_day_full BOOLEAN;
    v_new_streak INTEGER;
    v_streak_multiplier NUMERIC := 0;
    v_co_owner RECORD;
    v_hc_id UUID;
    v_hc_earnings NUMERIC;
    v_bonus NUMERIC;
    v_total_paid_today NUMERIC := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Lock the shared row (not a per-day row) so two co-owners checking in at
    -- the same instant serialize instead of both observing "I'm the last one".
    SELECT * INTO v_habit FROM habit_businesses WHERE id = p_habit_business_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found';
    END IF;
    IF NOT v_habit.is_joint_venture THEN
        RAISE EXCEPTION 'This business is not a joint venture — use complete_habit_business instead';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = v_user_id) THEN
        RAISE EXCEPTION 'You are not a co-owner of this business';
    END IF;

    v_today := (p_occurred_at AT TIME ZONE COALESCE(v_habit.joint_venture_timezone, 'UTC'))::date;

    IF EXISTS (
        SELECT 1 FROM joint_venture_checkins
        WHERE habit_business_id = p_habit_business_id AND co_owner_id = v_user_id AND check_in_date = v_today
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already checked in today');
    END IF;

    SELECT COUNT(*) INTO v_checkins_before_this_one
    FROM joint_venture_checkins WHERE habit_business_id = p_habit_business_id AND check_in_date = v_today;

    SELECT COUNT(*) INTO v_total_co_owners FROM business_co_owners WHERE habit_business_id = p_habit_business_id;
    IF v_total_co_owners = 0 THEN
        RAISE EXCEPTION 'Joint venture has no co-owners';
    END IF;

    -- Base payout — same stock-boost formula complete_habit_business uses,
    -- but never the streak multiplier: every check-in pays the plain base
    -- amount regardless of group state; the streak bonus (if any) is applied
    -- as a top-up below, only once the group completes the day.
    v_base_earnings := v_habit.earnings_per_completion;
    SELECT * INTO v_stock FROM business_stocks WHERE habit_business_id = p_habit_business_id;
    IF FOUND THEN
        v_stock_boost := v_base_earnings * (
            GREATEST(0, (v_stock.total_shares_issued - v_stock.shares_owned_by_owner) - v_stock.shares_available)::NUMERIC / 100
        );
    END IF;
    v_base_amount := v_base_earnings + v_stock_boost;

    INSERT INTO joint_venture_checkins (habit_business_id, co_owner_id, check_in_date, checked_in_at)
    VALUES (p_habit_business_id, v_user_id, v_today, p_occurred_at);

    INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at)
    VALUES (p_habit_business_id, v_user_id, v_base_amount, v_habit.streak, p_occurred_at)
    RETURNING id INTO v_completion_id;

    UPDATE habit_businesses
    SET total_earnings = COALESCE(total_earnings, 0) + v_base_amount,
        last_completed_at = p_occurred_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    v_total_paid_today := v_base_amount;

    -- Dividends fire exactly once per calendar day (anchored to the first
    -- check-in), not once per co-owner — process_habit_completion_dividends
    -- pays the business's friend-investors from the dividend pool implied by
    -- v_stock_boost, and calling it per co-owner would overpay them N×.
    IF v_checkins_before_this_one = 0 THEN
        BEGIN
            PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    PERFORM adjust_user_cash(v_user_id, v_base_amount);

    v_checked_in_today := v_checkins_before_this_one + 1;

    IF v_checked_in_today < v_total_co_owners THEN
        RETURN jsonb_build_object(
            'success', true, 'finalized', false,
            'earnings', v_base_amount,
            'checked_in', v_checked_in_today, 'total', v_total_co_owners
        );
    END IF;

    -- ─── Full attendance just achieved for v_today — finalize the group day. ───
    v_yesterday := v_today - 1;
    SELECT COUNT(DISTINCT co_owner_id) INTO v_yesterday_checkins
    FROM joint_venture_checkins WHERE habit_business_id = p_habit_business_id AND check_in_date = v_yesterday;
    v_prior_day_full := (v_yesterday_checkins >= v_total_co_owners);

    v_new_streak := CASE WHEN v_prior_day_full THEN v_habit.streak + 1 ELSE 1 END;

    IF v_new_streak > 1 THEN
        -- Double the normal 10%/day rate, capped at the same day-11 cap point.
        v_streak_multiplier := LEAST((v_new_streak - 1) * 0.2, 2.0);
    END IF;

    FOR v_co_owner IN SELECT user_id FROM business_co_owners WHERE habit_business_id = p_habit_business_id LOOP
        SELECT id, earnings INTO v_hc_id, v_hc_earnings
        FROM habit_completions
        WHERE habit_business_id = p_habit_business_id
          AND user_id = v_co_owner.user_id
          AND (completed_at AT TIME ZONE COALESCE(v_habit.joint_venture_timezone, 'UTC'))::date = v_today
        ORDER BY completed_at DESC LIMIT 1;

        IF v_hc_id IS NOT NULL THEN
            IF v_streak_multiplier > 0 THEN
                v_bonus := ROUND(v_hc_earnings * v_streak_multiplier, 2);
                UPDATE habit_completions SET earnings = earnings + v_bonus, streak_count = v_new_streak WHERE id = v_hc_id;
                PERFORM adjust_user_cash(v_co_owner.user_id, v_bonus);
                IF v_co_owner.user_id = v_user_id THEN
                    v_total_paid_today := v_total_paid_today + v_bonus;
                END IF;
            ELSE
                UPDATE habit_completions SET streak_count = v_new_streak WHERE id = v_hc_id;
            END IF;
        END IF;
    END LOOP;

    UPDATE habit_businesses
    SET streak = v_new_streak,
        total_completions = COALESCE(total_completions, 0) + 1,
        longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak),
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    BEGIN
        PERFORM update_stock_price_by_streak(p_habit_business_id);
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    FOR v_co_owner IN SELECT user_id FROM business_co_owners WHERE habit_business_id = p_habit_business_id LOOP
        BEGIN
            PERFORM notify_friends_of_milestone(p_habit_business_id, v_co_owner.user_id);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 'finalized', true,
        'earnings', v_total_paid_today,
        'streak', v_new_streak,
        'checked_in', v_checked_in_today, 'total', v_total_co_owners
    );
END;
$$;
GRANT EXECUTE ON FUNCTION complete_joint_venture_checkin(UUID, TIMESTAMPTZ) TO authenticated;

-- ─── get_joint_venture_status: today's check-in roster for a set of
-- businesses, for the "waiting on Bob, Carol" strip on the home card. ───
CREATE OR REPLACE FUNCTION get_joint_venture_status(p_habit_business_ids UUID[]) RETURNS TABLE (
    habit_business_id UUID,
    co_owner_id UUID,
    co_owner_name TEXT,
    is_creator BOOLEAN,
    checked_in_today BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    RETURN QUERY
    SELECT
        bco.habit_business_id,
        bco.user_id,
        COALESCE(up.name, 'A friend'),
        bco.is_creator,
        EXISTS (
            SELECT 1 FROM joint_venture_checkins jvc
            WHERE jvc.habit_business_id = bco.habit_business_id
              AND jvc.co_owner_id = bco.user_id
              AND jvc.check_in_date = (NOW() AT TIME ZONE COALESCE(hb.joint_venture_timezone, 'UTC'))::date
        )
    FROM business_co_owners bco
    JOIN habit_businesses hb ON hb.id = bco.habit_business_id
    JOIN user_profiles up ON up.id = bco.user_id
    WHERE bco.habit_business_id = ANY(p_habit_business_ids)
      -- Only ever return rows for businesses the caller actually co-owns —
      -- defense in depth against passing in an arbitrary id.
      AND EXISTS (SELECT 1 FROM business_co_owners self WHERE self.habit_business_id = bco.habit_business_id AND self.user_id = v_user_id);
END;
$$;
GRANT EXECUTE ON FUNCTION get_joint_venture_status(UUID[]) TO authenticated;

-- ─── Guard the existing single-owner RPC: no-op for every existing row
-- (is_joint_venture is always false today), pure defense-in-depth against a
-- stale client routing a joint venture through the single-owner path. ───
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

    IF v_is_goal_completed THEN
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
                v_new_streak := v_habit.streak + 1;
            ELSE
                v_new_streak := 1;
            END IF;
        ELSE
            v_new_streak := 1;
        END IF;
    END IF;

    v_base_earnings := v_habit.earnings_per_completion;
    v_stock_boost := 0;
    IF v_is_goal_completed THEN
        SELECT * INTO v_stock FROM business_stocks WHERE habit_business_id = p_habit_business_id;
        IF FOUND THEN
            v_stock_boost := v_base_earnings * (
                GREATEST(0, (v_stock.total_shares_issued - v_stock.shares_owned_by_owner) - v_stock.shares_available)::NUMERIC / 100
            );
        END IF;
    END IF;
    v_boosted_base := v_base_earnings + v_stock_boost;

    IF v_is_goal_completed AND v_new_streak > 1 THEN
        v_streak_multiplier := LEAST((v_new_streak - 1) * 0.1, 1);
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

    PERFORM adjust_user_cash(v_user_id, v_total_earnings);

    RETURN jsonb_build_object('earnings', v_total_earnings, 'streak', v_new_streak);
END;
$$;
GRANT EXECUTE ON FUNCTION complete_habit_business(UUID, TIMESTAMPTZ, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
