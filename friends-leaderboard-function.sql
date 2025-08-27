-- Function to get friends with financial data for leaderboard
-- This function bypasses RLS to allow leaderboard functionality
DROP FUNCTION IF EXISTS get_friends_for_leaderboard(UUID);
CREATE OR REPLACE FUNCTION get_friends_for_leaderboard(user_uuid UUID) RETURNS TABLE (
        id UUID,
        name TEXT,
        email TEXT,
        cash NUMERIC,
        net_worth NUMERIC,
        avatar_url TEXT
    ) LANGUAGE plpgsql SECURITY DEFINER -- This allows the function to bypass RLS
    AS $$ BEGIN -- Get friends' financial data for leaderboard
    RETURN QUERY
SELECT up.id,
    up.name,
    up.email,
    up.cash,
    up.net_worth,
    up.avatar_url
FROM user_profiles up
WHERE up.id IN (
        -- Friends where user is the requester
        SELECT f.friend_id
        FROM friendships f
        WHERE f.user_id = user_uuid
            AND f.status = 'accepted'
        UNION
        -- Friends where user is the recipient
        SELECT f.user_id
        FROM friendships f
        WHERE f.friend_id = user_uuid
            AND f.status = 'accepted'
    );
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_friends_for_leaderboard(UUID) TO authenticated;