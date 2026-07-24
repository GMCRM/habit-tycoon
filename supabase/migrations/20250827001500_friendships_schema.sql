-- Friendships Table for Friend Request System
-- Run this in your Supabase SQL Editor
-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure no duplicate friendships and no self-friendship
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);
-- Enable Row Level Security
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can insert own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
-- Friendship policies
-- Users can view friendships where they are either the requester or recipient
CREATE POLICY "Users can view own friendships" ON friendships FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = friend_id
    );
-- Users can only send friend requests (insert where they are the user_id)
CREATE POLICY "Users can insert own friendships" ON friendships FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only update friendships where they are the recipient (friend_id) 
-- This allows accepting/declining requests
CREATE POLICY "Users can update own friendships" ON friendships FOR
UPDATE USING (auth.uid() = friend_id);
-- Users can delete friendships where they are involved
CREATE POLICY "Users can delete own friendships" ON friendships FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = friend_id
);
-- Add updated_at trigger (drop first if exists)
DROP TRIGGER IF EXISTS handle_friendships_updated_at ON friendships;
CREATE TRIGGER handle_friendships_updated_at BEFORE
UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
-- Create function to get mutual friendships (accepted both ways)
CREATE OR REPLACE FUNCTION get_mutual_friends(user_uuid UUID) RETURNS TABLE (
        friend_id UUID,
        friend_name TEXT,
        friend_email TEXT,
        friend_avatar_url TEXT,
        friend_cash DECIMAL(15, 2),
        friend_net_worth DECIMAL(15, 2),
        friendship_created_at TIMESTAMP WITH TIME ZONE
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT up.id as friend_id,
    up.name as friend_name,
    up.email as friend_email,
    up.avatar_url as friend_avatar_url,
    up.cash as friend_cash,
    up.net_worth as friend_net_worth,
    f.created_at as friendship_created_at
FROM friendships f
    JOIN user_profiles up ON up.id = f.friend_id
WHERE f.user_id = user_uuid
    AND f.status = 'accepted'
    AND EXISTS (
        SELECT 1
        FROM friendships f2
        WHERE f2.user_id = f.friend_id
            AND f2.friend_id = f.user_id
            AND f2.status = 'accepted'
    )
ORDER BY f.created_at DESC;
END;
$$;