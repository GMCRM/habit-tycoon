-- Joint Venture — rebalance per-owner pay and the group streak-bonus cap.
--
-- Two problems with the original JV economy: every co-owner earned the
-- FULL base_pay per check-in (never divided, unlike the cost split), and
-- the group streak bonus was a flat 200% cap no matter how many co-owners
-- were in the venture. Together, total payout at a maxed streak grew
-- roughly 3x base_pay per owner — the more friends you add, the more
-- money the venture prints, with no real ceiling.
--
-- This migration: (1) divides base_pay across owners, rounded up to the
-- cent, mirroring the existing cost-split's per-owner divisor; and (2)
-- scales the streak-bonus cap with owner count instead of a flat 200%
-- (owners * 20 + 200, e.g. 240% at 2 owners, 300% at 5 owners), still
-- ramping up over the same 10-day window. Solo (non-JV) businesses are
-- untouched — they keep their existing 100% cap / 0.1-per-day rate.

CREATE OR REPLACE FUNCTION accept_joint_venture_invite(
    p_user_id UUID,
    p_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_proposals%ROWTYPE;
    v_participant joint_venture_participants%ROWTYPE;
    v_cash NUMERIC;
    v_accepted_count INTEGER;
    v_total_count INTEGER;
    v_business_type business_types%ROWTYPE;
    v_habit_business_id UUID;
    v_next_order INTEGER;
    v_earnings_per_completion NUMERIC;
    v_participant_row RECORD;
    v_waiting_on TEXT[];
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invite not found');
    END IF;
    IF v_proposal.status <> 'pending' OR v_proposal.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This invite is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_participants
    WHERE proposal_id = p_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this invite');
    END IF;

    SELECT cash INTO v_cash FROM user_profiles WHERE id = p_user_id;
    IF v_cash IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    IF v_cash < v_participant.share_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_participant.share_amount || ')');
    END IF;

    PERFORM adjust_user_cash(p_user_id, -v_participant.share_amount);
    UPDATE joint_venture_participants
    SET status = 'accepted', paid = true, paid_at = NOW(), responded_at = NOW()
    WHERE id = v_participant.id;

    SELECT COUNT(*) FILTER (WHERE status = 'accepted' AND paid), COUNT(*)
    INTO v_accepted_count, v_total_count
    FROM joint_venture_participants WHERE proposal_id = p_proposal_id;

    IF v_accepted_count < v_total_count THEN
        SELECT ARRAY(
            SELECT COALESCE(up.name, 'A friend')
            FROM joint_venture_participants p
            JOIN user_profiles up ON up.id = p.user_id
            WHERE p.proposal_id = p_proposal_id AND p.status = 'invited'
        ) INTO v_waiting_on;
        RETURN jsonb_build_object(
            'success', true, 'fully_funded', false,
            'accepted_count', v_accepted_count, 'total_count', v_total_count,
            'waiting_on', to_jsonb(v_waiting_on)
        );
    END IF;

    -- This acceptance is the one that completes the set — materialize the
    -- real business now.
    SELECT * INTO v_business_type FROM business_types WHERE id = v_proposal.business_type_id;
    -- Base pay is split across all co-owners (rounded up to the cent, same
    -- divisor pattern as the cost split) instead of paying each owner the
    -- full base_pay — see this migration's header for why.
    v_earnings_per_completion := CEIL(v_business_type.base_pay / v_total_count * 100) / 100;

    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_next_order
    FROM habit_businesses WHERE user_id = v_proposal.creator_id AND is_active = true;

    INSERT INTO habit_businesses (
        user_id, business_type_id, business_name, business_icon, cost, habit_description,
        recurrence_interval, goal_value, current_progress, earnings_per_completion,
        streak, total_completions, total_earnings, is_active, display_order, user_custom_order,
        is_joint_venture, joint_venture_timezone
    ) VALUES (
        v_proposal.creator_id, v_proposal.business_type_id, v_proposal.business_name, v_proposal.business_icon,
        v_proposal.total_cost, v_proposal.habit_description,
        '24h', 1, 0, v_earnings_per_completion,
        0, 0, 0, true, v_next_order, v_next_order,
        true, v_proposal.creator_timezone
    ) RETURNING id INTO v_habit_business_id;
    -- create_stock_on_business_creation fires unchanged and creates the
    -- matching business_stocks row (business_owner_id = creator, kept only
    -- as the anchor row the existing stock machinery expects — actual
    -- exclusion of every co-owner from buying/holding stock is enforced in
    -- joint_venture_stock_exclusion.sql).

    FOR v_participant_row IN SELECT user_id, is_creator FROM joint_venture_participants WHERE proposal_id = p_proposal_id LOOP
        INSERT INTO business_co_owners (habit_business_id, user_id, is_creator)
        VALUES (v_habit_business_id, v_participant_row.user_id, v_participant_row.is_creator);
    END LOOP;

    UPDATE joint_venture_proposals
    SET status = 'funded', resulting_habit_business_id = v_habit_business_id, updated_at = NOW()
    WHERE id = p_proposal_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        '🎉 "' || v_proposal.business_name || '" is fully funded and live on everyone''s home page!',
        'joint_venture_resolved', false,
        jsonb_build_object(
            'outcome', 'funded',
            'proposal_id', p_proposal_id,
            'habit_business_id', v_habit_business_id,
            'business_name', v_proposal.business_name,
            'business_icon', v_proposal.business_icon
        )
    FROM joint_venture_participants p WHERE p.proposal_id = p_proposal_id;

    RETURN jsonb_build_object('success', true, 'fully_funded', true, 'habit_business_id', v_habit_business_id);
