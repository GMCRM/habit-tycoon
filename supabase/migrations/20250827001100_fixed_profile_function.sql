-- Fixed function that only uses columns that actually exist
-- Remove avatar_url since it doesn't exist in the user_profiles table
DROP FUNCTION IF EXISTS get_user_profile_for_friend_request(UUID);
CREATE OR REPLACE FUNCTION get_user_profile_for_friend_request(user_uuid UUID) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE result JSON;
BEGIN -- Only select columns that actually exist
SELECT to_json(t) INTO result
FROM (
        SELECT id,
            name,
            email
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
    'no-profile@found.com'
);
END IF;
RETURN result;
END;
$$;
-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile_for_friend_request(UUID) TO anon;