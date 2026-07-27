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
ALTER TABLE stock_transactions
    ALTER COLUMN transaction_type TYPE TEXT;
