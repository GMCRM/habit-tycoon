-- Add stockholder reminder functionality to the existing stocks system
-- Run this in your Supabase SQL Editor
-- Function to send a stockholder reminder
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT, TEXT);
CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Create stockholder reminder record
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
        from_user_name || ' sent you a friendly reminder to do "' || business_name || '" because they own stocks in your business! 📈💰',
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
-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;