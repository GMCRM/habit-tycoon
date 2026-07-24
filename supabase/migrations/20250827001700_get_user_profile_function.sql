-- Function to get user profile info for friend requests
-- This bypasses RLS to allow users to see basic info of people who sent them friend requests
DROP FUNCTION IF EXISTS get_user_profile_for_friend_request(UUID);
CREATE OR REPLACE FUNCTION get_user_profile_for_friend_request(user_uuid UUID) RETURNS TABLE (
        id UUID,
        name TEXT,
        email TEXT,
        avatar_url TEXT
    ) LANGUAGE plpgsql SECURITY DEFINER -- This allows the function to bypass RLS
    AS $$ BEGIN -- Only return basic profile info needed for friend requests
    -- Don't return sensitive data like cash, net_worth, etc.
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email,
    up.avatar_url
FROM user_profiles up
WHERE up.id = user_uuid;
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO authenticated;