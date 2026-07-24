-- Find the correct column names in stock_holdings table
-- Run this in Supabase SQL Editor
-- 1. Check the structure of stock_holdings table
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'stock_holdings'
ORDER BY ordinal_position;
-- 2. Check a few records to see the actual column names
SELECT *
FROM stock_holdings
LIMIT 3;
-- 3. Check the structure of business_stocks table too
SELECT column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'business_stocks'
ORDER BY ordinal_position;
-- 4. Check business_stocks records
SELECT *
FROM business_stocks
LIMIT 3;