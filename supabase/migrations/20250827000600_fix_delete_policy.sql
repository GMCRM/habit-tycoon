-- Fix social_pokes DELETE policy
-- Run this in Supabase SQL Editor
-- Add DELETE policy for social_pokes table
DROP POLICY IF EXISTS "Users can delete their received pokes" ON social_pokes;
CREATE POLICY "Users can delete their received pokes" ON social_pokes FOR DELETE USING (auth.uid() = to_user_id);
-- Verify the policy was created
SELECT 'Checking DELETE policies:' as debug_info;
SELECT policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'social_pokes'
    AND cmd = 'DELETE';