-- Test notification update functionality
-- Run this in Supabase SQL Editor
-- 1. Check the structure of social_pokes table
SELECT 'Table structure:' as debug_info;
SELECT column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'social_pokes'
ORDER BY ordinal_position;
-- 2. Check if we can see any notifications
SELECT 'All notifications:' as debug_info;
SELECT id,
    message,
    is_read,
    created_at,
    to_user_id
FROM social_pokes
ORDER BY created_at DESC
LIMIT 5;
-- 3. Test creating a sample notification for testing
SELECT 'Creating test notification:' as debug_info;
INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read)
VALUES (
        '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b',
        -- from user
        '9cb41595-e976-4a30-bfd1-94f5b25710ab',
        -- to user (Matai)
        'Test notification for debug purposes',
        'stockholder_reminder',
        false
    )
RETURNING id,
    message,
    is_read;
-- 4. Try to update the test notification we just created
SELECT 'Testing update:' as debug_info;
UPDATE social_pokes
SET is_read = true
WHERE message = 'Test notification for debug purposes'
    AND to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
RETURNING id,
    message,
    is_read;
-- 5. Verify the update worked
SELECT 'After update verification:' as debug_info;
SELECT id,
    message,
    is_read,
    created_at
FROM social_pokes
WHERE message = 'Test notification for debug purposes'
    AND to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab';
-- 6. Clean up test notification
DELETE FROM social_pokes
WHERE message = 'Test notification for debug purposes'
    AND to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab';
SELECT 'Test notification cleaned up' as debug_info;