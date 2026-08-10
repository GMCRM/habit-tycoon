-- Fix dividend payouts to match the intended per-share formula.
--
-- The business is cut into 100 shares: 80 retained by the owner, 20
-- tradeable to investors. The owner's pay for a completion is base_earnings,
-- boosted by up to +20% (1% per tradeable share actually purchased by an
-- investor, see 20260724030000_fix_dividend_stock_boost_calculation.sql) —
-- that boosted amount (base_earnings + stock_boost) is the business's
-- "complete income" for the completion, and each of the 100 shares is worth
-- exactly 1/100th of it. So a single tradeable share should pay
-- complete_income / 100, and an investor holding all 20 tradeable shares
-- should collect 20/100 of complete_income.
--
-- process_habit_completion_dividends instead computed
-- total_dividend_pool := stock_boost * 0.5 (an arbitrary 50% haircut on just
-- the boost, present since the very first version of this function) and
-- then re-derived a per-share rate by dividing that pool back across the
-- shares actually held. That understates payouts by more than half at full
-- subscription (stock_boost*0.5/shares_sold vs. the correct
-- (base_earnings+stock_boost)/100) and — because base_earnings was read
-- from habit_completions.earnings, which already has the streak bonus baked
-- in — silently let an owner's streak inflate the dividend rate too, which
-- the in-app "How dividends work" explainer never promises (it ties payout
-- size only to shares sold, not to streak).
--
-- Fix: compute complete_income from the pure pre-streak base pay (now
-- threaded through as p_base_earnings by every caller) plus the stock
-- boost, and pay each share complete_income/100 directly instead of
-- re-deriving a rate from a shrunken pool.
DROP FUNCTION IF EXISTS process_habit_completion_dividends(UUID, NUMERIC);
CREATE OR REPLACE FUNCTION process_habit_completion_dividends(
    completion_uuid UUID,
    p_stock_boost_amount NUMERIC DEFAULT NULL,
    p_base_earnings NUMERIC DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    habit_business_uuid UUID;
    business_owner_id UUID;
    stock_uuid UUID;
    base_earnings NUMERIC;
    stock_boost NUMERIC := 0;
    complete_income NUMERIC;
    total_dividend_pool NUMERIC;
    dividend_payment_uuid UUID;
    stockholder RECORD;
    dividend_per_share NUMERIC;
    stockholder_dividend NUMERIC;
    shares_owned_by_owner INTEGER;
    shares_available INTEGER;
    total_shares_issued INTEGER;
    shares_sold_to_investors INTEGER;
    stock_boost_percentage NUMERIC;
    holder_count INTEGER;
    shares_held_total INTEGER;
BEGIN
    -- Get completion details
    SELECT habit_business_id,
        user_id,
        earnings INTO habit_business_uuid,
        business_owner_id,
        base_earnings
    FROM habit_completions
    WHERE id = completion_uuid;

    -- Get stock details
    SELECT bs.id,
        bs.shares_owned_by_owner,
        bs.shares_available,
        bs.total_shares_issued INTO stock_uuid,
        shares_owned_by_owner,
        shares_available,
        total_shares_issued
    FROM business_stocks bs
    WHERE bs.habit_business_id = habit_business_uuid;

    IF stock_uuid IS NULL THEN
        RETURN; -- No stock exists for this business
    END IF;

    -- How many external stockholders are there?
    SELECT COUNT(*) INTO holder_count
    FROM stock_holdings
    WHERE stock_id = stock_uuid
        AND shares_owned > 0;

    IF holder_count = 0 THEN
        RETURN; -- No stockholders, nothing to pay
    END IF;

    IF p_stock_boost_amount IS NOT NULL THEN
        -- Use the exact dollar boost already computed by the caller
        stock_boost := GREATEST(p_stock_boost_amount, 0);
    ELSE
        -- Fallback: 1% of base pay per tradeable share actually purchased by investors
        shares_sold_to_investors := (total_shares_issued - shares_owned_by_owner) - shares_available;
        stock_boost_percentage := GREATEST(shares_sold_to_investors, 0);
        stock_boost := COALESCE(p_base_earnings, base_earnings) * (stock_boost_percentage / 100);
    END IF;

    -- "Complete income" of the business for this completion = the owner's
    -- pure base pay (pre-streak) plus the stock-ownership boost — every one
    -- of the 100 shares the business is cut into is worth 1/100th of it.
    -- Falls back to the (streak-inflated) recorded earnings only for old
    -- callers that don't pass p_base_earnings.
    complete_income := COALESCE(p_base_earnings, base_earnings) + stock_boost;
    dividend_per_share := complete_income / 100;

    SELECT COALESCE(SUM(shares_owned), 0) INTO shares_held_total
    FROM stock_holdings
    WHERE stock_id = stock_uuid
        AND shares_owned > 0;

    total_dividend_pool := dividend_per_share * shares_held_total;

    -- Record the dividend payment event
    INSERT INTO dividend_payments (
            stock_id,
            habit_completion_id,
            business_owner_id,
            base_earnings,
            stock_boost_amount,
            total_dividend_pool
        )
    VALUES (
            stock_uuid,
            completion_uuid,
            business_owner_id,
            COALESCE(p_base_earnings, base_earnings),
            stock_boost,
            total_dividend_pool
        )
    RETURNING id INTO dividend_payment_uuid;

    FOR stockholder IN
        SELECT holder_id,
            shares_owned
        FROM stock_holdings
        WHERE stock_id = stock_uuid
            AND shares_owned > 0
    LOOP
        stockholder_dividend := stockholder.shares_owned * dividend_per_share;
        -- Always pay at least $0.01 per stockholder per completion
        stockholder_dividend := GREATEST(stockholder_dividend, 0.01);

        INSERT INTO stock_dividend_distributions (
                dividend_payment_id,
                stockholder_id,
                shares_owned,
                dividend_per_share,
                total_dividend
            )
        VALUES (
                dividend_payment_uuid,
                stockholder.holder_id,
                stockholder.shares_owned,
                dividend_per_share,
                stockholder_dividend
            );

        UPDATE user_profiles
        SET cash = cash + stockholder_dividend,
            updated_at = NOW()
        WHERE id = stockholder.holder_id;

        PERFORM recalculate_net_worth(stockholder.holder_id);

        UPDATE stock_holdings
        SET total_dividends_earned = total_dividends_earned + stockholder_dividend,
            updated_at = NOW()
        WHERE holder_id = stockholder.holder_id
            AND stock_id = stock_uuid;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION process_habit_completion_dividends(UUID, NUMERIC, NUMERIC) TO authenticated;

-- ─── Thread the pure pre-streak base pay through to the dividend RPC from
-- every caller, so the fix above doesn't fall back to the streak-inflated
-- habit_completions.earnings. Each redefinition below is otherwise
-- byte-for-byte identical to its live version. ───

-- complete_habit_business (live version: 20260810000000_split_stock_streak_bonus_per_completion.sql)
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

-- complete_habit_business_yesterday (live version: 20260809010000_atomic_backdated_completion_and_undo_rpcs.sql)
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

    BEGIN
        INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at)
        VALUES (p_habit_business_id, v_user_id, v_total_earnings, v_new_streak, v_completion_time)
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

-- complete_joint_venture_checkin (live version: 20260809000000_joint_venture_pay_streak_rebalance.sql)
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

    INSERT INTO habit_completions (habit_business_id, user_id, earnings, streak_count, completed_at)
    VALUES (p_habit_business_id, v_user_id, v_base_amount, v_habit.streak, p_occurred_at)
    RETURNING id INTO v_completion_id;

    UPDATE habit_businesses
    SET total_earnings = COALESCE(total_earnings, 0) + v_base_amount,
        last_completed_at = p_occurred_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    v_total_paid_today := v_base_amount;

    IF v_checkins_before_this_one = 0 THEN
        BEGIN
            PERFORM process_habit_completion_dividends(v_completion_id, v_stock_boost, v_base_earnings);
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

NOTIFY pgrst, 'reload schema';
