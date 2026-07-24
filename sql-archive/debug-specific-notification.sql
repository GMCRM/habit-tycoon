-- Debug specific notification that failed to delete
-- Run this in Supabase SQL Editor
-- 1. Check if this specific notification exists in the database
SELECT 'Direct table query:' as debug_info;
SELECT id,
    message,
    created_at,
    to_user_id,
    from_user_id,
    is_read
FROM social_pokes
WHERE id = 'ba0f124d-ede2-4a16-9fc7-23e17888e8f8';
-- 2. Check what the function returns for this user
SELECT 'Function query:' as debug_info;
SELECT poke_id,
    message,
    created_at
FROM get_user_social_notifications('9cb41595-e976-4a30-bfd1-94f5b25710ab')
WHERE poke_id = 'ba0f124d-ede2-4a16-9fc7-23e17888e8f8';
-- 3. Check RLS policies for DELETE operations
SELECT 'RLS policies:' as debug_info;
SELECT policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'social_pokes'
    AND cmd = 'DELETE';
-- 4. Test if we can manually delete (as admin)
SELECT 'Manual delete test:' as debug_info;
-- DELETE FROM social_pokes 
-- WHERE id = 'ba0f124d-ede2-4a16-9fc7-23e17888e8f8'
-- RETURNING id, message;
-- 5. Check all notifications for this user to see the actual state
SELECT 'All notifications for user:' as debug_info;
SELECT id,
    message,
    created_at,
    is_read
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC;