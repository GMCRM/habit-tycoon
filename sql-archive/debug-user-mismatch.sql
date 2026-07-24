-- Check transactions for the user ID that the app is actually using
-- Run this in Supabase SQL Editor
-- 1. Check transactions for the current app user
SELECT 'Transactions for current app user:' as info;
SELECT *
FROM stock_transactions
WHERE buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
ORDER BY created_at DESC;
-- 2. Check transactions for the original user (who has the stocks)
SELECT 'Transactions for original user (who has stocks):' as info;
SELECT *
FROM stock_transactions
WHERE buyer_id = 'cf12469a-d7a2-40ef-82ca-21e8ade1d69b'
ORDER BY created_at DESC;
-- 3. Test portfolio function for current app user
SELECT 'Portfolio for current app user:' as info;
SELECT *
FROM get_user_stock_portfolio('7f77e3a3-68e1-4281-8a40-dd6a857c5d8b');
-- 4. Check if these are different user profiles
SELECT 'User profiles:' as info;
SELECT id,
    name,
    email
FROM user_profiles
WHERE id IN (
        '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b',
        'cf12469a-d7a2-40ef-82ca-21e8ade1d69b'
    );