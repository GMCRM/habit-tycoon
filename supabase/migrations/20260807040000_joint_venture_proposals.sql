-- Joint Venture — creation staging: propose, invite, accept/decline, fund.
--
-- Modeled directly on the existing marketplace_listings/marketplace_purchases
-- split (snapshot now, materialize later). habit_businesses is deliberately
-- NOT touched until every invitee has paid — is_active is the only status
-- flag that table has today, and every business-listing query filters on
-- it, so inserting a half-funded row would risk it leaking into places it
-- shouldn't. Only once a proposal is fully funded does
-- accept_joint_venture_invite() insert the real habit_businesses +
-- business_co_owners (+, via the existing create_stock_on_business_creation
-- trigger, business_stocks) rows.

CREATE TABLE IF NOT EXISTS joint_venture_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    business_name TEXT NOT NULL,
    business_icon TEXT NOT NULL,
    habit_description TEXT NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    creator_timezone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'cancelled', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    resulting_habit_business_id UUID NULL REFERENCES habit_businesses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_joint_venture_proposals_creator_id ON joint_venture_proposals(creator_id);
CREATE INDEX IF NOT EXISTS idx_joint_venture_proposals_status_expires_at ON joint_venture_proposals(status, expires_at);

CREATE TABLE IF NOT EXISTS joint_venture_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES joint_venture_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_creator BOOLEAN NOT NULL DEFAULT false,
    share_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
    paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (proposal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_joint_venture_participants_proposal_id ON joint_venture_participants(proposal_id);
CREATE INDEX IF NOT EXISTS idx_joint_venture_participants_user_id ON joint_venture_participants(user_id);

ALTER TABLE joint_venture_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_venture_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their own proposals" ON joint_venture_proposals;
CREATE POLICY "Participants can view their own proposals" ON joint_venture_proposals FOR
SELECT USING (
    auth.uid() = creator_id OR EXISTS (
        SELECT 1 FROM joint_venture_participants p
        WHERE p.proposal_id = joint_venture_proposals.id AND p.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Participants can view their own participant rows" ON joint_venture_participants;
CREATE POLICY "Participants can view their own participant rows" ON joint_venture_participants FOR
SELECT USING (auth.uid() = user_id);
-- No client INSERT/UPDATE/DELETE policy on either table — every write goes
-- through the SECURITY DEFINER RPCs below.

-- ─── create_joint_venture_proposal: creator picks friends, pays their own
-- share immediately, invitees get a notification. ───
CREATE OR REPLACE FUNCTION create_joint_venture_proposal(
    p_creator_id UUID,
    p_business_type_id INTEGER,
    p_business_name TEXT,
    p_habit_description TEXT,
    p_invitee_ids UUID[],
    p_creator_timezone TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_invitee_ids UUID[];
    v_business_type business_types%ROWTYPE;
    v_n INTEGER;
    v_share_others NUMERIC(10, 2);
    v_creator_share NUMERIC(10, 2);
    v_creator_cash NUMERIC;
    v_creator_name TEXT;
    v_proposal_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_friend_count INTEGER;
    v_invitee_id UUID;
BEGIN
    IF p_creator_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Dedupe, and strip the creator's own id if it was somehow included.
    SELECT ARRAY(
        SELECT DISTINCT invitee_id FROM unnest(p_invitee_ids) AS invitee_id
        WHERE invitee_id <> p_creator_id
    ) INTO v_invitee_ids;

    IF v_invitee_ids IS NULL OR array_length(v_invitee_ids, 1) IS NULL OR array_length(v_invitee_ids, 1) < 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Select at least one friend to invite');
    END IF;

    SELECT COUNT(*) INTO v_friend_count
    FROM unnest(v_invitee_ids) AS invitee_id
    WHERE EXISTS (
        SELECT 1 FROM friendships f
        WHERE f.status = 'accepted'
          AND (
            (f.user_id = p_creator_id AND f.friend_id = invitee_id)
            OR (f.user_id = invitee_id AND f.friend_id = p_creator_id)
          )
    );
    IF v_friend_count <> array_length(v_invitee_ids, 1) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You can only invite accepted friends');
    END IF;

    SELECT * INTO v_business_type FROM business_types WHERE id = p_business_type_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid business type');
    END IF;

    IF COALESCE(TRIM(p_business_name), '') = '' OR COALESCE(TRIM(p_habit_description), '') = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'A habit name and description are required');
    END IF;

    v_n := array_length(v_invitee_ids, 1) + 1;
    -- Split/rounding rule: every non-initiating participant pays the same
    -- rounded share; the initiator absorbs the rounding remainder so the
    -- total collected always equals total_cost exactly.
    v_share_others := ROUND(v_business_type.base_cost / v_n, 2);
    v_creator_share := v_business_type.base_cost - v_share_others * (v_n - 1);

    SELECT cash, COALESCE(name, 'A friend') INTO v_creator_cash, v_creator_name
    FROM user_profiles WHERE id = p_creator_id;
    IF v_creator_cash IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    IF v_creator_cash < v_creator_share THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_creator_share || ')');
    END IF;

    INSERT INTO joint_venture_proposals (
        creator_id, business_type_id, business_name, business_icon, habit_description, total_cost, creator_timezone
    ) VALUES (
        p_creator_id, p_business_type_id, TRIM(p_business_name), v_business_type.icon, TRIM(p_habit_description), v_business_type.base_cost, p_creator_timezone
    ) RETURNING id, expires_at INTO v_proposal_id, v_expires_at;

    -- Creator pays their own share immediately and is pre-accepted.
    INSERT INTO joint_venture_participants (proposal_id, user_id, is_creator, share_amount, status, paid, paid_at, responded_at)
    VALUES (v_proposal_id, p_creator_id, true, v_creator_share, 'accepted', true, NOW(), NOW());
    PERFORM adjust_user_cash(p_creator_id, -v_creator_share);

    FOREACH v_invitee_id IN ARRAY v_invitee_ids LOOP
        INSERT INTO joint_venture_participants (proposal_id, user_id, is_creator, share_amount, status, paid)
        VALUES (v_proposal_id, v_invitee_id, false, v_share_others, 'invited', false);

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        VALUES (
            p_creator_id, v_invitee_id,
            v_creator_name || ' invited you to co-found this business — $' || v_share_others || ' to join.',
            'joint_venture_invite', false,
            jsonb_build_object(
                'proposal_id', v_proposal_id,
                'business_name', TRIM(p_business_name),
                'business_icon', v_business_type.icon,
                'business_type_name', v_business_type.name,
                'habit_description', TRIM(p_habit_description),
                'share_amount', v_share_others,
                'total_cost', v_business_type.base_cost,
                'co_owner_count', v_n,
                'creator_name', v_creator_name,
                'expires_at', v_expires_at
            )
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'proposal_id', v_proposal_id,
        'creator_share', v_creator_share,
        'share_amount', v_share_others,
        'co_owner_count', v_n,
        'expires_at', v_expires_at
    );
END;
$$;
GRANT EXECUTE ON FUNCTION create_joint_venture_proposal(UUID, INTEGER, TEXT, TEXT, UUID[], TEXT) TO authenticated;

-- ─── accept_joint_venture_invite: pay your share; the acceptance that
-- completes the set materializes the real business. ───
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

-- ─── decline_joint_venture_invite: explicit decline resolves immediately —
-- cancels the whole proposal and refunds everyone who already paid. ───
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

-- ─── resolve_expired_joint_venture_proposals: lazy 24h expiry, called from
-- the client on Home/Notifications page load — there's no cron/edge function
-- anywhere in this app, so expiry is always settled lazily on next page load,
-- same as resolve_expired_marketplace_listings. Scoped to proposals where
-- p_user_id is ANY participant (not just the creator), since any of the N
-- people might open the app first. ───
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

-- ─── get_joint_venture_invites: pending invites for the current user's
-- notifications, and the proposer's own view of proposals awaiting others.
-- (The notification card itself reads everything it needs straight off
-- social_pokes.metadata — this RPC exists for a "my pending proposals" list
-- if the client wants one; not required by the notification flow itself.) ───
CREATE OR REPLACE FUNCTION get_my_joint_venture_participation(p_user_id UUID) RETURNS TABLE (
    proposal_id UUID,
    business_name TEXT,
    business_icon TEXT,
    status TEXT,
    share_amount NUMERIC,
    proposal_status TEXT,
    expires_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    RETURN QUERY
    SELECT jvp.id, jvp.business_name, jvp.business_icon, p.status, p.share_amount, jvp.status, jvp.expires_at
    FROM joint_venture_participants p
    JOIN joint_venture_proposals jvp ON jvp.id = p.proposal_id
    WHERE p.user_id = p_user_id
    ORDER BY jvp.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_my_joint_venture_participation(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
