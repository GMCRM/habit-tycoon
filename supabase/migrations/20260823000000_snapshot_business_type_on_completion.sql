-- Bug: get_weekly_receipt() (and the Weekly Receipt UI built on it) label
-- every past habit_earning line item with the habit-business's CURRENT
-- business type name/icon, via a live join on habit_businesses.business_type_id.
--
-- habit_completions.earnings is a permanent historical record of what a
-- completion actually paid at the time — but business_type_id and
-- business_icon on habit_businesses are mutable (upgradeHabitBusiness()
-- overwrites them in place). So upgrading a business (e.g. Hockey Team ->
-- Movie Studio) retroactively relabels every completion earned *before*
-- the upgrade with the new business name/icon, while the dollar amount
-- shown is still the old, lower pre-upgrade payout. That reads exactly
-- like "my Movie Studio pays the same as my Hockey Team did" even though
-- the upgrade worked correctly and new completions do pay more.
--
-- Fix: snapshot the business type name/icon onto each habit_completions
-- row at the moment it's earned, and have get_weekly_receipt() prefer that
-- snapshot over the live join.

ALTER TABLE habit_completions
    ADD COLUMN IF NOT EXISTS business_type_name TEXT,
    ADD COLUMN IF NOT EXISTS business_icon TEXT;

-- Best-effort backfill for existing rows: this can only reconstruct what
-- the CURRENT business type/icon are (no history existed before this
-- migration), which is no worse than the live-join behavior these rows had
-- before — it just stops future upgrades from further mislabeling them.
UPDATE habit_completions hc
SET business_type_name = COALESCE(bt.name, 'Business'),
    business_icon = COALESCE(hb.business_icon, '✅')
FROM habit_businesses hb
LEFT JOIN business_types bt ON bt.id = hb.business_type_id
WHERE hb.id = hc.habit_business_id
  AND hc.business_type_name IS NULL;

-- complete_habit_business (live version: 20260810010000_fix_dividend_per_share_formula.sql)
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

    IF v_is_goal_completed THEN
        BEGIN
            PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
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

-- complete_habit_business_yesterday (live version: 20260810010000_fix_dividend_per_share_formula.sql)
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

-- complete_joint_venture_checkin (live version: 20260820180000_jv_per_checkin_dividends_and_group_bonus.sql)
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
        NULL;
    END;

    PERFORM adjust_user_cash(v_user_id, v_base_amount);

    v_checked_in_today := v_checkins_before_this_one + 1;

    IF v_checked_in_today < v_total_co_owners THEN
        RETURN jsonb_build_object(
            'success', true,
            'earnings', v_base_amount,
            'total_paid_today', v_total_paid_today,
            'checked_in_today', v_checked_in_today,
            'total_co_owners', v_total_co_owners,
            'group_bonus', 0,
            'streak', v_habit.streak
        );
    END IF;

    -- Last co-owner to check in today: resolve the group's daily streak and
    -- pay the streak bonus to every co-owner who checked in today.
    v_yesterday := v_today - INTERVAL '1 day';
    SELECT COUNT(*) INTO v_yesterday_checkins
    FROM joint_venture_checkins
    WHERE habit_business_id = p_habit_business_id AND check_in_date = v_yesterday;
    v_prior_day_full := v_yesterday_checkins >= v_total_co_owners;

    IF v_habit.last_completed_at IS NOT NULL AND v_prior_day_full THEN
        v_new_streak := COALESCE(v_habit.streak, 0) + 1;
    ELSE
        v_new_streak := 1;
    END IF;

    IF v_new_streak > 1 THEN
        v_max_multiplier := LEAST((v_new_streak - 1) * 0.1, 1);
    ELSE
        v_max_multiplier := 0;
    END IF;

    UPDATE habit_businesses SET streak = v_new_streak, updated_at = NOW() WHERE id = p_habit_business_id;

    IF v_max_multiplier > 0 THEN
        FOR v_co_owner IN
            SELECT jvc.co_owner_id, hc.id AS hc_id, hc.earnings AS hc_earnings
            FROM joint_venture_checkins jvc
            JOIN habit_completions hc ON hc.habit_business_id = p_habit_business_id
                AND hc.user_id = jvc.co_owner_id
                AND hc.completed_at::date = v_today
            WHERE jvc.habit_business_id = p_habit_business_id AND jvc.check_in_date = v_today
        LOOP
            v_bonus := ROUND(v_co_owner.hc_earnings * v_max_multiplier, 2);
            IF v_bonus > 0 THEN
                UPDATE habit_completions SET earnings = earnings + v_bonus WHERE id = v_co_owner.hc_id;
                UPDATE habit_businesses SET total_earnings = COALESCE(total_earnings, 0) + v_bonus WHERE id = p_habit_business_id;
                PERFORM adjust_user_cash(v_co_owner.co_owner_id, v_bonus);
                v_total_group_bonus := v_total_group_bonus + v_bonus;
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'earnings', v_base_amount,
        'total_paid_today', v_total_paid_today + v_total_group_bonus,
        'checked_in_today', v_checked_in_today,
        'total_co_owners', v_total_co_owners,
        'group_bonus', v_total_group_bonus,
        'streak', v_new_streak
    );
