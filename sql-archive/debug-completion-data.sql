-- Debug query to check what completion data exists for the business
-- Replace this UUID with the actual business ID from your console logs
SELECT id,
    completed_at,
    completed_at AT TIME ZONE 'UTC' as completed_at_utc,
    streak_count,
    habit_business_id,
    DATE(completed_at) as completion_date,
    EXTRACT(
        YEAR
        FROM completed_at
    ) as year,
    EXTRACT(
        MONTH
        FROM completed_at
    ) as month,
    EXTRACT(
        DAY
        FROM completed_at
    ) as day
FROM habit_completions
WHERE habit_business_id = '2d9a7112-085d-4119-a4b2-12dda57640bd'
ORDER BY completed_at DESC
LIMIT 20;
-- Check if business exists in business_stocks
SELECT bs.id,
    bs.habit_business_id,
    hb.business_name,
    hb.user_id
FROM business_stocks bs
    INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
WHERE hb.id = '2d9a7112-085d-4119-a4b2-12dda57640bd';
-- Test the RPC function directly
SELECT *
FROM get_habit_completions_for_stock(
        '2d9a7112-085d-4119-a4b2-12dda57640bd'::UUID,
        '2025-08-01T00:00:00.000Z'::TIMESTAMP WITH TIME ZONE,
        '2025-08-25T23:59:59.000Z'::TIMESTAMP WITH TIME ZONE
    );
-- Check recent completions (last 30 days)
SELECT completed_at,
    DATE(completed_at) as completion_date
FROM habit_completions
WHERE habit_business_id = '2d9a7112-085d-4119-a4b2-12dda57640bd'
    AND completed_at >= NOW() - INTERVAL '30 days'
ORDER BY completed_at DESC;