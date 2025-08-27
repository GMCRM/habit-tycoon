-- Function to search for users for friend requests
-- This bypasses RLS while maintaining security by only returning basic info needed for friend requests
-- Drop function if it exists
DROP FUNCTION IF EXISTS search_users_for_friend_request(TEXT);
-- Create function that can search users for friend requests
CREATE OR REPLACE FUNCTION search_users_for_friend_request(search_term TEXT) RETURNS TABLE (id UUID, name TEXT, email TEXT) LANGUAGE plpgsql SECURITY DEFINER -- This allows the function to bypass RLS
    AS $$ BEGIN -- Only return basic profile info needed for friend requests
    -- Don't return sensitive data like cash, net_worth, etc.
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email
FROM user_profiles up
WHERE up.email = search_term
    OR up.name ILIKE '%' || search_term || '%'
LIMIT 10;
-- Limit results to prevent abuse
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_users_for_friend_request(TEXT) TO authenticated;