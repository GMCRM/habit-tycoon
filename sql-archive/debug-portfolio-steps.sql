-- Debug the portfolio function step by step to find where it's failing
-- Run this in Supabase SQL Editor with the current app user ID
-- Step 1: Check if user_holdings CTE returns data
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
SELECT 'Step 1 - User Holdings:' as debug_step;
SELECT *
FROM user_holdings;
-- Step 2: Check if business_stocks table has matching records
SELECT 'Step 2 - Business Stocks Check:' as debug_step;
SELECT bs.*
FROM business_stocks bs
WHERE bs.id IN (
        SELECT DISTINCT st.stock_id
        FROM stock_transactions st
        WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
            AND st.transaction_type = 'purchase'
    );
-- Step 3: Check if habit_businesses table has matching records
SELECT 'Step 3 - Habit Businesses Check:' as debug_step;
SELECT hb.*
FROM habit_businesses hb
WHERE hb.id IN (
        SELECT bs.habit_business_id
        FROM business_stocks bs
        WHERE bs.id IN (
                SELECT DISTINCT st.stock_id
                FROM stock_transactions st
                WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
                    AND st.transaction_type = 'purchase'
            )
    );
-- Step 4: Check if business_types table has matching records
SELECT 'Step 4 - Business Types Check:' as debug_step;
SELECT bt.*
FROM business_types bt
WHERE bt.id IN (
        SELECT hb.business_type_id
        FROM habit_businesses hb
        WHERE hb.id IN (
                SELECT bs.habit_business_id
                FROM business_stocks bs
                WHERE bs.id IN (
                        SELECT DISTINCT st.stock_id
                        FROM stock_transactions st
                        WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
                            AND st.transaction_type = 'purchase'
                    )
            )
    );
-- Step 5: Check if user_profiles table has matching records
SELECT 'Step 5 - User Profiles Check:' as debug_step;
SELECT up.*
FROM user_profiles up
WHERE up.id IN (
        SELECT bs.business_owner_id
        FROM business_stocks bs
        WHERE bs.id IN (
                SELECT DISTINCT st.stock_id
                FROM stock_transactions st
                WHERE st.buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b'
                    AND st.transaction_type = 'purchase'
            )
    );