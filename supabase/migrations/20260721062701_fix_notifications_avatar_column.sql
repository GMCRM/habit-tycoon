-- Fix: Notifications tab is completely empty for everyone
--
-- ROOT CAUSE: get_user_social_notifications selects up.avatar_url, but
-- user_profiles has no avatar_url column (confirmed: it was already removed
-- once in fixed-profile-function.sql / fix-notification-function.sql).
-- Every call to this RPC throws "column up.avatar_url does not exist".
-- The client (social.service.ts getUserPokes) silently swallows any RPC
-- error and returns [], so the UI just shows an empty notifications list
-- with no visible error — this has been broken for every user, for every
-- notification type (not just stockholder reminders), likely since
-- stocks-system-functions.sql was last redeployed wholesale and clobbered
-- the earlier avatar_url fix.
--
-- FIX: stop selecting the nonexistent column.
--
-- Run this in Supabase SQL Editor (after 012 and 013).

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
    up.name,
    '' as from_user_avatar,
    sp.message,
    sp.type::TEXT,
    sp.is_read,
    sp.created_at,
    -- If the poke references a private habit_business_id, prefer the public business type name
    CASE
        WHEN sp.metadata ? 'habit_business_id' THEN (
            SELECT bt.name
            FROM habit_businesses hb2
                LEFT JOIN business_types bt ON bt.id = hb2.business_type_id
            WHERE hb2.id = (sp.metadata->>'habit_business_id')::UUID
            LIMIT 1
        )
        ELSE (sp.metadata->>'business_name')::TEXT
    END AS business_name
FROM social_pokes sp
    INNER JOIN user_profiles up ON sp.from_user_id = up.id
WHERE sp.to_user_id = user_uuid
ORDER BY sp.created_at DESC
LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_social_notifications(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
