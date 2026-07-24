-- Check the stock_transactions table structure and your purchases
-- Run this in Supabase SQL Editor
-- 1. Check the structure of stock_transactions table
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'stock_transactions'
ORDER BY ordinal_position;
-- 2. Check your recent stock transactions/purchases
SELECT *
FROM stock_transactions
ORDER BY created_at DESC
LIMIT 10;
-- 3. Check transactions for your user ID specifically
-- Replace with your actual user ID from the previous query
SELECT *
FROM stock_transactions
WHERE buyer_id = 'cf12469a-d7a2-40ef-82ca-21e8ade1d69b'
ORDER BY created_at DESC;
-- 4. Check if there are any transactions at all
SELECT COUNT(*) as total_transactions
FROM stock_transactions;