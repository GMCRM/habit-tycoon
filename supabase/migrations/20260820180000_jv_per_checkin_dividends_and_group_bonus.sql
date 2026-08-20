-- Joint-venture dividends: pay stockholders on every co-owner's check-in
-- (not just the first), and pay the group's streak bonus to stockholders
-- immediately once the last co-owner checks in.
--
-- Product intent: co-owners get their own payout at the moment they check
-- in (the "dopamine hit"), and as soon as the final co-owner completes for
-- the day, everyone — co-owners AND stockholders — gets the streak bonus
-- right away.
--
-- Two gaps in complete_joint_venture_checkin (live version:
-- 20260810010000_fix_dividend_per_share_formula.sql) stood in the way:
--
-- 1. process_habit_completion_dividends was only ever invoked when
--    v_checkins_before_this_one = 0 (the FIRST co-owner of the day), using
--    only that one completion's earnings. Every other co-owner's check-in —
--    and their share of "complete income" — never generated a dividend
--    event at all. Fix: call it for every check-in.
--
-- 2. The streak bonus is computed and paid to co-owners only once full
--    attendance is reached, by directly UPDATE-ing each already-recorded
--    habit_completions row — after process_habit_completion_dividends (for
--    that row) already ran. Stockholders never saw a cent of it. Fix: sum
--    the bonus paid to every co-owner into v_total_group_bonus and, once
--    the finalization loop completes, distribute that pool to stockholders
--    via a new process_joint_venture_streak_bonus_dividend() — the group
--    bonus isn't any single co-owner's completion, so it isn't tied to one.
--
-- dividend_payments.habit_completion_id was NOT NULL with a UNIQUE
-- constraint (one dividend event per completion). The per-check-in
-- dividends above still satisfy that — each co-owner's check-in has its own
-- completion row. The group-bonus event has no single completion to point
-- at, so habit_completion_id is relaxed to nullable; multiple NULLs don't
-- collide with a UNIQUE constraint in Postgres, so no further schema change
-- is needed.
ALTER TABLE dividend_payments ALTER COLUMN habit_completion_id DROP NOT NULL;

-- Pays stockholders a lump dividend that isn't tied to any single
-- completion — used for a joint venture's group streak bonus once full
-- attendance is reached for the day. Mirrors process_habit_completion_dividends'
-- payout loop (same $0.01-per-stockholder floor, same bookkeeping) but takes
-- the dividend base as an explicit dollar amount instead of reading it off a
-- habit_completions row.
CREATE OR REPLACE FUNCTION process_joint_venture_streak_bonus_dividend(
    p_habit_business_id UUID,
    p_total_bonus_amount NUMERIC
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    stock_uuid UUID;
    business_owner_id UUID;
    total_shares_issued INTEGER;
    holder_count INTEGER;
    dividend_per_share NUMERIC;
    total_dividend_pool NUMERIC;
    dividend_payment_uuid UUID;
    stockholder RECORD;
    stockholder_dividend NUMERIC;
    shares_held_total INTEGER;
BEGIN
    IF p_total_bonus_amount IS NULL OR p_total_bonus_amount <= 0 THEN
        RETURN; -- Nothing to distribute (e.g. day 1 of a streak, no bonus yet)
    END IF;

    SELECT bs.id, bs.total_shares_issued INTO stock_uuid, total_shares_issued
    FROM business_stocks bs
    WHERE bs.habit_business_id = p_habit_business_id;

    IF stock_uuid IS NULL THEN
        RETURN; -- No stock exists for this business
    END IF;

    SELECT COUNT(*) INTO holder_count
    FROM stock_holdings
    WHERE stock_id = stock_uuid AND shares_owned > 0;

    IF holder_count = 0 THEN
        RETURN; -- No stockholders, nothing to pay
    END IF;

    SELECT user_id INTO business_owner_id FROM habit_businesses WHERE id = p_habit_business_id;

    dividend_per_share := p_total_bonus_amount / COALESCE(NULLIF(total_shares_issued, 0), 100);

    SELECT COALESCE(SUM(shares_owned), 0) INTO shares_held_total
    FROM stock_holdings
    WHERE stock_id = stock_uuid AND shares_owned > 0;

    total_dividend_pool := dividend_per_share * shares_held_total;

    -- No single completion represents the whole group's bonus, so
    -- habit_completion_id is left NULL (see the ALTER TABLE above).
    INSERT INTO dividend_payments (
            stock_id, habit_completion_id, business_owner_id,
            base_earnings, stock_boost_amount, total_dividend_pool
        )
    VALUES (
            stock_uuid, NULL, business_owner_id,
            p_total_bonus_amount, 0, total_dividend_pool
        )
    RETURNING id INTO dividend_payment_uuid;

    FOR stockholder IN
        SELECT holder_id, shares_owned
        FROM stock_holdings
        WHERE stock_id = stock_uuid AND shares_owned > 0
    LOOP
        stockholder_dividend := stockholder.shares_owned * dividend_per_share;
        -- Always pay at least $0.01 per stockholder, same as a regular completion dividend
        stockholder_dividend := GREATEST(stockholder_dividend, 0.01);

        INSERT INTO stock_dividend_distributions (
                dividend_payment_id, stockholder_id, shares_owned,
                dividend_per_share, total_dividend
            )
        VALUES (
                dividend_payment_uuid, stockholder.holder_id, stockholder.shares_owned,
                dividend_per_share, stockholder_dividend
            );

        UPDATE user_profiles
        SET cash = cash + stockholder_dividend, updated_at = NOW()
        WHERE id = stockholder.holder_id;

        PERFORM recalculate_net_worth(stockholder.holder_id);

        UPDATE stock_holdings
        SET total_dividends_earned = total_dividends_earned + stockholder_dividend, updated_at = NOW()
        WHERE holder_id = stockholder.holder_id AND stock_id = stock_uuid;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION process_joint_venture_streak_bonus_dividend(UUID, NUMERIC) TO authenticated;

-- complete_joint_venture_checkin, updated per the two fixes above. Everything
-- else is byte-for-byte identical to the live version
-- (20260810010000_fix_dividend_per_share_formula.sql).
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
            NULL;
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
