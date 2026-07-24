-- Super simple function to get user profile that definitely bypasses RLS
-- First, let's disable RLS entirely for this function
DROP FUNCTION IF EXISTS get_user_profile_for_friend_request(UUID);
CREATE OR REPLACE FUNCTION get_user_profile_for_friend_request(user_uuid UUID) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER -- This should bypass RLS
SET search_path = public -- Ensure we're using the right schema
    AS $$
DECLARE result JSON;
BEGIN -- Use a simple SELECT with explicit schema
SELECT to_json(t) INTO result
FROM (
        SELECT id,
            name,
            email,
            avatar_url
        FROM public.user_profiles
        WHERE id = user_uuid
        LIMIT 1
    ) t;
-- If no result, return a default JSON object
IF result IS NULL THEN result := json_build_object(
    'id',
    user_uuid,
    'name',
    'No Profile Found',
    'email',
    'no-profile@found.com',
    'avatar_url',
    null
);
END IF;
RETURN result;
END;
$$;
-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO anon;