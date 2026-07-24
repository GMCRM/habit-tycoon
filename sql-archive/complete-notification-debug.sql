-- Complete debug of the notification system
-- Run this in Supabase SQL Editor
-- 1. Check the social_pokes table structure
SELECT 'Social pokes table structure:' as debug_info;
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'social_pokes'
ORDER BY ordinal_position;
-- 2. Check ALL social_pokes entries (regardless of column names)
SELECT 'All social pokes entries:' as debug_info;
SELECT *
FROM social_pokes
ORDER BY created_at DESC
LIMIT 10;
-- 3. Test the get_user_social_notifications function directly
SELECT 'Direct test of notifications function:' as debug_info;
SELECT *
FROM get_user_social_notifications('9cb41595-e976-4a30-bfd1-94f5b25710ab');
-- 4. Test sending a reminder manually
SELECT 'Testing send reminder function:' as debug_info;
SELECT send_stockholder_reminder(
        '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b',
        -- from user
        '9cb41595-e976-4a30-bfd1-94f5b25710ab',
        -- to user (Matai)
        'Test Lemonade Stand' -- business name
    );
-- 5. Check social_pokes again after manual test
SELECT 'Social pokes after manual test:' as debug_info;
SELECT *
FROM social_pokes
ORDER BY created_at DESC
LIMIT 5;