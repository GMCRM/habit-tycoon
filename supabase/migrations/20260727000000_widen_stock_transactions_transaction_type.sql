-- Fix: deleting a habit business with active stockholders fails with
-- "value too long for type character varying(20)".
--
-- stock_transactions.transaction_type was created as VARCHAR(20)
-- (20250827000300_business_stocks_schema.sql). A later migration
-- (20250827000200_business_deletion_stock_refund.sql) added
-- 'business_deletion_refund' (24 chars) to the CHECK constraint's allowed
-- values but never widened the column itself, so the refund trigger
-- (handle_business_deletion_stock_refunds) has been failing to insert that
-- transaction row ever since a deleted business had any stockholders —
-- which aborts the whole deleteHabitBusiness() transaction.
--
-- The CHECK constraint is the actual guard on allowed values, so widen to
-- TEXT rather than picking a new fixed length that could just as easily be
-- outgrown again.
--
-- The INSERT policy "Users can create transactions as buyer or seller"
-- (20260531200801_fix_sell_stock_buyer_id_nullable.sql) references
-- transaction_type in its WITH CHECK clause, which blocks ALTER COLUMN TYPE
-- outright. Drop and recreate it around the type change.
DROP POLICY IF EXISTS "Users can create transactions as buyer or seller" ON stock_transactions;

ALTER TABLE stock_transactions
    ALTER COLUMN transaction_type TYPE TEXT;

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
