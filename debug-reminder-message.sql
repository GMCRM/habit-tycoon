-- Debug the reminder message function to see what's going wrong
-- Run this in Supabase SQL Editor
-- 1. Test what the function returns when we call it
SELECT 'Testing reminder function:' as debug_step;
SELECT send_stockholder_reminder(
        '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b',
        -- from user
        '9cb41595-e976-4a30-bfd1-94f5b25710ab',
        -- to user (Matai)
        'Lemonade Stand' -- business name
    );
-- 2. Check what the user name lookup returns
SELECT 'User name lookup:' as debug_step;
SELECT COALESCE(name, 'Unknown User') as sender_name
FROM user_profiles
WHERE id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b';
-- 3. Check what the habit name lookup returns
SELECT 'Habit name lookup:' as debug_step;
SELECT COALESCE(hb.business_name, 'your habit') as habit_name
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE bt.name = 'Lemonade Stand'
    AND hb.user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab';
-- 4. Check all habit businesses for the target user
SELECT 'All habits for target user:' as debug_step;
SELECT hb.business_name,
    bt.name as business_type,
    hb.user_id
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE hb.user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab';
-- 5. Check the most recent social_poke to see the actual message
SELECT 'Most recent notification:' as debug_step;
SELECT message,
    created_at
FROM social_pokes
ORDER BY created_at DESC
LIMIT 1;