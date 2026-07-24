-- FIX: Allow NULL buyer_id in stock_transactions for sale transactions
--
-- ROOT CAUSE: sell_stock_shares inserts NULL for buyer_id when selling shares
-- back to the market (no specific buyer), but the column was defined NOT NULL.
-- This caused a constraint violation, rolling back every sell attempt.
--
-- SOLUTION: Make buyer_id nullable. For purchases, buyer_id is always set.
-- For sales, buyer_id is NULL (shares return to available pool).
-- 1. Drop NOT NULL constraint on buyer_id
ALTER TABLE stock_transactions
ALTER COLUMN buyer_id DROP NOT NULL;
-- 2. Update the INSERT RLS policy so sellers can also insert sale records
--    (The sell_stock_shares function is SECURITY DEFINER so RLS is bypassed,
--     but this keeps the policy consistent for any future direct inserts.)
DROP POLICY IF EXISTS "Users can create transactions as buyer" ON stock_transactions;
CREATE POLICY "Users can create transactions as buyer or seller" ON stock_transactions FOR
INSERT WITH CHECK (
        (
            transaction_type IN ('purchase', 'ipo')
            AND auth.uid() = buyer_id
        )
        OR (
            transaction_type = 'sale'
            AND auth.uid() = seller_id
            AND buyer_id IS NULL
        )
    );