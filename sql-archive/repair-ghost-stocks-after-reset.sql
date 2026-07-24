-- ONE-TIME REPAIR: Fix ghost stocks caused by the incomplete reset
--
-- PROBLEM: The previous reset deleted stock_holdings but did NOT:
--   1. Restore shares_available in business_stocks
--   2. Delete the matching stock_transactions
--
-- As a result, sell_stock_shares fails with "No holdings found" because
-- stock_holdings is empty, yet transactions still exist.
--
-- HOW TO USE:
--   Run as-is in the Supabase SQL Editor. It auto-detects every affected user
--   (anyone who has purchase transactions for a stock they no longer hold)
--   and repairs them all at once. No UUID entry required.
DO $$
DECLARE rec RECORD;
user_rec RECORD;
BEGIN -- Find every user who has purchase transactions for stocks they no longer hold.
-- "No longer hold" = no row in stock_holdings with shares_owned > 0.
FOR user_rec IN
SELECT DISTINCT st.buyer_id AS user_id
FROM stock_transactions st
WHERE st.transaction_type = 'purchase'
    AND NOT EXISTS (
        SELECT 1
        FROM stock_holdings sh
        WHERE sh.holder_id = st.buyer_id
            AND sh.stock_id = st.stock_id
            AND sh.shares_owned > 0
    ) LOOP RAISE NOTICE 'Repairing ghost stocks for user %',
    user_rec.user_id;
-- Step 1: Restore net shares back to business_stocks.shares_available
FOR rec IN
SELECT stock_id,
    SUM(
        CASE
            WHEN transaction_type = 'purchase'
            AND buyer_id = user_rec.user_id THEN shares_traded
            ELSE 0
        END
    ) - SUM(
        CASE
            WHEN transaction_type = 'sale'
            AND seller_id = user_rec.user_id THEN shares_traded
            ELSE 0
        END
    ) AS net_shares
FROM stock_transactions
WHERE buyer_id = user_rec.user_id
    OR seller_id = user_rec.user_id
GROUP BY stock_id
HAVING SUM(
        CASE
            WHEN transaction_type = 'purchase'
            AND buyer_id = user_rec.user_id THEN shares_traded
            ELSE 0
        END
    ) - SUM(
        CASE
            WHEN transaction_type = 'sale'
            AND seller_id = user_rec.user_id THEN shares_traded
            ELSE 0
        END
    ) > 0 LOOP
UPDATE business_stocks
SET shares_available = shares_available + rec.net_shares,
    updated_at = NOW()
WHERE id = rec.stock_id;
RAISE NOTICE '  Restored % shares for stock %',
rec.net_shares,
rec.stock_id;
END LOOP;
-- Step 2: Remove the ghost transaction history for this user
DELETE FROM stock_transactions
WHERE buyer_id = user_rec.user_id
    AND transaction_type = 'purchase';
DELETE FROM stock_transactions
WHERE seller_id = user_rec.user_id
    AND transaction_type = 'sale';
RAISE NOTICE '  Repair complete for user %',
user_rec.user_id;
END LOOP;
RAISE NOTICE 'All ghost-stock repairs finished.';
END;
$$;