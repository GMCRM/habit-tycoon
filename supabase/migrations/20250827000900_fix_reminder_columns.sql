-- Fix the send_stockholder_reminder function to use correct column names
-- Run this in Supabase SQL Editor
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_uuid UUID,
        business_owner_uuid UUID,
        business_name_param TEXT
    ) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Insert the reminder into social_pokes with correct column names
INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        -- Changed from target_user_id
        type,
        -- Changed from poke_type
        message,
        metadata,
        is_read,
        created_at
    )
VALUES (
        from_user_uuid,
        business_owner_uuid,
        'stockholder_reminder',
        'A stockholder reminded you to complete your habit!',
        jsonb_build_object('business_name', business_name_param),
        false,
        NOW()
    );
RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT) TO authenticated;