-- Migration: Replace '7d' (weekly) recurrence_interval with 'specific_days'
-- Users now pick specific days of the week (Mon–Sun) instead of a generic weekly reset.
-- Payout and streak logic mirrors daily habits — each active day is treated independently.
--
-- Run this in Supabase SQL Editor BEFORE deploying the updated frontend.

-- Step 1: Add active_days column (array of DOW integers: 0=Sun, 1=Mon … 6=Sat)
ALTER TABLE habit_businesses
ADD COLUMN IF NOT EXISTS active_days INTEGER[];

-- Drop the OLD constraint now (it only allows '24h'/'7d') so the UPDATEs below
-- are free to write 'specific_days' without being rejected mid-migration.
ALTER TABLE habit_businesses
DROP CONSTRAINT IF EXISTS habit_businesses_recurrence_interval_check;

-- Step 2: Migrate all existing '7d' habits → 'specific_days' with all 7 days active
--         (most conservative equivalent: behaves exactly like before on every day)
UPDATE habit_businesses
SET recurrence_interval = 'specific_days',
    active_days = ARRAY[0,1,2,3,4,5,6]
WHERE recurrence_interval = '7d';

-- Also catch any legacy frequency='weekly' rows not yet migrated by 004
UPDATE habit_businesses
SET recurrence_interval = 'specific_days',
    active_days = ARRAY[0,1,2,3,4,5,6]
WHERE frequency = 'weekly'
  AND (recurrence_interval IS NULL OR recurrence_interval NOT IN ('specific_days', '24h'));

-- Catch-all: any row that still doesn't hold a value the new constraint will accept
-- (NULL, stray/legacy text, etc.) — guarantees Step 3 below can't fail on unknown data.
UPDATE habit_businesses
SET recurrence_interval = 'specific_days',
    active_days = COALESCE(active_days, ARRAY[0,1,2,3,4,5,6])
WHERE recurrence_interval IS NULL
   OR recurrence_interval NOT IN ('24h', 'specific_days');

-- Step 3: Add the new CHECK constraint now that every row has been migrated
-- to a value it accepts ('24h' or 'specific_days').
ALTER TABLE habit_businesses
ADD CONSTRAINT habit_businesses_recurrence_interval_check
CHECK (recurrence_interval IN ('24h', 'specific_days'));

-- Step 4: Rewrite reset_outdated_habits RPC to handle 'specific_days'
--
-- Rules for 'specific_days':
--   • On a NON-active day  → skip entirely (no streak or progress change)
--   • On an ACTIVE day     → period_start = today's UTC midnight (same as '24h')
--                            if last_completed_at < period_start:
--                              goal met  → keep streak, reset progress
--                              goal missed → reset streak to 0, reset progress
CREATE OR REPLACE FUNCTION reset_outdated_habits() RETURNS TABLE (
    id UUID,
    business_name TEXT,
    streak INTEGER,
    was_completed BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    habit_record RECORD;
    now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    FOR habit_record IN
        SELECT
            hb.id,
            hb.business_name,
            hb.recurrence_interval,
            hb.active_days,
            hb.goal_value,
            hb.current_progress,
            hb.streak,
            hb.last_completed_at
        FROM habit_businesses hb
        WHERE hb.user_id = auth.uid()
          AND hb.is_active = true
          AND hb.current_progress > 0
    LOOP
        DECLARE
            period_start TIMESTAMP WITH TIME ZONE;
            goal_was_met BOOLEAN;
            today_dow    INTEGER;
        BEGIN
            IF habit_record.recurrence_interval = '24h' THEN
                period_start := DATE_TRUNC('day', now_ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

            ELSIF habit_record.recurrence_interval = 'specific_days' THEN
                today_dow := EXTRACT(DOW FROM now_ts AT TIME ZONE 'UTC')::INTEGER;
                -- Skip if today is not in the habit's active days
                IF habit_record.active_days IS NULL
                   OR NOT (today_dow = ANY(habit_record.active_days)) THEN
                    CONTINUE;
                END IF;
                -- Active day: treat period like a daily period (UTC midnight)
                period_start := DATE_TRUNC('day', now_ts AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';

            ELSE
                CONTINUE; -- Unknown interval — skip
            END IF;

            -- Only process if the last completion predates the current period start
            IF habit_record.last_completed_at IS NULL
               OR habit_record.last_completed_at < period_start THEN

                goal_was_met := habit_record.current_progress >= habit_record.goal_value;

                IF goal_was_met THEN
                    -- Period completed: preserve streak, reset progress
                    UPDATE habit_businesses
                    SET current_progress = 0,
                        updated_at = now_ts
                    WHERE id = habit_record.id;
                ELSE
                    -- Period missed with partial progress: break streak, reset progress
                    UPDATE habit_businesses
                    SET current_progress = 0,
                        streak = 0,
                        updated_at = now_ts
                    WHERE id = habit_record.id;
                END IF;

                id            := habit_record.id;
                business_name := habit_record.business_name;
                streak        := CASE WHEN goal_was_met THEN habit_record.streak ELSE 0 END;
                was_completed := goal_was_met;
                RETURN NEXT;
            END IF;
        END;
    END LOOP;
END;
$$;

-- Keep backward-compatible alias
DROP FUNCTION IF EXISTS reset_outdated_daily_habits();
CREATE OR REPLACE FUNCTION reset_outdated_daily_habits() RETURNS TABLE (
    id UUID,
    business_name TEXT,
    streak INTEGER,
    was_completed BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY SELECT * FROM reset_outdated_habits();
END;
$$;
