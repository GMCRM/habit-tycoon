-- Migration to add missing goal_value and current_progress columns
-- Run this in your Supabase SQL Editor
-- Add goal_value column if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'habit_businesses'
        AND column_name = 'goal_value'
) THEN
ALTER TABLE habit_businesses
ADD COLUMN goal_value INTEGER NOT NULL DEFAULT 1;
END IF;
END $$;
-- Add current_progress column if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'habit_businesses'
        AND column_name = 'current_progress'
) THEN
ALTER TABLE habit_businesses
ADD COLUMN current_progress INTEGER DEFAULT 0;
END IF;
END $$;
-- Add comments for documentation
COMMENT ON COLUMN habit_businesses.goal_value IS 'Target value for habit completion (e.g., 5 push-ups, 2 miles)';
COMMENT ON COLUMN habit_businesses.current_progress IS 'Progress toward current goal period';