-- Debug the mark as read functionality
-- Run this in Supabase SQL Editor
-- 1. Check current state of all notifications for the user
SELECT 'Current notifications:' as debug_info;
SELECT id,
    message,
    is_read,
    created_at
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC;
-- 2. Test manually marking a notification as read
-- Get the most recent notification ID first, then update it
SELECT 'Testing manual mark as read:' as debug_info;
UPDATE social_pokes
SET is_read = true
WHERE id = (
        SELECT id
        FROM social_pokes
        WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
        ORDER BY created_at DESC
        LIMIT 1
    );
-- 3. Check if the update worked
SELECT 'After manual update:' as debug_info;
SELECT id,
    message,
    is_read,
    created_at
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC
LIMIT 3;