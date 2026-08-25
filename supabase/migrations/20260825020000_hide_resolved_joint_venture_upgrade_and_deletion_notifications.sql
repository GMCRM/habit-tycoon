-- Joint Venture — extend the "hide once resolved" fix from
-- 20260814000000_hide_resolved_joint_venture_invites.sql to the upgrade
-- and deletion-vote flows too.
--
-- That migration stopped a resolved invite's original Accept & Pay /
-- Decline card from lingering forever by deleting the 'joint_venture_invite'
-- poke once a participant responds (their own copy) and once the whole
-- proposal resolves (everyone's copy) — accept_joint_venture_invite /
-- decline_joint_venture_invite / resolve_expired_joint_venture_proposals.
--
-- pay_joint_venture_upgrade_share / decline_joint_venture_upgrade /
-- cast_joint_venture_deletion_ballot / execute_joint_venture_deletion never
-- got the equivalent treatment — get_user_social_notifications returns
-- every social_pokes row unfiltered and the client only renders from that
-- list (see joint-venture-notification-card.component.ts), so a
-- 'joint_venture_upgrade_request' or 'joint_venture_deletion_vote' card
-- kept showing its live Pay Now/Decline or Affirm/Decline buttons to every
-- participant — including ones who'd already responded — even after the
-- whole group had resolved it one way or another. This closes that gap the
-- same way: delete the responding participant's own request poke the
-- moment they act, and delete every remaining request poke for the
-- proposal/vote once it resolves (funded/declined/expired, executed/failed).
--
-- The two client-triggered lazy expiry RPCs (resolve_expired_joint_
-- venture_upgrades / _deletion_votes, called from joint-venture.service.ts
-- resolveAllExpired() on every Home/Notifications load — same pattern as
-- resolve_expired_joint_venture_proposals) have the identical gap on the
-- expiry path specifically: they mark the proposal/vote expired and post
-- the outcome poke, but never deleted the original request poke. Fixed
-- here too, not just in the new scheduled sweep further down.

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

    -- This participant has responded — their own request card is resolved
    -- regardless of whether the set is fully funded yet.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_upgrade_request'
      AND to_user_id = p_user_id
      AND (metadata->>'upgrade_proposal_id')::UUID = p_upgrade_proposal_id;

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

    -- This payment completes the set — every remaining request card for
    -- this proposal is now stale too.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_upgrade_request'
      AND (metadata->>'upgrade_proposal_id')::UUID = p_upgrade_proposal_id;

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

    UPDATE habit_businesses
    SET business_type_id = v_new_type.id,
        business_icon = v_new_type.icon,
        cost = v_new_type.base_cost,
        earnings_per_completion = v_new_type.base_pay, -- goal_value is always 1 for a joint venture
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
GRANT EXECUTE ON FUNCTION pay_joint_venture_upgrade_share(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION decline_joint_venture_upgrade(
    p_user_id UUID,
    p_upgrade_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_upgrade_proposals%ROWTYPE;
    v_participant joint_venture_upgrade_participants%ROWTYPE;
    v_decliner_name TEXT;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_refund_row RECORD;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_upgrade_proposals WHERE id = p_upgrade_proposal_id FOR UPDATE;
    IF NOT FOUND OR v_proposal.status <> 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This upgrade request is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_upgrade_participants
    WHERE upgrade_proposal_id = p_upgrade_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this upgrade request');
    END IF;

    UPDATE joint_venture_upgrade_participants SET status = 'declined', responded_at = NOW() WHERE id = v_participant.id;
    UPDATE joint_venture_upgrade_proposals SET status = 'cancelled', updated_at = NOW() WHERE id = p_upgrade_proposal_id;

    -- The whole proposal is cancelled by this decline — every participant's
    -- request card (including this one) is now stale.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_upgrade_request'
      AND (metadata->>'upgrade_proposal_id')::UUID = p_upgrade_proposal_id;

    SELECT COALESCE(name, 'A friend') INTO v_decliner_name FROM user_profiles WHERE id = p_user_id;
    SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_proposal.habit_business_id;

    FOR v_refund_row IN
        SELECT id, user_id, share_amount FROM joint_venture_upgrade_participants
        WHERE upgrade_proposal_id = p_upgrade_proposal_id AND paid = true AND refunded_at IS NULL
    LOOP
        PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
        UPDATE joint_venture_upgrade_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
    END LOOP;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        v_decliner_name || ' declined the upgrade for "' || COALESCE(v_habit_name, 'your joint venture') || '" — everyone who paid has been refunded.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'upgrade_declined', 'habit_business_id', v_proposal.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon, 'by_user_name', v_decliner_name)
    FROM joint_venture_upgrade_participants p WHERE p.upgrade_proposal_id = p_upgrade_proposal_id AND p.user_id <> p_user_id;

    RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION decline_joint_venture_upgrade(UUID, UUID) TO authenticated;

-- ─── execute_joint_venture_deletion: not GRANTed to authenticated (called
-- internally by cast_joint_venture_deletion_ballot / defensively by
-- initiate_joint_venture_deletion) — only the added poke cleanup changes. ───
CREATE OR REPLACE FUNCTION execute_joint_venture_deletion(p_vote_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_vote joint_venture_deletion_votes%ROWTYPE;
    v_habit habit_businesses%ROWTYPE;
BEGIN
    SELECT * INTO v_vote FROM joint_venture_deletion_votes WHERE id = p_vote_id;
    SELECT * INTO v_habit FROM habit_businesses WHERE id = v_vote.habit_business_id FOR UPDATE;
    IF NOT FOUND OR NOT v_habit.is_active THEN
        RETURN;
    END IF;

    BEGIN
        PERFORM create_marketplace_listing(v_habit.user_id, v_habit.id, 'habit_deletion');
    EXCEPTION WHEN OTHERS THEN
        NULL; -- non-fatal, matches the single-owner deleteHabitBusiness() flow's own tolerance
    END;

    UPDATE habit_businesses SET is_active = false, updated_at = NOW() WHERE id = v_habit.id;
    -- business_deletion_stock_refund_trigger fires unchanged and refunds any
    -- friend-investors' stock — co-owners never hold stock in their own
    -- venture (see joint_venture_stock_exclusion.sql), so there's nothing on
    -- their side to refund.

    UPDATE joint_venture_deletion_votes SET status = 'executed', updated_at = NOW() WHERE id = p_vote_id;

    -- The vote is decided by this execution — every co-owner's vote-request
    -- card for it is now stale.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_deletion_vote'
      AND (metadata->>'vote_id')::UUID = p_vote_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        v_vote.initiator_id, bco.user_id,
        '🗑️ "' || v_habit.business_name || '" was deleted — it''s on the Marketplace, and proceeds will split evenly among all of you.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'deleted', 'habit_business_id', v_habit.id, 'business_name', v_habit.business_name, 'business_icon', v_habit.business_icon)
    FROM business_co_owners bco WHERE bco.habit_business_id = v_habit.id;
END;
$$;

CREATE OR REPLACE FUNCTION cast_joint_venture_deletion_ballot(
    p_user_id UUID,
    p_vote_id UUID,
    p_ballot TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_vote joint_venture_deletion_votes%ROWTYPE;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_voter_name TEXT;
    v_n INTEGER;
    v_required_yes INTEGER;
    v_yes_count INTEGER;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    IF p_ballot NOT IN ('yes', 'no') THEN
        RAISE EXCEPTION 'Invalid ballot';
    END IF;

    SELECT * INTO v_vote FROM joint_venture_deletion_votes WHERE id = p_vote_id FOR UPDATE;
    IF NOT FOUND OR v_vote.status <> 'pending' OR v_vote.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This vote is no longer open');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = v_vote.habit_business_id AND bco.user_id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not a co-owner of this business');
    END IF;
    IF EXISTS (SELECT 1 FROM joint_venture_deletion_ballots WHERE vote_id = p_vote_id AND user_id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already voted');
    END IF;

    INSERT INTO joint_venture_deletion_ballots (vote_id, user_id, ballot) VALUES (p_vote_id, p_user_id, p_ballot);

    -- This co-owner has voted either way — their own vote-request card is
    -- resolved regardless of whether the tally has reached a majority yet.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_deletion_vote'
      AND to_user_id = p_user_id
      AND (metadata->>'vote_id')::UUID = p_vote_id;

    IF p_ballot = 'no' THEN
        UPDATE joint_venture_deletion_votes SET status = 'cancelled', updated_at = NOW() WHERE id = p_vote_id;

        -- A single "no" cancels the whole vote — every remaining
        -- vote-request card for it is now stale.
        DELETE FROM social_pokes
        WHERE type = 'joint_venture_deletion_vote'
          AND (metadata->>'vote_id')::UUID = p_vote_id;

        SELECT COALESCE(name, 'A friend') INTO v_voter_name FROM user_profiles WHERE id = p_user_id;
        SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_vote.habit_business_id;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            p_user_id, bco.user_id,
            v_voter_name || ' voted against deleting "' || COALESCE(v_habit_name, 'your joint venture') || '" — it stays as-is.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'vote_failed', 'habit_business_id', v_vote.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon, 'by_user_name', v_voter_name)
        FROM business_co_owners bco WHERE bco.habit_business_id = v_vote.habit_business_id AND bco.user_id <> p_user_id;

        RETURN jsonb_build_object('success', true, 'executed', false, 'cancelled', true);
    END IF;

    SELECT COUNT(*) INTO v_n FROM business_co_owners WHERE habit_business_id = v_vote.habit_business_id;
    v_required_yes := (v_n / 2) + 1;
    SELECT COUNT(*) INTO v_yes_count FROM joint_venture_deletion_ballots WHERE vote_id = p_vote_id AND ballot = 'yes';

    IF v_yes_count >= v_required_yes THEN
        PERFORM execute_joint_venture_deletion(p_vote_id);
        RETURN jsonb_build_object('success', true, 'executed', true);
    END IF;

    RETURN jsonb_build_object('success', true, 'executed', false, 'yes_count', v_yes_count, 'required_yes', v_required_yes, 'total_co_owners', v_n);
END;
$$;
GRANT EXECUTE ON FUNCTION cast_joint_venture_deletion_ballot(UUID, UUID, TEXT) TO authenticated;

-- ─── resolve_expired_joint_venture_upgrades / _deletion_votes: same
-- lazy per-user expiry shape as resolve_expired_joint_venture_proposals,
-- now also deleting the stale request poke(s) it always should have. ───
CREATE OR REPLACE FUNCTION resolve_expired_joint_venture_upgrades(p_user_id UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal_id UUID;
    v_proposal joint_venture_upgrade_proposals%ROWTYPE;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_refund_row RECORD;
    v_resolved_count INTEGER := 0;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    FOR v_proposal_id IN
        SELECT DISTINCT jvp.id
        FROM joint_venture_upgrade_proposals jvp
        JOIN joint_venture_upgrade_participants p ON p.upgrade_proposal_id = jvp.id
        WHERE p.user_id = p_user_id AND jvp.status = 'pending' AND jvp.expires_at <= NOW()
    LOOP
        SELECT * INTO v_proposal FROM joint_venture_upgrade_proposals WHERE id = v_proposal_id FOR UPDATE;
        IF v_proposal.status <> 'pending' OR v_proposal.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_upgrade_proposals SET status = 'expired', updated_at = NOW() WHERE id = v_proposal_id;
        SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_proposal.habit_business_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_upgrade_request'
          AND (metadata->>'upgrade_proposal_id')::UUID = v_proposal_id;

        FOR v_refund_row IN
            SELECT id, user_id, share_amount FROM joint_venture_upgrade_participants
            WHERE upgrade_proposal_id = v_proposal_id AND paid = true AND refunded_at IS NULL
        LOOP
            PERFORM adjust_user_cash(v_refund_row.user_id, v_refund_row.share_amount);
            UPDATE joint_venture_upgrade_participants SET refunded_at = NOW() WHERE id = v_refund_row.id;
        END LOOP;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_proposal.initiator_id, p.user_id,
            'The upgrade for "' || COALESCE(v_habit_name, 'your joint venture') || '" wasn''t fully funded in time — everyone who paid has been refunded.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'upgrade_expired', 'habit_business_id', v_proposal.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon)
        FROM joint_venture_upgrade_participants p WHERE p.upgrade_proposal_id = v_proposal_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_expired_joint_venture_upgrades(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION resolve_expired_joint_venture_deletion_votes(p_user_id UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_vote_id UUID;
    v_vote joint_venture_deletion_votes%ROWTYPE;
    v_habit_name TEXT;
    v_habit_icon TEXT;
    v_resolved_count INTEGER := 0;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    FOR v_vote_id IN
        SELECT DISTINCT v.id
        FROM joint_venture_deletion_votes v
        JOIN business_co_owners bco ON bco.habit_business_id = v.habit_business_id
        WHERE bco.user_id = p_user_id AND v.status = 'pending' AND v.expires_at <= NOW()
    LOOP
        SELECT * INTO v_vote FROM joint_venture_deletion_votes WHERE id = v_vote_id FOR UPDATE;
        IF v_vote.status <> 'pending' OR v_vote.expires_at > NOW() THEN
            CONTINUE;
        END IF;

        UPDATE joint_venture_deletion_votes SET status = 'expired', updated_at = NOW() WHERE id = v_vote_id;
        SELECT business_name, business_icon INTO v_habit_name, v_habit_icon FROM habit_businesses WHERE id = v_vote.habit_business_id;

        DELETE FROM social_pokes
        WHERE type = 'joint_venture_deletion_vote'
          AND (metadata->>'vote_id')::UUID = v_vote_id;

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        SELECT
            v_vote.initiator_id, bco.user_id,
            'The vote to delete "' || COALESCE(v_habit_name, 'your joint venture') || '" didn''t reach a majority in time — it stays as-is.',
            'joint_venture_resolved', false,
            jsonb_build_object('outcome', 'vote_expired', 'habit_business_id', v_vote.habit_business_id, 'business_name', v_habit_name, 'business_icon', v_habit_icon)
        FROM business_co_owners bco WHERE bco.habit_business_id = v_vote.habit_business_id;

        v_resolved_count := v_resolved_count + 1;
    END LOOP;

    RETURN v_resolved_count;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_expired_joint_venture_deletion_votes(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
