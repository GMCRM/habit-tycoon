-- Joint Venture — stop showing a resolved invite's original "Accept & Pay /
-- Decline" card once the proposal is no longer pending.
--
-- accept_joint_venture_invite / decline_joint_venture_invite /
-- resolve_expired_joint_venture_proposals already insert a fresh
-- 'joint_venture_resolved' poke describing the outcome (funded/declined/
-- expired), but never touched the original 'joint_venture_invite' poke that
-- prompted the response. get_user_social_notifications() returns every poke
-- unfiltered, so the stale invite card (still showing live Accept & Pay /
-- Decline buttons and a now-meaningless countdown) kept rendering forever
-- alongside the new outcome card. Deleting the original invite poke(s) for
-- the proposal once it leaves 'pending' makes the stale listing disappear —
-- the outcome poke already carries the news.

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

    -- This participant has responded — their own invite card is resolved
    -- regardless of whether the set is fully funded yet.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_invite'
      AND to_user_id = p_user_id
      AND (metadata->>'proposal_id')::UUID = p_proposal_id;

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
    -- goal_value is always 1 for a joint venture (see the v1 habit-shape
    -- CHECK constraint), so this mirrors calculateReasonableEarnings(base_pay, 1)
    -- client-side: base_pay / 1, already within its own clamp bounds.
    v_earnings_per_completion := v_business_type.base_pay;

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

    -- Every remaining participant has now had this proposal resolved out
    -- from under them too — clear any invite cards still on their feed
    -- (a still-'invited' participant can't happen here since v_accepted_count
    -- = v_total_count just proved everyone paid, but this also mops up the
    -- creator's own copy of the notification stream if one ever exists).
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_invite'
      AND (metadata->>'proposal_id')::UUID = p_proposal_id;

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
GRANT EXECUTE ON FUNCTION accept_joint_venture_invite(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION decline_joint_venture_invite(
    p_user_id UUID,
    p_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_proposals%ROWTYPE;
    v_participant joint_venture_participants%ROWTYPE;
    v_decliner_name TEXT;
    v_refund_row RECORD;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND OR v_proposal.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This invite is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_participants
    WHERE proposal_id = p_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this invite');
    END IF;

    UPDATE joint_venture_participants SET status = 'declined', responded_at = NOW() WHERE id = v_participant.id;
    UPDATE joint_venture_proposals SET status = 'cancelled', updated_at = NOW() WHERE id = p_proposal_id;

    -- The whole proposal is cancelled by this decline — every participant's
    -- invite card (including this one) is now stale.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_invite'
      AND (metadata->>'proposal_id')::UUID = p_proposal_id;

    SELECT COALESCE(name, 'A friend') INTO v_decliner_name FROM user_profiles WHERE id = p_user_id;

    FOR v_refund_row IN
        SELECT id, user_id, share_amount FROM joint_venture_participants
        WHERE proposal_id = p_proposal_id AND paid = true AND refunded_at IS NULL
    LOOP
        PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
        UPDATE joint_venture_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
    END LOOP;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        v_decliner_name || ' declined to join "' || v_proposal.business_name || '" — everyone who paid has been refunded.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'declined', 'proposal_id', p_proposal_id, 'business_name', v_proposal.business_name, 'business_icon', v_proposal.business_icon, 'by_user_name', v_decliner_name)
    FROM joint_venture_participants p WHERE p.proposal_id = p_proposal_id AND p.user_id <> p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION decline_joint_venture_invite(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION resolve_expired_joint_venture_proposals(p_user_id UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal_id UUID;
    v_proposal joint_venture_proposals%ROWTYPE;
    v_refund_row RECORD;
    v_resolved_count INTEGER := 0;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    FOR v_proposal_id IN
        SELECT DISTINCT jvp.id
        FROM joint_venture_proposals jvp
        JOIN joint_venture_participants p ON p.proposal_id = jvp.id
        WHERE p.user_id = p_user_id AND jvp.status = 'pending' AND jvp.expires_at <= NOW()
    LOOP
        SELECT * INTO v_proposal FROM joint_venture_proposals WHERE id = v_proposal_id FOR UPDATE;
        -- Re-check after acquiring the lock — another participant's page
        -- load may have already resolved this one first.
        IF v_proposal.status <> 'pending' OR v_proposal.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_proposals SET status = 'expired', updated_at = NOW() WHERE id = v_proposal_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_invite'
          AND (metadata->>'proposal_id')::UUID = v_proposal_id;

        FOR v_refund_row IN
            SELECT id, user_id, share_amount FROM joint_venture_participants
            WHERE proposal_id = v_proposal_id AND paid = true AND refunded_at IS NULL
        LOOP
            PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
            UPDATE joint_venture_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
        END LOOP;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_proposal.creator_id, p.user_id,
            '"' || v_proposal.business_name || '" wasn''t fully funded in time — everyone who paid has been refunded.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'expired', 'proposal_id', v_proposal_id, 'business_name', v_proposal.business_name, 'business_icon', v_proposal.business_icon)
        FROM joint_venture_participants p WHERE p.proposal_id = v_proposal_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_expired_joint_venture_proposals(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
