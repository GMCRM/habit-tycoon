-- Reword the stockholder reminder message per direct feedback, from:
--   "{name} sent you a friendly reminder to do "{business}" because they
--    own stocks in your business."
-- to:
--   "{name} has sent you a reminder to complete your {business} Habit!"
--
-- Re-declares send_stockholder_reminder (current version:
-- 20260825030000_remove_emoji_from_notification_messages.sql) with only the
-- message-building line changed — signature, metadata, and return shape are
-- unchanged.

CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
    VALUES (
        from_user_id,
        to_user_id,
        from_user_name || ' has sent you a reminder to complete your ' || business_name || ' Habit!',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name',
            business_name,
            'investor_name',
            from_user_name
        )
    );
    RETURN jsonb_build_object(
        'success',
        true,
        'message',
        'Stockholder reminder sent successfully'
    );
END;
$$;
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
