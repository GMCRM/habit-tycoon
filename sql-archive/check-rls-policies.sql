-- Check RLS policies for social_pokes table
-- Run this in Supabase SQL Editor
-- 1. Check if RLS is enabled
SELECT 'RLS status:' as debug_info;
SELECT tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'social_pokes';
-- 2. Check existing policies
SELECT 'Current RLS policies:' as debug_info;
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'social_pokes'
ORDER BY policyname;
-- 3. Test if the current user can update notifications
-- This will help identify if it's a permissions issue
SELECT 'Testing current user permissions:' as debug_info;
-- First, get a real notification ID to test with
SELECT id as notification_id
FROM social_pokes
WHERE to_user_id = '9cb41595-e976-4a30-bfd1-94f5b25710ab'
ORDER BY created_at DESC
LIMIT 1;