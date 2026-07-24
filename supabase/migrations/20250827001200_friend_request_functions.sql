-- Combined functions for friend request system
-- These functions bypass RLS to allow friend request functionality
-- Function to search for users for friend requests
DROP FUNCTION IF EXISTS search_users_for_friend_request(TEXT);
CREATE OR REPLACE FUNCTION search_users_for_friend_request(search_term TEXT) RETURNS TABLE (id UUID, name TEXT, email TEXT) LANGUAGE plpgsql SECURITY DEFINER -- This allows the function to bypass RLS
    AS $$ BEGIN -- Only return basic profile info needed for friend requests
    -- Don't return sensitive data like cash, net_worth, etc.
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email
FROM user_profiles up
WHERE LOWER(up.email) = LOWER(search_term)
    OR up.name ILIKE '%' || search_term || '%'
LIMIT 10;
-- Limit results to prevent abuse
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_users_for_friend_request(TEXT) TO authenticated;
-- Function to get user profile info for friend requests
DROP FUNCTION IF EXISTS get_user_profile_for_friend_request(UUID);
CREATE OR REPLACE FUNCTION get_user_profile_for_friend_request(user_uuid UUID) RETURNS TABLE (
        id UUID,
        name TEXT,
        email TEXT,
        cash NUMERIC,
        net_worth NUMERIC
    ) LANGUAGE plpgsql SECURITY DEFINER -- This allows the function to bypass RLS
    AS $$ BEGIN -- Return profile info including game currency for friends
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email,
    up.cash,
    up.net_worth
FROM user_profiles up
WHERE up.id = user_uuid;
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO authenticated;