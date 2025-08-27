-- Check if the reminder was actually stored in social_pokes table
-- Run this in Supabase SQL Editor
-- 1. Check recent social_pokes entries
SELECT 'Recent social pokes:' as debug_info;
SELECT *
FROM social_pokes
ORDER BY created_at DESC
LIMIT 10;
-- 2. Check specifically for stockholder reminders
SELECT 'Stockholder reminders:' as debug_info;
SELECT *
FROM social_pokes
WHERE poke_type = 'stockholder_reminder'
ORDER BY created_at DESC;
-- 3. Check for the business owner's user ID
SELECT 'Reminders for Matai chief Cross:' as debug_info;
SELECT *
FROM social_pokes
WHERE target_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC;