-- Persists the sound-effects on/off toggle (Settings page) on the user's
-- profile row so it's shared across devices, instead of living only in
-- local Capacitor Preferences on whichever device it was last changed on.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS sound_effects_enabled BOOLEAN NOT NULL DEFAULT true;