END;
$$;
GRANT EXECUTE ON FUNCTION complete_joint_venture_checkin(UUID, TIMESTAMPTZ) TO authenticated;

-- get_weekly_receipt (live version: 20260807110000_joint_venture_weekly_receipt.sql) —
-- habit_earning branch now prefers the snapshot columns above over the live
-- business_types join, so a since-upgraded business doesn't retroactively
-- relabel (and thereby misrepresent the payout of) its pre-upgrade history.
CREATE OR REPLACE FUNCTION get_weekly_receipt(
    p_week_start TIMESTAMPTZ,
    p_week_end TIMESTAMPTZ
) RETURNS TABLE (
    item_type TEXT,
    occurred_at TIMESTAMPTZ,
    amount NUMERIC,
    primary_label TEXT,
    secondary_label TEXT,
    icon TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    RETURN QUERY

    -- Personal habit completions (includes joint-venture daily check-in payouts —
    -- complete_joint_venture_checkin() writes into habit_completions in the
    -- same shape as a solo completion, so no separate branch is needed here).
    -- business_type_name/business_icon are snapshotted at completion time
    -- (see the migration adding those columns) — prefer them over the live
    -- join so a later upgrade doesn't relabel history that was earned under
    -- the old business type.
    SELECT
        'habit_earning'::TEXT,
        hc.completed_at,
        hc.earnings::NUMERIC,
        hb.business_name,
        COALESCE(hc.business_type_name, bt.name, 'Business'),
        COALESCE(hc.business_icon, hb.business_icon, '✅')
    FROM habit_completions hc
    JOIN habit_businesses hb ON hb.id = hc.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hc.user_id = v_user_id
      AND hc.completed_at >= p_week_start
      AND hc.completed_at < p_week_end

    UNION ALL

    -- Dividends received from a friend's business you own stock in.
    -- primary = friend's name, secondary = business TYPE (not the friend's
    -- custom business name — that would reveal their actual habit).
    SELECT
        'dividend'::TEXT,
        sdd.created_at,
        sdd.total_dividend::NUMERIC,
        COALESCE(up.name, 'A friend'),
        COALESCE(bt.name, 'a business'),
        '📈'::TEXT
    FROM stock_dividend_distributions sdd
    JOIN dividend_payments dp ON dp.id = sdd.dividend_payment_id
    JOIN business_stocks bs ON bs.id = dp.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    LEFT JOIN user_profiles up ON up.id = dp.business_owner_id
    WHERE sdd.stockholder_id = v_user_id
      AND sdd.created_at >= p_week_start
      AND sdd.created_at < p_week_end

    UNION ALL

    -- Stock purchases, sales, and forced refunds (business deleted underneath you).
    -- primary = business TYPE (not the owner's custom business name),
    -- secondary = the counterparty's display name.
    SELECT
        CASE
            WHEN st.buyer_id = v_user_id THEN 'stock_purchase'
            WHEN st.transaction_type = 'business_deletion_refund' THEN 'stock_refund'
            ELSE 'stock_sale'
        END::TEXT,
        st.created_at,
        CASE
            WHEN st.buyer_id = v_user_id THEN -st.total_cost
            WHEN st.transaction_type = 'business_deletion_refund' THEN st.total_cost
            ELSE ROUND(st.total_cost * 0.98, 2) -- net of the 2% sale fee actually credited to cash
        END::NUMERIC,
        COALESCE(bt.name, 'a business'),
        COALESCE(up.name, 'Unknown'),
        '📊'::TEXT
    FROM stock_transactions st
    JOIN business_stocks bs ON bs.id = st.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    LEFT JOIN user_profiles up ON up.id = bs.business_owner_id
    WHERE (st.buyer_id = v_user_id OR st.seller_id = v_user_id)
      AND st.created_at >= p_week_start
      AND st.created_at < p_week_end

    UNION ALL

    -- Sale of one of your own habit-businesses (your own data, unaffected).
    -- For a joint venture's sale/deletion payout, this is your own split cut
    -- — purchase_marketplace_listing() / resolve_expired_marketplace_listings()
    -- insert one business_sales row per co-owner, so this branch needs no change.
    SELECT
        'business_sale'::TEXT,
        bsale.created_at,
        bsale.sell_value::NUMERIC,
        bsale.business_name,
        bsale.business_type_name,
        '💰'::TEXT
    FROM business_sales bsale
    WHERE bsale.user_id = v_user_id
      AND bsale.created_at >= p_week_start
      AND bsale.created_at < p_week_end

    UNION ALL

    -- Marketplace listings bought from a friend
    SELECT
        'marketplace_purchase'::TEXT,
        mp.created_at,
        -mp.purchase_price::NUMERIC,
        mp.business_name,
        COALESCE(bt.name, 'Business'),
        COALESCE(mp.business_icon, '🛒')
    FROM marketplace_purchases mp
    LEFT JOIN business_types bt ON bt.id = mp.business_type_id
    WHERE mp.buyer_id = v_user_id
      AND mp.created_at >= p_week_start
      AND mp.created_at < p_week_end

    UNION ALL

    -- Joint venture: your own share paid to co-found a new venture
    SELECT
        'joint_venture_investment'::TEXT,
        jvp.paid_at,
        (-jvp.share_amount)::NUMERIC,
        prop.business_name,
        'New joint venture'::TEXT,
        prop.business_icon
    FROM joint_venture_participants jvp
    JOIN joint_venture_proposals prop ON prop.id = jvp.proposal_id
    WHERE jvp.user_id = v_user_id
      AND jvp.paid = true
      AND jvp.paid_at IS NOT NULL
      AND jvp.paid_at >= p_week_start
      AND jvp.paid_at < p_week_end

    UNION ALL

    -- Joint venture: your own share paid toward a group upgrade
    SELECT
        'joint_venture_investment'::TEXT,
        jvup.paid_at,
        (-jvup.share_amount)::NUMERIC,
        hb.business_name,
        'Upgrade payment'::TEXT,
        hb.business_icon
    FROM joint_venture_upgrade_participants jvup
    JOIN joint_venture_upgrade_proposals uprop ON uprop.id = jvup.upgrade_proposal_id
    JOIN habit_businesses hb ON hb.id = uprop.habit_business_id
    WHERE jvup.user_id = v_user_id
      AND jvup.paid = true
      AND jvup.paid_at IS NOT NULL
      AND jvup.paid_at >= p_week_start
      AND jvup.paid_at < p_week_end

    UNION ALL

    -- Joint venture: refund from an invite that expired or was declined
    -- before the venture was fully funded
    SELECT
        'joint_venture_refund'::TEXT,
        jvp.refunded_at,
        jvp.share_amount::NUMERIC,
        prop.business_name,
        'Joint venture refund'::TEXT,
        prop.business_icon
    FROM joint_venture_participants jvp
    JOIN joint_venture_proposals prop ON prop.id = jvp.proposal_id
    WHERE jvp.user_id = v_user_id
      AND jvp.refunded_at IS NOT NULL
      AND jvp.refunded_at >= p_week_start
      AND jvp.refunded_at < p_week_end

    UNION ALL

    -- Joint venture: refund from an upgrade that expired or was declined
    -- before it was fully funded
    SELECT
        'joint_venture_refund'::TEXT,
        jvup.refunded_at,
        jvup.share_amount::NUMERIC,
        hb.business_name,
        'Upgrade refund'::TEXT,
        hb.business_icon
    FROM joint_venture_upgrade_participants jvup
    JOIN joint_venture_upgrade_proposals uprop ON uprop.id = jvup.upgrade_proposal_id
    JOIN habit_businesses hb ON hb.id = uprop.habit_business_id
    WHERE jvup.user_id = v_user_id
      AND jvup.refunded_at IS NOT NULL
      AND jvup.refunded_at >= p_week_start
      AND jvup.refunded_at < p_week_end

    ORDER BY 2 ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_receipt(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

NOTIFY pgrst, 'reload schema';
