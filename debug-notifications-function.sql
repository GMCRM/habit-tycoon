-- Debug the get_user_social_notifications function
-- Run this in Supabase SQL Editor
-- 1. Test the function directly
SELECT 'Testing get_user_social_notifications function:' as debug_step;
SELECT *
FROM get_user_social_notifications('9cb41595-e976-4a30-bfd1-94f5b25710ab');
-- 2. Check what the raw social_pokes table contains
SELECT 'Raw social_pokes data:' as debug_step;
SELECT id,
    from_user_id,
    to_user_id,
    message,
    type,
    is_read,
    created_at
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC
LIMIT 5;
-- 3. Check if the function definition includes the id field
SELECT 'Function definition check:' as debug_step;
SELECT routine_name,
    data_type,
    ordinal_position,
    parameter_name
FROM information_schema.parameters
WHERE specific_schema = 'public'
    AND routine_name = 'get_user_social_notifications'
ORDER BY ordinal_position;
-- 4. If the function exists, let's see its definition
SELECT 'Function source:' as debug_step;
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'get_user_social_notifications';