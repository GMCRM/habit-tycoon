-- Debug function to check what's actually in the user_profiles table
-- This will help us understand if the profiles exist
DROP FUNCTION IF EXISTS debug_user_profiles();
CREATE OR REPLACE FUNCTION debug_user_profiles() RETURNS TABLE (
        id UUID,
        name TEXT,
        email TEXT,
        created_at TIMESTAMPTZ
    ) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN -- Return all user profiles to see what's actually in the database
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email,
    up.created_at
FROM public.user_profiles up
ORDER BY up.created_at DESC
LIMIT 10;
END;
$$;
-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION debug_user_profiles() TO anon;