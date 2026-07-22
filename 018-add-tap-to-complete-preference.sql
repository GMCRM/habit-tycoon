-- Add tap_to_complete preference to user_profiles table
-- Lets the "tap to complete" habit-toggle setting sync across a user's devices
-- instead of living only in that device's localStorage.

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS tap_to_complete BOOLEAN DEFAULT false;
