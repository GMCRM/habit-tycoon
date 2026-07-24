-- Migration: Replace frequency ('daily'/'weekly') with recurrence_interval ('24h'/'7d')
-- Run this in Supabase SQL Editor BEFORE deploying the updated frontend.
-- Step 1: Add the new column (nullable first so backfill can run)
ALTER TABLE habit_businesses
ADD COLUMN IF NOT EXISTS recurrence_interval TEXT;
-- Step 2: Backfill from existing frequency values
UPDATE habit_businesses
SET recurrence_interval = '24h'
WHERE frequency = 'daily'
    AND recurrence_interval IS NULL;
UPDATE habit_businesses
SET recurrence_interval = '7d'
WHERE frequency = 'weekly'
    AND recurrence_interval IS NULL;
-- Step 3: Set default and NOT NULL constraint
ALTER TABLE habit_businesses
ALTER COLUMN recurrence_interval
SET DEFAULT '24h';
UPDATE habit_businesses
SET recurrence_interval = '24h'
WHERE recurrence_interval IS NULL;
ALTER TABLE habit_businesses
ALTER COLUMN recurrence_interval
SET NOT NULL;
-- Step 4: Add CHECK constraint
ALTER TABLE habit_businesses
ADD CONSTRAINT habit_businesses_recurrence_interval_check CHECK (recurrence_interval IN ('24h', '7d'));
-- Step 5: Rewrite the reset RPC to handle both intervals.
-- The client passes its local timezone offset (in minutes, e.g. -300 for UTC-5) so
-- period boundaries are computed in the user's local time on the server side.
-- Note: If you prefer to pass the current period start from the client instead, see
-- the service layer (HabitIntervalService) which calculates boundaries locally.
CREATE OR REPLACE FUNCTION reset_outdated_habits() RETURNS TABLE (
        id UUID,
        business_name TEXT,
        streak INTEGER,
        was_completed BOOLEAN
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE habit_record RECORD;
now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN -- Loop over all active habits for the authenticated user
FOR habit_record IN
SELECT hb.id,
    hb.business_name,
    hb.recurrence_interval,
    hb.goal_value,
    hb.current_progress,
    hb.streak,
    hb.last_completed_at,
    hb.user_id
FROM habit_businesses hb
WHERE hb.user_id = auth.uid()
    AND hb.is_active = true
    AND hb.current_progress > 0 LOOP
DECLARE period_start TIMESTAMP WITH TIME ZONE;
goal_was_met BOOLEAN;
BEGIN -- Determine the start of the CURRENT period using UTC boundaries.
-- (The client-side HabitIntervalService handles local-time display;
--  server uses UTC for consistency in RPC logic.)
IF habit_record.recurrence_interval = '24h' THEN -- Current UTC day start
period_start := DATE_TRUNC('day', now_ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
ELSIF habit_record.recurrence_interval = '7d' THEN -- Most recent Sunday UTC midnight
-- EXTRACT DOW: 0=Sunday ... 6=Saturday
period_start := DATE_TRUNC('day', now_ts AT TIME ZONE 'UTC') - (
    EXTRACT(
        DOW
        FROM now_ts AT TIME ZONE 'UTC'
    )::INTEGER * INTERVAL '1 day'
) AT TIME ZONE 'UTC';
ELSE CONTINUE;
END IF;
-- Only process if the last completion happened BEFORE the current period start
-- (meaning the period has rolled over and current_progress hasn't been reset yet)
IF habit_record.last_completed_at IS NULL
OR habit_record.last_completed_at < period_start THEN goal_was_met := habit_record.current_progress >= habit_record.goal_value;
IF goal_was_met THEN -- Goal was met last period: preserve streak, just reset progress
UPDATE habit_businesses
SET current_progress = 0,
    updated_at = now_ts
WHERE id = habit_record.id;
ELSE -- Goal was NOT met: break streak, reset progress
UPDATE habit_businesses
SET current_progress = 0,
    streak = 0,
    updated_at = now_ts
WHERE id = habit_record.id;
END IF;
-- Return this habit so the caller can update stock prices
id := habit_record.id;
business_name := habit_record.business_name;
streak := CASE
    WHEN goal_was_met THEN habit_record.streak
    ELSE 0
END;
was_completed := goal_was_met;
RETURN NEXT;
END IF;
END;
END LOOP;
END;
$$;
-- Drop the old function first (return type changed) then recreate as alias
DROP FUNCTION IF EXISTS reset_outdated_daily_habits();
CREATE OR REPLACE FUNCTION reset_outdated_daily_habits() RETURNS TABLE (
        id UUID,
        business_name TEXT,
        streak INTEGER,
        was_completed BOOLEAN
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT *
FROM reset_outdated_habits();
END;
$$;
-- Step 6 (run later, after confirming frontend is fully deployed):
-- ALTER TABLE habit_businesses DROP COLUMN frequency;
-- DROP FUNCTION IF EXISTS reset_outdated_daily_habits();