-- Fix the send_stockholder_reminder function to use sender's name in message
-- Run this in Supabase SQL Editor
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_uuid UUID,
        business_owner_uuid UUID,
        business_name_param TEXT
    ) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE sender_name TEXT;
habit_name TEXT;
BEGIN -- Get the sender's name from user_profiles
SELECT COALESCE(name, 'Unknown User') INTO sender_name
FROM user_profiles
WHERE id = from_user_uuid;
-- Get the actual habit name from habit_businesses table
-- We need to find the habit business that corresponds to this business type
SELECT COALESCE(hb.business_name, 'your habit') INTO habit_name
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE bt.name = business_name_param
    AND hb.user_id = business_owner_uuid
LIMIT 1;
-- Insert the reminder into social_pokes with personalized message
INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        type,
        message,
        metadata,
        is_read,
        created_at
    )
VALUES (
        from_user_uuid,
        business_owner_uuid,
        'stockholder_reminder',
        sender_name || ' sent you a friendly reminder to complete your "' || habit_name || '" habit because they own shares in your "' || business_name_param || '"! 📈💰',
        jsonb_build_object(
            'business_name',
            business_name_param,
            'habit_name',
            habit_name
        ),
        false,
        NOW()
    );
RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT) TO authenticated;