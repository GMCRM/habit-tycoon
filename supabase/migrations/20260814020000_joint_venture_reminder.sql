-- Joint Venture — per-participant "remind" nudge from the participants modal.
--
-- Mirrors send_habit_poke/send_stockholder_reminder (same social_pokes
-- insert shape) but scoped to an actual joint venture: both the sender and
-- recipient must be co-owners of the given habit_business_id, so this can't
-- be used to poke an arbitrary user. metadata carries habit_business_id so
-- get_user_social_notifications' existing business_name resolution (see
-- 20260807100000_joint_venture_notifications.sql) picks up renames for free.

DROP FUNCTION IF EXISTS send_joint_venture_reminder(UUID, UUID, UUID);
CREATE OR REPLACE FUNCTION send_joint_venture_reminder(
        p_from_user_id UUID,
        p_to_user_id UUID,
        p_habit_business_id UUID
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    from_user_name TEXT;
    v_business_name TEXT;
BEGIN
    IF p_from_user_id = p_to_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot send a reminder to yourself');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM business_co_owners
        WHERE habit_business_id = p_habit_business_id AND user_id = p_from_user_id
    ) OR NOT EXISTS (
        SELECT 1 FROM business_co_owners
        WHERE habit_business_id = p_habit_business_id AND user_id = p_to_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Both users must be co-owners of this joint venture');
    END IF;

    SELECT name INTO from_user_name FROM user_profiles WHERE id = p_from_user_id;
    IF from_user_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
    END IF;

    SELECT business_name INTO v_business_name FROM habit_businesses WHERE id = p_habit_business_id;

    INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
    VALUES (
        p_from_user_id,
        p_to_user_id,
        from_user_name || ' nudged you to check in on "' || COALESCE(v_business_name, 'your joint venture') || '" today! 🤝',
        'joint_venture_reminder',
        false,
        jsonb_build_object('business_name', v_business_name, 'habit_business_id', p_habit_business_id)
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION send_joint_venture_reminder(UUID, UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
