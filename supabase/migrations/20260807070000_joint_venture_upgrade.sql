-- Joint Venture — upgrade proposal, group payment collection, apply.
--
-- Any co-owner can propose an upgrade; they pay their own share immediately
-- (mirroring the creation flow), the other co-owners get a payment-request
-- notification, and the upgrade only actually applies once every co-owner
-- has paid — 24h window, cancel-and-refund if it doesn't complete in time,
-- explicit Decline resolves immediately. Once applied, the old tier is
-- listed on the Marketplace exactly like the single-owner upgrade flow
-- already does (see joint_venture_marketplace_integration.sql for the
-- co-owner buyback exclusion + split-proceeds changes to that side).

CREATE TABLE IF NOT EXISTS joint_venture_upgrade_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    new_business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    total_upgrade_cost NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- At most one pending upgrade proposal per business at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_jv_upgrade_proposals_one_pending_per_business
    ON joint_venture_upgrade_proposals(habit_business_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS joint_venture_upgrade_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    upgrade_proposal_id UUID NOT NULL REFERENCES joint_venture_upgrade_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_initiator BOOLEAN NOT NULL DEFAULT false,
    share_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
    paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (upgrade_proposal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_jv_upgrade_participants_proposal_id ON joint_venture_upgrade_participants(upgrade_proposal_id);
CREATE INDEX IF NOT EXISTS idx_jv_upgrade_participants_user_id ON joint_venture_upgrade_participants(user_id);

ALTER TABLE joint_venture_upgrade_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_venture_upgrade_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their own upgrade proposals" ON joint_venture_upgrade_proposals;
CREATE POLICY "Participants can view their own upgrade proposals" ON joint_venture_upgrade_proposals FOR
SELECT USING (
    EXISTS (
        SELECT 1 FROM joint_venture_upgrade_participants p
        WHERE p.upgrade_proposal_id = joint_venture_upgrade_proposals.id AND p.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Participants can view their own upgrade participant rows" ON joint_venture_upgrade_participants;
CREATE POLICY "Participants can view their own upgrade participant rows" ON joint_venture_upgrade_participants FOR
SELECT USING (auth.uid() = user_id);

-- ─── propose_joint_venture_upgrade: any co-owner initiates, pays their share
-- immediately, others get a payment-request notification. ───
CREATE OR REPLACE FUNCTION propose_joint_venture_upgrade(
    p_initiator_id UUID,
    p_habit_business_id UUID,
    p_new_business_type_id INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_habit habit_businesses%ROWTYPE;
    v_new_type business_types%ROWTYPE;
    v_n INTEGER;
    v_share_others NUMERIC(10, 2);
    v_initiator_share NUMERIC(10, 2);
    v_initiator_cash NUMERIC;
    v_initiator_name TEXT;
    v_proposal_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_co_owner RECORD;
BEGIN
    IF p_initiator_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_habit FROM habit_businesses WHERE id = p_habit_business_id;
    IF NOT FOUND OR NOT v_habit.is_joint_venture OR NOT v_habit.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Joint venture business not found');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = p_initiator_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not a co-owner of this business');
    END IF;
    IF EXISTS (SELECT 1 FROM joint_venture_upgrade_proposals WHERE habit_business_id = p_habit_business_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'An upgrade is already pending for this business');
    END IF;
    -- Fail fast if the 24h upgrade cooldown (guard_habit_business_mutation)
    -- would reject this anyway — no point collecting money for it.
    IF NOW() - COALESCE(v_habit.last_upgraded_at, v_habit.created_at) < INTERVAL '24 hours' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This business can only be upgraded once every 24 hours');
    END IF;

    SELECT * INTO v_new_type FROM business_types WHERE id = p_new_business_type_id;
    IF NOT FOUND OR v_new_type.base_cost <= v_habit.cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid upgrade tier');
    END IF;

    SELECT COUNT(*) INTO v_n FROM business_co_owners WHERE habit_business_id = p_habit_business_id;

    v_share_others := ROUND(v_new_type.base_cost / v_n, 2);
    v_initiator_share := v_new_type.base_cost - v_share_others * (v_n - 1);

    SELECT cash, COALESCE(name, 'A friend') INTO v_initiator_cash, v_initiator_name FROM user_profiles WHERE id = p_initiator_id;
    IF v_initiator_cash < v_initiator_share THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_initiator_share || ')');
    END IF;

    INSERT INTO joint_venture_upgrade_proposals (habit_business_id, initiator_id, new_business_type_id, total_upgrade_cost)
    VALUES (p_habit_business_id, p_initiator_id, p_new_business_type_id, v_new_type.base_cost)
    RETURNING id, expires_at INTO v_proposal_id, v_expires_at;

    INSERT INTO joint_venture_upgrade_participants (upgrade_proposal_id, user_id, is_initiator, share_amount, status, paid, paid_at, responded_at)
    VALUES (v_proposal_id, p_initiator_id, true, v_initiator_share, 'accepted', true, NOW(), NOW());
    PERFORM adjust_user_cash(p_initiator_id, -v_initiator_share);

    FOR v_co_owner IN SELECT user_id FROM business_co_owners WHERE habit_business_id = p_habit_business_id AND user_id <> p_initiator_id LOOP
        INSERT INTO joint_venture_upgrade_participants (upgrade_proposal_id, user_id, is_initiator, share_amount, status, paid)
        VALUES (v_proposal_id, v_co_owner.user_id, false, v_share_others, 'invited', false);

        INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
        VALUES (
            p_initiator_id, v_co_owner.user_id,
            v_initiator_name || ' wants to upgrade "' || v_habit.business_name || '" to ' || v_new_type.name || ' — $' || v_share_others || ' to chip in.',
            'joint_venture_upgrade_request', false,
            jsonb_build_object(
                'upgrade_proposal_id', v_proposal_id,
                'habit_business_id', p_habit_business_id,
                'business_name', v_habit.business_name,
                'business_icon', v_habit.business_icon,
                'new_business_type_name', v_new_type.name,
                'new_business_icon', v_new_type.icon,
                'share_amount', v_share_others,
                'total_cost', v_new_type.base_cost,
                'initiator_name', v_initiator_name,
                'expires_at', v_expires_at
            )
        );
    END LOOP;

    RETURN jsonb_build_object('success', true, 'upgrade_proposal_id', v_proposal_id, 'initiator_share', v_initiator_share, 'share_amount', v_share_others, 'expires_at', v_expires_at);
END;
$$;
GRANT EXECUTE ON FUNCTION propose_joint_venture_upgrade(UUID, UUID, INTEGER) TO authenticated;

-- ─── pay_joint_venture_upgrade_share: the payment that completes the set
-- applies the upgrade — snapshots the old tier to the Marketplace (see
-- joint_venture_marketplace_integration.sql for the relaxed any-co-owner
-- caller check that makes this callable here), then mutates the business in
-- place exactly like the single-owner upgradeHabitBusiness() flow does. ───
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

-- ─── decline_joint_venture_upgrade: explicit decline resolves immediately. ───
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

-- ─── resolve_expired_joint_venture_upgrades: lazy 24h expiry, same shape as
-- resolve_expired_joint_venture_proposals. ───
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

NOTIFY pgrst, 'reload schema';
