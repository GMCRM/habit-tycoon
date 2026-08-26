-- When a stockholder or joint-venture co-owner sends a "do your habit!"
-- reminder (send_stockholder_reminder / send_joint_venture_reminder, both
-- of which stamp metadata->>'habit_business_id' on the social_pokes row —
-- see 20260825070000_stockholder_reminder_uses_habit_name.sql and
-- 20260826040000_fix_notification_rpc_authz_holes.sql), the recipient goes
-- on seeing it in their Notifications tab even after they've actually
-- completed the habit, since nothing ever removes it. Once they've done
-- the thing the reminder was nagging them about, the reminder is just
-- stale clutter.
--
-- Fix: when the habit owner (solo) or a co-owner (joint venture) completes
-- the habit, delete every pending reminder of that kind addressed to them
-- for that specific habit_business_id. Scoped to to_user_id so only the
-- completing user's own reminders are cleared — a joint venture co-owner
-- checking in doesn't clear reminders sent to a *different* co-owner who
-- still hasn't. Not date-scoped: any reminder for this habit, however old,
-- is equally moot the moment the recipient does the thing it asked for.
--
-- send_habit_poke's generic "rooting for you" notifications (type =
-- 'habit_reminder') are deliberately left alone — that RPC only ever
-- stamps a free-text business_name in metadata, not a habit_business_id,
-- so there's no reliable way to tie one back to a specific habit.

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
    v_max_multiplier NUMERIC := 0;
    v_streak_multiplier NUMERIC := 0;
    v_co_owner RECORD;
    v_hc_id UUID;
    v_hc_earnings NUMERIC;
    v_bonus NUMERIC;
    v_total_paid_today NUMERIC := 0;
    v_total_group_bonus NUMERIC := 0;
    v_business_type_name TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

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

    SELECT name INTO v_business_type_name FROM business_types WHERE id = v_habit.business_type_id;

    INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at, business_type_name, business_icon)
    VALUES (p_habit_business_id, v_user_id, v_base_amount, v_habit.streak, p_occurred_at, COALESCE(v_business_type_name, 'Business'), COALESCE(v_habit.business_icon, '✅'))
    RETURNING id INTO v_completion_id;

    UPDATE habit_businesses
    SET total_earnings = COALESCE(total_earnings, 0) + v_base_amount,
        last_completed_at = p_occurred_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    -- Clear any outstanding joint-venture check-in reminders this co-owner
    -- was sent for this business — they just checked in, so the nudge no
    -- longer applies. Only this co-owner's own reminders: the others may
    -- still not have checked in today.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_reminder'
      AND to_user_id = v_user_id
      AND (metadata->>'habit_business_id')::UUID = p_habit_business_id;

    v_total_paid_today := v_base_amount;

    -- Every co-owner's check-in is its own completion event and pays
    -- stockholders immediately — the same "dopamine hit" timing as a solo
    -- habit — not gated to just the first check-in of the day.
    BEGIN
        PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'process_habit_completion_dividends failed for completion %: %', v_completion_id, SQLERRM;
    END;

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

    -- Group streak-bonus cap scales with owner count instead of a flat 200%:
    -- owners * 20 + 200 (e.g. 240% at 2 owners, 300% at 5 owners), still
    -- ramping up linearly over the same 10-day window as before.
    v_max_multiplier := (v_total_co_owners * 20 + 200) / 100.0;
    IF v_new_streak > 1 THEN
        v_streak_multiplier := LEAST((v_new_streak - 1) * (v_max_multiplier / 10), v_max_multiplier);
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
                v_total_group_bonus := v_total_group_bonus + v_bonus;
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

    -- Stockholders get the group's streak bonus the moment it's earned, same
    -- as the co-owners above — not the next time someone happens to check in.
    IF v_total_group_bonus > 0 THEN
        BEGIN
            PERFORM process_joint_venture_streak_bonus_dividend(p_habit_business_id, v_total_group_bonus);
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'process_joint_venture_streak_bonus_dividend failed for business %: %', p_habit_business_id, SQLERRM;
        END;
    END IF;

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

NOTIFY pgrst, 'reload schema';
