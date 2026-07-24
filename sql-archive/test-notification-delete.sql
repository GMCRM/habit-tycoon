-- Test notification deletion functionality
-- Run this in Supabase SQL Editor
-- 1. Check current notifications for the user
SELECT 'Current notifications:' as debug_info;
SELECT id,
    message,
    created_at,
    is_read
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC
LIMIT 5;
-- 2. Try to delete a specific notification (replace with actual ID)
-- Get the ID from the above query first
SELECT 'Testing delete operation:' as debug_info;
-- DELETE FROM social_pokes 
-- WHERE id = 'REPLACE_WITH_ACTUAL_ID' 
-- AND to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab';
-- 3. Check RLS policies for DELETE operations
SELECT 'Delete policies:' as debug_info;
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'social_pokes'
    AND cmd = 'DELETE'
ORDER BY policyname;