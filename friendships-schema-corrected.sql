-- CORRECTED Friendships Table Schema
-- This fixes the foreign key relationships to work with user_profiles
-- Run this in your Supabase SQL Editor
-- First, drop the existing table if it exists (this will clear any test data)
DROP TABLE IF EXISTS friendships CASCADE;
-- Create friendships table with correct foreign keys
CREATE TABLE friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Ensure no duplicate friendships and no self-friendship
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);
-- Enable Row Level Security
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
-- Create RLS policies
CREATE POLICY "Users can view own friendships" ON friendships FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = friend_id
    );
CREATE POLICY "Users can insert own friendships" ON friendships FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON friendships FOR
UPDATE USING (auth.uid() = friend_id);
CREATE POLICY "Users can delete own friendships" ON friendships FOR DELETE USING (
    auth.uid() = user_id
    OR auth.uid() = friend_id
);
-- Create updated_at trigger (assumes handle_updated_at function exists)
CREATE OR REPLACE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = TIMEZONE('utc'::text, NOW());
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER handle_friendships_updated_at BEFORE
UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
-- Create function to get mutual friendships
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