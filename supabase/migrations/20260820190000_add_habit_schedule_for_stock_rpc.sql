-- The stock/social-tab price chart (StockChartComponent) builds a synthetic
-- daily "streak" line by walking every calendar day and resetting the streak
-- to 0 on any day with no completion. That's correct for '24h' habits, but
-- for 'specific_days' habits (e.g. active only Mon/Wed/Fri) it's wrong: every
-- non-scheduled day gets treated as a miss, so the line saws down to 0 and
-- then jumps back up to the real (unbroken) streak_count on the next
-- scheduled day — repeating every week. See
-- HabitBusinessService.getHabitCompletionHistory[ForStock].
--
-- get_habit_completions_for_stock() only returns completion rows, not the
-- business's schedule, and a stock viewer (investor, not the owner) can't
-- read habit_businesses directly — RLS on that table only allows the owner
-- (see 20250827000000_supabase_setup.sql). This adds a small SECURITY
-- DEFINER RPC mirroring get_habit_completions_for_stock's own authorization
-- check (only businesses with a public stock are visible) to expose just the
-- schedule fields the chart needs to stop miscounting rest days as misses.
CREATE OR REPLACE FUNCTION get_habit_schedule_for_stock(input_uuid UUID)
    RETURNS TABLE (
        recurrence_interval TEXT,
        frequency TEXT,
        active_days INTEGER[]
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE target_business_id UUID;
BEGIN
    SELECT id INTO target_business_id
    FROM habit_businesses
    WHERE id = input_uuid;

    IF target_business_id IS NULL THEN
        SELECT habit_business_id INTO target_business_id
        FROM business_stocks
        WHERE id = input_uuid;
    END IF;

    IF target_business_id IS NULL THEN
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM business_stocks bs
        WHERE bs.habit_business_id = target_business_id
    ) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT hb.recurrence_interval, hb.frequency, hb.active_days
    FROM habit_businesses hb
    WHERE hb.id = target_business_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_habit_schedule_for_stock(UUID) TO authenticated;

COMMENT ON FUNCTION get_habit_schedule_for_stock(UUID) IS
'Returns the recurrence schedule (recurrence_interval/frequency/active_days) for a business with a public stock, for stock viewers who cannot read habit_businesses directly. Used by the stock completion-history chart to avoid treating a specific_days habit''s non-scheduled days as broken streaks.';

NOTIFY pgrst, 'reload schema';
