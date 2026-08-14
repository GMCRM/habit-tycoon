-- Fix: joint venture invite notification showed the dollar share without
-- thousands separators (e.g. "$500000.00" instead of "$500,000.00").

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
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || to_char(v_creator_share, 'FM999,999,999,990.00') || ')');
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
            v_creator_name || ' invited you to co-found this business — $' || to_char(v_share_others, 'FM999,999,999,990.00') || ' to join.',
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