END;
$$;

CREATE OR REPLACE FUNCTION pay_joint_venture_upgrade_share(
    p_user_id UUID,
    p_upgrade_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_upgrade_proposals%ROWTYPE;
    v_participant joint_venture_upgrade_participants%ROWTYPE;
    v_cash NUMERIC;
    v_paid_count INTEGER;
    v_total_count INTEGER;
    v_habit habit_businesses%ROWTYPE;
    v_new_type business_types%ROWTYPE;
    v_waiting_on TEXT[];
    v_owner_count INTEGER;
    v_earnings_per_completion NUMERIC;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_upgrade_proposals WHERE id = p_upgrade_proposal_id FOR UPDATE;
    IF NOT FOUND OR v_proposal.status <> 'pending' OR v_proposal.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This upgrade request is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_upgrade_participants
    WHERE upgrade_proposal_id = p_upgrade_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this upgrade request');
    END IF;

    SELECT cash INTO v_cash FROM user_profiles WHERE id = p_user_id;
    IF v_cash < v_participant.share_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_participant.share_amount || ')');
    END IF;

    PERFORM adjust_user_cash(p_user_id, -v_participant.share_amount);
    UPDATE joint_venture_upgrade_participants
    SET status = 'accepted', paid = true, paid_at = NOW(), responded_at = NOW()
    WHERE id = v_participant.id;

    SELECT COUNT(*) FILTER (WHERE status = 'accepted' AND paid), COUNT(*)
    INTO v_paid_count, v_total_count
    FROM joint_venture_upgrade_participants WHERE upgrade_proposal_id = p_upgrade_proposal_id;

    IF v_paid_count < v_total_count THEN
        SELECT ARRAY(
            SELECT COALESCE(up.name, 'A friend')
            FROM joint_venture_upgrade_participants p
            JOIN user_profiles up ON up.id = p.user_id
            WHERE p.upgrade_proposal_id = p_upgrade_proposal_id AND p.status = 'invited'
        ) INTO v_waiting_on;
        RETURN jsonb_build_object(
            'success', true, 'fully_funded', false,
            'paid_count', v_paid_count, 'total_count', v_total_count,
            'waiting_on', to_jsonb(v_waiting_on)
        );
    END IF;

    -- This payment completes the set — apply the upgrade now.
    SELECT * INTO v_habit FROM habit_businesses WHERE id = v_proposal.habit_business_id FOR UPDATE;
    IF NOT FOUND OR NOT v_habit.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'This business is no longer active');
    END IF;
    SELECT * INTO v_new_type FROM business_types WHERE id = v_proposal.new_business_type_id;

    BEGIN
        PERFORM create_marketplace_listing(v_habit.user_id, v_habit.id, 'upgrade');
    EXCEPTION WHEN OTHERS THEN
        NULL; -- non-fatal, matches the single-owner upgradeHabitBusiness() flow's own tolerance
    END;

    SELECT COUNT(*) INTO v_owner_count FROM business_co_owners WHERE habit_business_id = v_habit.id;
    -- Same per-owner split as business creation — see this migration's header.
    v_earnings_per_completion := CEIL(v_new_type.base_pay / v_owner_count * 100) / 100;

    UPDATE habit_businesses
    SET business_type_id = v_new_type.id,
        business_icon = v_new_type.icon,
        cost = v_new_type.base_cost,
        earnings_per_completion = v_earnings_per_completion,
        marketplace_bonus_percent = NULL,
        updated_at = NOW()
    WHERE id = v_habit.id;

    UPDATE joint_venture_upgrade_proposals SET status = 'applied', updated_at = NOW() WHERE id = p_upgrade_proposal_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        '⬆️ "' || v_habit.business_name || '" upgraded to ' || v_new_type.name || '! The old version is on the Marketplace for a friend to buy.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'upgraded', 'habit_business_id', v_habit.id, 'business_name', v_habit.business_name, 'business_icon', v_new_type.icon)
    FROM joint_venture_upgrade_participants p WHERE p.upgrade_proposal_id = p_upgrade_proposal_id;

    RETURN jsonb_build_object('success', true, 'fully_funded', true, 'habit_business_id', v_habit.id);
END;
$$;

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
