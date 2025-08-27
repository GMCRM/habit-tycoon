-- Test if the portfolio function is accessible and working
-- Run this in Supabase SQL Editor
-- Test 1: Check if function exists
SELECT routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'get_user_stock_portfolio';
-- Test 2: Try to call the function
SELECT *
FROM get_user_stock_portfolio('cf12469a-d7a2-40ef-82ca-21e8ade1d69b');
-- Test 3: Check RPC permissions
SELECT has_function_privilege(
        'authenticated',
        'get_user_stock_portfolio(uuid)',
        'execute'
    );