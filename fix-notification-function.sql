-- Fix the get_user_social_notifications function
-- Run this in Supabase SQL Editor
DROP FUNCTION IF EXISTS get_user_social_notifications(UUID);
CREATE OR REPLACE FUNCTION get_user_social_notifications(user_uuid UUID) RETURNS TABLE (
        poke_id UUID,
        from_user_name TEXT,
        from_user_avatar TEXT,
        message TEXT,
        poke_type TEXT,
        is_read BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        business_name TEXT
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT sp.id,
    COALESCE(up.name, 'Unknown User') as from_user_name,
    '' as from_user_avatar,
    -- Empty string since avatar_url doesn't exist
    sp.message,
    sp.type::TEXT,
    sp.is_read,
    sp.created_at,
    (sp.metadata->>'business_name')::TEXT
FROM social_pokes sp
    INNER JOIN user_profiles up ON sp.from_user_id = up.id
WHERE sp.to_user_id = user_uuid
ORDER BY sp.created_at DESC
LIMIT 50;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_social_notifications(UUID) TO authenticated;
-- Test the fixed function
SELECT *
FROM get_user_social_notifications('9cb41595-e976-4a30-bfd1-94f5b25710ab');