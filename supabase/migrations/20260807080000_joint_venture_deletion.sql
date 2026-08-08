-- Joint Venture — deletion vote.
--
-- Any co-owner can start a deletion vote; their own click auto-counts as a
-- "yes" ballot (confirmed), the remaining co-owners get a vote-request
-- notification. Once affirmative votes exceed 50% of the co-owner count
-- (required_yes = FLOOR(N/2) + 1 — note a 2-person venture can never be
-- unilaterally deleted by the initiator alone, since 1/2 isn't >50%; that
-- falls out of the formula with no special-casing), the business is listed
-- on the Marketplace and soft-deleted exactly like the single-owner delete
-- flow. A single explicit "no" ballot cancels the vote immediately. The vote
-- itself also expires after 24h if it never resolves either way — no money
-- is ever collected for a vote, so expiry needs no refund step.

CREATE TABLE IF NOT EXISTS joint_venture_deletion_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jv_deletion_votes_one_pending_per_business
    ON joint_venture_deletion_votes(habit_business_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS joint_venture_deletion_ballots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vote_id UUID NOT NULL REFERENCES joint_venture_deletion_votes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ballot TEXT NOT NULL CHECK (ballot IN ('yes', 'no')),
    cast_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (vote_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_jv_deletion_ballots_vote_id ON joint_venture_deletion_ballots(vote_id);

ALTER TABLE joint_venture_deletion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_venture_deletion_ballots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Co-owners can view deletion votes for their businesses" ON joint_venture_deletion_votes;
CREATE POLICY "Co-owners can view deletion votes for their businesses" ON joint_venture_deletion_votes FOR
SELECT USING (
    EXISTS (
        SELECT 1 FROM business_co_owners bco
        WHERE bco.habit_business_id = joint_venture_deletion_votes.habit_business_id AND bco.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Co-owners can view ballots for their businesses" ON joint_venture_deletion_ballots;
CREATE POLICY "Co-owners can view ballots for their businesses" ON joint_venture_deletion_ballots FOR
SELECT USING (
    EXISTS (
        SELECT 1 FROM joint_venture_deletion_votes v
        JOIN business_co_owners bco ON bco.habit_business_id = v.habit_business_id
        WHERE v.id = joint_venture_deletion_ballots.vote_id AND bco.user_id = auth.uid()
    )
);

-- ─── initiate_joint_venture_deletion: initiator's click auto-counts as their
-- own "yes" ballot; every other co-owner gets a vote-request notification. ───
CREATE OR REPLACE FUNCTION initiate_joint_venture_deletion(
    p_user_id UUID,
    p_habit_business_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_habit habit_businesses%ROWTYPE;
    v_initiator_name TEXT;
    v_vote_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_n INTEGER;
    v_required_yes INTEGER;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_habit FROM habit_businesses WHERE id = p_habit_business_id;
    IF NOT FOUND OR NOT v_habit.is_joint_venture OR NOT v_habit.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'Joint venture business not found');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You are not a co-owner of this business');
    END IF;
    IF EXISTS (SELECT 1 FROM joint_venture_deletion_votes WHERE habit_business_id = p_habit_business_id AND status = 'pending') THEN
        RETURN jsonb_build_object('success', false, 'error', 'A deletion vote is already pending for this business');
    END IF;

    SELECT COUNT(*) INTO v_n FROM business_co_owners WHERE habit_business_id = p_habit_business_id;
    v_required_yes := (v_n / 2) + 1;

    INSERT INTO joint_venture_deletion_votes (habit_business_id, initiator_id)
    VALUES (p_habit_business_id, p_user_id)
    RETURNING id, expires_at INTO v_vote_id, v_expires_at;

    INSERT INTO joint_venture_deletion_ballots (vote_id, user_id, ballot) VALUES (v_vote_id, p_user_id, 'yes');

    SELECT COALESCE(name, 'A friend') INTO v_initiator_name FROM user_profiles WHERE id = p_user_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, bco.user_id,
        v_initiator_name || ' wants to delete "' || v_habit.business_name || '" — more than half of you must agree within 24h.',
        'joint_venture_deletion_vote', false,
        jsonb_build_object(
            'vote_id', v_vote_id,
            'habit_business_id', p_habit_business_id,
            'business_name', v_habit.business_name,
            'business_icon', v_habit.business_icon,
            'initiator_name', v_initiator_name,
            'co_owner_count', v_n,
            'required_yes', v_required_yes,
            'expires_at', v_expires_at
        )
    FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id <> p_user_id;

    -- Corner case: if v_required_yes is already met by the initiator's own
    -- vote alone (mathematically impossible for N >= 2, since 1 is never
    -- > N/2 when N >= 2 — kept only as an explicit, defensive branch rather
    -- than assuming N >= 2 always holds).
    IF 1 >= v_required_yes THEN
        PERFORM execute_joint_venture_deletion(v_vote_id);
        RETURN jsonb_build_object('success', true, 'vote_id', v_vote_id, 'executed', true);
    END IF;

    RETURN jsonb_build_object('success', true, 'vote_id', v_vote_id, 'executed', false, 'required_yes', v_required_yes, 'yes_count', 1, 'total_co_owners', v_n, 'expires_at', v_expires_at);
END;
$$;
GRANT EXECUTE ON FUNCTION initiate_joint_venture_deletion(UUID, UUID) TO authenticated;

-- ─── execute_joint_venture_deletion: shared by cast_joint_venture_deletion_ballot
-- and (defensively) initiate_joint_venture_deletion — lists on the
-- Marketplace then soft-deletes, exactly like the single-owner delete flow.
-- Not exposed to the client directly (no GRANT to authenticated). ───
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

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        v_vote.initiator_id, bco.user_id,
        '🗑️ "' || v_habit.business_name || '" was deleted — it''s on the Marketplace, and proceeds will split evenly among all of you.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'deleted', 'habit_business_id', v_habit.id, 'business_name', v_habit.business_name, 'business_icon', v_habit.business_icon)
    FROM business_co_owners bco WHERE bco.habit_business_id = v_habit.id;
END;
$$;

-- ─── cast_joint_venture_deletion_ballot: a "no" resolves immediately; a
-- "yes" that crosses the >50% threshold executes the deletion. ───
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

    IF p_ballot = 'no' THEN
        UPDATE joint_venture_deletion_votes SET status = 'cancelled', updated_at = NOW() WHERE id = p_vote_id;

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

-- ─── resolve_expired_joint_venture_deletion_votes: lazy 24h expiry — no
-- refund step, since a deletion vote never collects money. ───
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
