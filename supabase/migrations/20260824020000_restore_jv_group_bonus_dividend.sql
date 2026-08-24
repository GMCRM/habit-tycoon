-- Bug: 20260823000000_snapshot_business_type_on_completion.sql redefined
-- complete_joint_venture_checkin to add the business_type_name/business_icon
-- snapshot (see that migration), but the version it was edited from predates
-- 20260820180000_jv_per_checkin_dividends_and_group_bonus.sql — so landing
-- it silently reverted everything 20260820180000 added, even though
-- its own comment claimed "byte-for-byte identical" apart from the
-- snapshot change:
--
--   1. Stockholders stopped being paid the group's streak-bonus dividend
--      at all (the PERFORM process_joint_venture_streak_bonus_dividend
--      call is simply gone) — co-owners still get their bonus, investors
--      in the business's stock get nothing for it.
--   2. update_stock_price_by_streak and notify_friends_of_milestone are no
--      longer called when the group's streak advances.
--   3. total_completions / longest_streak stopped being tracked on
--      habit_businesses for joint ventures.
--   4. The group streak-bonus cap regressed from scaling with owner count
--      ((total_co_owners * 20 + 200) / 100, e.g. 240% at 2 owners) back to
--      a flat 100% cap.
--   5. The returned JSONB's keys were renamed (finalized/checked_in/total ->
--      checked_in_today/total_co_owners/group_bonus, "finalized" dropped
--      entirely) — but JointVentureCheckinResult and habit-card.component.ts
--      (result.finalized / result.checked_in / result.total) still read the
--      OLD names, so every field but earnings/streak silently read as
--      undefined on the live DB.
--
-- Fix: restore all five, on top of the current business_type_name/icon
-- snapshot insert (kept as-is). Also re-adds the per-completion dividend
-- error to Postgres' logs instead of swallowing it silently (see
-- 20260824010000_log_dividend_processing_errors.sql) so a real failure in
-- process_habit_completion_dividends or process_joint_venture_streak_bonus_dividend
-- is visible next time, instead of just "no dividend paid, no error either."
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
