-- Check what tables actually exist for stock/portfolio data
-- Run this in Supabase SQL Editor
-- 1. Check if stock_holdings table exists at all
SELECT table_name
FROM information_schema.tables
WHERE table_name IN (
        'stock_holdings',
        'business_stocks',
        'user_portfolios',
        'share_holdings'
    )
ORDER BY table_name;
-- 2. Check all your stock purchases/holdings 
-- Based on the schema, it looks like shares are tracked differently
SELECT id,
    habit_business_id,
    business_owner_id,
    current_stock_price,
    total_shares_issued,
    shares_owned_by_owner,
    shares_available,
    created_at
FROM business_stocks
ORDER BY created_at DESC;
-- 3. Check if there's a separate purchases/transactions table
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE '%stock%'
    OR table_name LIKE '%share%'
    OR table_name LIKE '%purchase%'
ORDER BY table_name;
-- 4. Check your user ID to see which shares you should own
SELECT id,
    email
FROM auth.users
WHERE email = 'kirsha.cross23@gmail.com';
-- 5. Look for any table that might track individual user purchases
-- Let's check if there are any tables with your user ID
SELECT table_name,
    column_name
FROM information_schema.columns
WHERE column_name LIKE '%user%'
    OR column_name LIKE '%investor%'
    OR column_name LIKE '%buyer%'
ORDER BY table_name,
    column_name;