-- Fix reset_outdated_habits() using the server's UTC day instead of the
-- user's local day to decide whether current_progress needs zeroing for a
-- new period.
--
-- Root cause: complete_habit_business() and undo_habit_business_completion()
-- both take a p_client_timezone param and resolve "today" in the user's
-- local time (see 20260810000000_split_stock_streak_bonus_per_completion.sql
-- and 20260814050000_fix_undo_streak_progress_period.sql). reset_outdated_habits()
-- never got the same treatment — it always computed period_start from
-- `now_ts AT TIME ZONE 'UTC'`. resetOutdatedDailyHabits() (habit-business.
-- service.ts) calls it with zero args on every dashboard load, so for any
-- user ahead of UTC there's a window each day — from local midnight until
-- UTC midnight — where the local day has already turned over but the UTC
-- period hasn't, so a habit's current_progress from the *previous* local day
-- is left untouched instead of being zeroed.
--
-- That stale current_progress is invisible for a goal_value=1 habit (no
-- fraction badge is shown, and isHabitCompleteForCurrentPeriod in
-- habit-interval.service.ts happens to still report "not complete" because
-- it separately checks last_completed_at against local midnight) — until the
-- goal_value is edited upward, at which point the stale count suddenly shows
-- up as real progress (e.g. "1/2" on a habit the user hasn't touched yet
-- today), and the next couple of complete/undo taps look like they're not
-- registering because complete_habit_business's own (correct, local-time)
-- reset silently absorbs the first tap before the visible counter moves.
--
-- Fix: give reset_outdated_habits() the same p_client_timezone parameter and
-- period-boundary logic as complete_habit_business(), and have the client
-- pass its IANA timezone, same as it already does for complete/undo.
DROP FUNCTION IF EXISTS reset_outdated_habits();

CREATE OR REPLACE FUNCTION reset_outdated_habits(
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS TABLE (
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
                period_start := date_trunc('day', now_ts AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

            ELSIF habit_record.recurrence_interval = 'specific_days' THEN
                today_dow := EXTRACT(DOW FROM now_ts AT TIME ZONE p_client_timezone)::INTEGER;
                -- Skip if today is not in the habit's active days
                IF habit_record.active_days IS NULL
                   OR NOT (today_dow = ANY(habit_record.active_days)) THEN
                    CONTINUE;
                END IF;
                -- Active day: treat period like a daily period (local midnight)
                period_start := date_trunc('day', now_ts AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;

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
GRANT EXECUTE ON FUNCTION reset_outdated_habits(TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
