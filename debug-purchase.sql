-- Debug: Check if your recent stock purchase worked
-- Run this in Supabase SQL Editor
-- 1. Check your most recent stock holdings (should show your new purchase)
SELECT 'Your Recent Stock Holdings:' as debug_info;
SELECT user_id,
    stock_id,
    shares_owned,
    total_invested,
    average_purchase_price,
    created_at
FROM stock_holdings
ORDER BY created_at DESC
LIMIT 10;
-- 2. Check what user_id you are (replace with your email)
SELECT 'Your User ID:' as debug_info;
SELECT id,
    email
FROM auth.users
WHERE email = 'kirsha.cross23@gmail.com';
-- Replace with your email
-- 3. Check if the business_stocks table has the lemonade stand
SELECT 'Business Stocks Available:' as debug_info;
SELECT bs.id,
    bs.business_id,
    bs.current_stock_price,
    hb.business_name,
    hb.user_id
FROM business_stocks bs
    JOIN habit_businesses hb ON bs.business_id = hb.id
WHERE hb.business_name ILIKE '%lemonade%'
ORDER BY bs.created_at DESC;
-- 4. Test the function with your actual user ID
-- First, let's see what user_id owns lemonade stands
SELECT 'Lemonade Stand Owners:' as debug_info;
SELECT user_id,
    business_name,
    business_icon
FROM habit_businesses
WHERE business_name ILIKE '%lemonade%';
-- 5. Check if your holdings match any stocks
SELECT 'Holdings vs Stocks Check:' as debug_info;
SELECT sh.user_id,
    sh.stock_id,
    sh.shares_owned,
    bs.id as business_stock_id,
    bs.business_id
FROM stock_holdings sh
    LEFT JOIN business_stocks bs ON sh.stock_id = bs.id
WHERE sh.shares_owned > 0
ORDER BY sh.created_at DESC
LIMIT 5;
-- 6. Test the portfolio function with the user who just bought shares
-- Replace 'cf12469a-d7a2-40ef-82ca-21e8ade1d69b' with your actual user_id from query 2
-- SELECT * FROM get_user_stock_portfolio('cf12469a-d7a2-40ef-82ca-21e8ade1d69b');