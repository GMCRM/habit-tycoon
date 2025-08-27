-- Quick check: Does current user have ANY stock transactions?
SELECT 'Current user transactions:' as check_type;
SELECT COUNT(*) as transaction_count
FROM stock_transactions
WHERE buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b';
-- If zero, then we need to transfer transactions or the user truly has no stocks
-- If non-zero, then there's a JOIN issue in the portfolio function
SELECT 'All transactions for current user:' as check_type;
SELECT *
FROM stock_transactions
WHERE buyer_id = '7f77e3a3-68e1-4281-8a40-dd6a857c5d8b';