-- Debug the portfolio function JOINs step by step for current user
-- Run this in Supabase SQL Editor
-- Step 1: Raw transactions for current user
SELECT 'Step 1 - Raw Transactions:' as debug_step;
SELECT *
FROM stock_transactions
WHERE buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
    AND transaction_type = 'purchase';
-- Step 2: User holdings aggregation (this is the CTE from the function)
SELECT 'Step 2 - User Holdings CTE:' as debug_step;
WITH user_holdings AS (
    SELECT st.stock_id,
        SUM(st.shares_traded) as total_shares,
        ROUND(AVG(st.price_per_share), 2) as avg_price,
        SUM(st.total_cost) as total_invested
    FROM stock_transactions st
    WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
        AND st.transaction_type = 'purchase'
    GROUP BY st.stock_id
    HAVING SUM(st.shares_traded) > 0
)
SELECT *
FROM user_holdings;
-- Step 3: Check if business_stocks JOIN will work
SELECT 'Step 3 - Business Stocks JOIN test:' as debug_step;
WITH user_holdings AS (
    SELECT st.stock_id,
        SUM(st.shares_traded) as total_shares
    FROM stock_transactions st
    WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
        AND st.transaction_type = 'purchase'
    GROUP BY st.stock_id
    HAVING SUM(st.shares_traded) > 0
)
SELECT uh.stock_id,
    bs.id as business_stock_id,
    bs.habit_business_id
FROM user_holdings uh
    JOIN business_stocks bs ON uh.stock_id = bs.id;
-- Step 4: Check if habit_businesses JOIN will work
SELECT 'Step 4 - Habit Businesses JOIN test:' as debug_step;
WITH user_holdings AS (
    SELECT st.stock_id,
        SUM(st.shares_traded) as total_shares
    FROM stock_transactions st
    WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
        AND st.transaction_type = 'purchase'
    GROUP BY st.stock_id
    HAVING SUM(st.shares_traded) > 0
)
SELECT uh.stock_id,
    bs.habit_business_id,
    hb.id as habit_business_id,
    hb.business_name
FROM user_holdings uh
    JOIN business_stocks bs ON uh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id;
-- Step 5: Check if business_types JOIN will work
SELECT 'Step 5 - Business Types JOIN test:' as debug_step;
WITH user_holdings AS (
    SELECT st.stock_id,
        SUM(st.shares_traded) as total_shares
    FROM stock_transactions st
    WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
        AND st.transaction_type = 'purchase'
    GROUP BY st.stock_id
    HAVING SUM(st.shares_traded) > 0
)
SELECT uh.stock_id,
    hb.business_name,
    bt.name as business_type_name
FROM user_holdings uh
    JOIN business_stocks bs ON uh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    JOIN business_types bt ON hb.business_type_id = bt.id;