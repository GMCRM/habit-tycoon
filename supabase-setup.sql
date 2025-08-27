-- Habit Tycoon User Profiles Table
-- Run this in your Supabase SQL Editor
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    cash DECIMAL(15, 2) DEFAULT 100.00,
    net_worth DECIMAL(15, 2) DEFAULT 100.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create business_types table (predefined business types)
CREATE TABLE IF NOT EXISTS business_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    base_cost DECIMAL(10, 2) NOT NULL,
    base_pay DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create habit_businesses table (combined habit + business in one)
CREATE TABLE IF NOT EXISTS habit_businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    business_type_id INTEGER REFERENCES business_types(id) NOT NULL,
    -- Business info
    business_name TEXT NOT NULL,
    -- e.g., "Morning Jog Coffee Shop"
    business_icon TEXT NOT NULL,
    -- inherited from business_type
    cost DECIMAL(10, 2) NOT NULL,
    -- how much user paid to create this
    -- Habit info  
    habit_description TEXT NOT NULL,
    -- e.g., "Take a one mile walk each day"
    frequency TEXT CHECK (frequency IN ('daily', 'weekly')) NOT NULL DEFAULT 'daily',
    goal_value INTEGER NOT NULL DEFAULT 1,
    -- e.g., 5 push-ups, 2 miles, etc.
    current_progress INTEGER DEFAULT 0,
    -- progress toward current goal
    earnings_per_completion DECIMAL(10, 2) NOT NULL,
    -- how much earned per habit completion
    -- Progress tracking
    streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    total_earnings DECIMAL(15, 2) DEFAULT 0.00,
    last_completed_at TIMESTAMP WITH TIME ZONE,
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Create habit_completions table (track individual habit completions)
CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID REFERENCES habit_businesses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    earnings DECIMAL(10, 2) NOT NULL,
    streak_count INTEGER NOT NULL,
    -- what streak count was this completion
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
-- Enable Row Level Security (RLS) for all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR
INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR
UPDATE USING (auth.uid() = id);
-- Business types policies (readable by all authenticated users)
DROP POLICY IF EXISTS "Anyone can view business types" ON business_types;
CREATE POLICY "Anyone can view business types" ON business_types FOR
SELECT USING (auth.role() = 'authenticated');
-- Habit-businesses policies
DROP POLICY IF EXISTS "Users can view own habit businesses" ON habit_businesses;
DROP POLICY IF EXISTS "Users can insert own habit businesses" ON habit_businesses;
DROP POLICY IF EXISTS "Users can update own habit businesses" ON habit_businesses;
DROP POLICY IF EXISTS "Users can delete own habit businesses" ON habit_businesses;
CREATE POLICY "Users can view own habit businesses" ON habit_businesses FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit businesses" ON habit_businesses FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit businesses" ON habit_businesses FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit businesses" ON habit_businesses FOR DELETE USING (auth.uid() = user_id);
-- Habit completions policies
DROP POLICY IF EXISTS "Users can view own completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON habit_completions;
CREATE POLICY "Users can view own completions" ON habit_completions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON habit_completions FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS handle_habit_businesses_updated_at ON habit_businesses;
CREATE TRIGGER handle_user_profiles_updated_at BEFORE
UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_habit_businesses_updated_at BEFORE
UPDATE ON habit_businesses FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
-- Insert default business types
INSERT INTO business_types (name, icon, base_cost, base_pay, description)
VALUES (
        'Coffee Shop',
        '☕',
        50.00,
        5.00,
        'Start your day with a warm cup and steady income'
    ),
    (
        'Gym',
        '💪',
        75.00,
        8.00,
        'Strength training builds both muscle and money'
    ),
    (
        'Bookstore',
        '📚',
        60.00,
        6.00,
        'Knowledge pays dividends in this cozy shop'
    ),
    (
        'Restaurant',
        '🍽️',
        100.00,
        12.00,
        'Serve delicious meals and earn great profits'
    ),
    (
        'Tech Startup',
        '💻',
        150.00,
        20.00,
        'Innovation and coding skills drive high returns'
    ),
    (
        'Bakery',
        '🥖',
        70.00,
        7.00,
        'Rise early and bake your way to success'
    ),
    (
        'Garden Center',
        '🌱',
        80.00,
        9.00,
        'Growing plants grows your bank account'
    ),
    (
        'Art Studio',
        '🎨',
        90.00,
        10.00,
        'Create beautiful art and beautiful profits'
    ),
    (
        'Cleaning Service',
        '🧹',
        40.00,
        4.00,
        'Clean habits lead to clean money'
    ),
    (
        'Fitness Center',
        '🏋️',
        120.00,
        15.00,
        'Personal training builds personal wealth'
    ) ON CONFLICT (name) DO NOTHING;
-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN RAISE LOG 'handle_new_user triggered for user: %',
    NEW.id;
RAISE LOG 'User email: %',
NEW.email;
RAISE LOG 'User metadata: %',
NEW.raw_user_meta_data;
-- Temporarily disable RLS for this operation
PERFORM set_config('row_security', 'off', true);
-- Use UPSERT (INSERT ... ON CONFLICT) to handle potential duplicates
INSERT INTO user_profiles (id, email, name)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    ) ON CONFLICT (email) DO
UPDATE
SET id = NEW.id,
    name = COALESCE(
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    ),
    updated_at = NOW();
-- Re-enable RLS
PERFORM set_config('row_security', 'on', true);
RAISE LOG 'Profile created/updated for user: %',
NEW.id;
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN RAISE LOG 'Error in handle_new_user: %',
SQLERRM;
RAISE LOG 'Error details: %',
SQLSTATE;
-- Re-enable RLS even on error
PERFORM set_config('row_security', 'on', true);
-- Don't fail the auth signup if profile creation fails
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Drop existing trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Function to completely delete a user account (profile + auth user)
-- This requires SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION delete_user_completely() RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE user_id uuid;
result json;
BEGIN -- Get the current user ID
user_id := auth.uid();
IF user_id IS NULL THEN RETURN json_build_object(
    'success',
    false,
    'message',
    'No authenticated user'
);
END IF;
-- Delete from user_profiles first (due to foreign key)
DELETE FROM user_profiles
WHERE id = user_id;
-- Delete from auth.users (this requires SECURITY DEFINER)
DELETE FROM auth.users
WHERE id = user_id;
RETURN json_build_object(
    'success',
    true,
    'message',
    'User deleted successfully',
    'user_id',
    user_id
);
EXCEPTION
WHEN OTHERS THEN RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;