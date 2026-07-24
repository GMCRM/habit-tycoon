-- Simple test queries to debug portfolio issue
-- Run these one by one in your Supabase SQL Editor to debug
-- 1. Check if you have any stock holdings
SELECT 'Your Stock Holdings:' as debug_step;
SELECT user_id,
    stock_id,
    shares_owned,
    total_invested
FROM stock_holdings
WHERE shares_owned > 0
ORDER BY created_at DESC
LIMIT 10;
-- 2. Check if business_stocks table has data
SELECT 'Business Stocks:' as debug_step;
SELECT id,
    business_id,
    current_stock_price
FROM business_stocks
ORDER BY created_at DESC
LIMIT 10;
-- 3. Check if habit_businesses table has data
SELECT 'Habit Businesses:' as debug_step;
SELECT id,
    user_id,
    business_name,
    business_icon
FROM habit_businesses
ORDER BY created_at DESC
LIMIT 10;
-- 4. Test the portfolio function with a specific user ID
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the console logs
-- SELECT * FROM get_user_stock_portfolio('YOUR_USER_ID_HERE');
-- 5. Check if user_profiles table exists and has data
SELECT 'User Profiles:' as debug_step;
SELECT user_id,
    name,
    display_name
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;