-- Function to reset daily habits that are outdated
-- This function should be called when the app loads to ensure habits are properly reset
-- Fixed to handle timezone differences properly
DROP FUNCTION IF EXISTS reset_outdated_daily_habits();
CREATE OR REPLACE FUNCTION reset_outdated_daily_habits() RETURNS TABLE (habit_business_id UUID, reset_reason TEXT) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN 
    -- Reset daily habits where last_completed_at is more than 30 hours ago
    -- This accounts for timezone differences (up to UTC+14) while ensuring 
    -- habits completed "yesterday" in any timezone are properly reset
    RETURN QUERY WITH reset_habits AS (
        UPDATE habit_businesses
        SET current_progress = 0,
            updated_at = NOW()
        WHERE frequency = 'daily'
            AND is_active = true
            AND last_completed_at IS NOT NULL
            AND last_completed_at < (NOW() - INTERVAL '30 hours')
        RETURNING id,
            'Daily habit reset - completed more than 30 hours ago' as reason
    )
SELECT id,
    reason
FROM reset_habits;
-- Note: We don't reset last_completed_at because we need it for streak calculation
-- We only reset current_progress so habits show as incomplete for today
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_outdated_daily_habits() TO authenticated;
-- Function to check if daily habits need reset for a specific user
DROP FUNCTION IF EXISTS check_user_habits_need_reset(UUID);
CREATE OR REPLACE FUNCTION check_user_habits_need_reset(user_uuid UUID) RETURNS TABLE (
        habit_business_id UUID,
        business_name TEXT,
        last_completed_date DATE,
        needs_reset BOOLEAN
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT hb.id,
    hb.business_name,
    DATE(hb.last_completed_at) as last_completed_date,
    (
        hb.frequency = 'daily'
        AND hb.last_completed_at IS NOT NULL
        AND hb.last_completed_at < (NOW() - INTERVAL '30 hours')
    ) as needs_reset
FROM habit_businesses hb
WHERE hb.user_id = user_uuid
    AND hb.is_active = true
    AND hb.frequency = 'daily'
ORDER BY hb.created_at;
END;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_habits_need_reset(UUID) TO authenticated;