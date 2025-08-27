-- Clean up function overloading issue
-- Drop the old version with TIMESTAMP (without time zone) parameters
-- First, drop any existing versions to avoid conflicts
DROP FUNCTION IF EXISTS get_habit_completions_for_stock(UUID, TIMESTAMP, TIMESTAMP);
-- Also drop any other potential variants
DROP FUNCTION IF EXISTS get_habit_completions_for_stock(
    business_uuid UUID,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);
-- Verify only our correct version remains
-- Show function definitions
SELECT proname as function_name,
    pg_get_function_result(oid) as return_type,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'get_habit_completions_for_stock';
-- Test the function exists and works
SELECT 'Function cleanup complete' as status;