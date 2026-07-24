-- Debug Portfolio Data Issues
-- Check what business IDs are in the portfolio vs what exists in business_stocks
-- 1. Check if these business IDs exist in business_stocks table
SELECT 'business_stocks check' as query_type,
    id,
    business_name
FROM business_stocks
WHERE id IN (
        '0d5a4546-b3d1-46fc-a191-c308a1119e03',
        '57829262-b3c8-45f5-872f-862faf4238ef',
        '1bc04326-1440-4250-8eda-53d682f302b3'
    );
-- 2. Check if these business IDs exist in habit_businesses table
SELECT 'habit_businesses check' as query_type,
    id,
    business_name
FROM habit_businesses
WHERE id IN (
        '0d5a4546-b3d1-46fc-a191-c308a1119e03',
        '57829262-b3c8-45f5-872f-862faf4238ef',
        '1bc04326-1440-4250-8eda-53d682f302b3'
    );
-- 3. Check what completion data exists for any of these businesses
SELECT 'completion_data check' as query_type,
    business_id,
    completed_at,
    count(*) as completion_count
FROM habit_completions
WHERE business_id IN (
        '0d5a4546-b3d1-46fc-a191-c308a1119e03',
        '57829262-b3c8-45f5-872f-862faf4238ef',
        '1bc04326-1440-4250-8eda-53d682f302b3'
    )
GROUP BY business_id,
    completed_at
ORDER BY completed_at DESC
LIMIT 10;
-- 4. Check what data the RPC function should return for one specific business
SELECT get_habit_completions_for_stock(
        '0d5a4546-b3d1-46fc-a191-c308a1119e03'::UUID,
        '2025-01-01T06:00:00.000Z'::TIMESTAMP WITH TIME ZONE,
        '2026-01-01T05:59:59.000Z'::TIMESTAMP WITH TIME ZONE
    ) as rpc_result;
-- 5. Check the current user context
SELECT current_user,
    session_user;
-- 6. Check if RLS is blocking access
SET row_security = OFF;
SELECT 'rls_off_test' as query_type,
    business_id,
    completed_at,
    count(*) as completion_count
FROM habit_completions
WHERE business_id IN (
        '0d5a4546-b3d1-46fc-a191-c308a1119e03',
        '57829262-b3c8-45f5-872f-862faf4238ef',
        '1bc04326-1440-4250-8eda-53d682f302b3'
    )
GROUP BY business_id,
    completed_at
ORDER BY completed_at DESC
LIMIT 10;
SET row_security = ON;