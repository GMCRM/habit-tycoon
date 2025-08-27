-- Debug notification deletion issue
-- Run this in Supabase SQL Editor
-- 1. Check what notifications exist for the user
SELECT 'Current notifications for user:' as debug_info;
SELECT id,
    message,
    created_at,
    to_user_id,
    from_user_id
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC;
-- 2. Test if we can manually delete a notification
-- (Replace the ID with an actual ID from the query above)
SELECT 'Testing manual delete:' as debug_info;
-- First get a notification ID:
SELECT id as test_notification_id
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC
LIMIT 1;
-- Then try to delete it (uncomment and replace ID):
-- DELETE FROM social_pokes 
-- WHERE id = 'REPLACE_WITH_ACTUAL_ID' 
-- RETURNING id, message;
-- 3. Check what the get_user_social_notifications function returns
SELECT 'Function output:' as debug_info;
SELECT poke_id,
    message,
    created_at
FROM get_user_social_notifications('9cb41595-e976-4a30-bfd1-94f5b25710ab')
ORDER BY created_at DESC;