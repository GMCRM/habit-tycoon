-- Business Deletion Stock Refund System
-- This creates a trigger that automatically refunds stockholders when a business is deleted
-- First, create a function to handle stock refunds when a business is deleted
CREATE OR REPLACE FUNCTION handle_business_deletion_stock_refunds() RETURNS TRIGGER AS $$
DECLARE stock_record RECORD;
holding_record RECORD;
refund_amount DECIMAL(12, 2);
current_stock_price DECIMAL(10, 2);
BEGIN -- Only process if the business is being deactivated (soft delete)
IF OLD.is_active = true
AND NEW.is_active = false THEN -- Get the stock record for this business
SELECT * INTO stock_record
FROM business_stocks
WHERE habit_business_id = NEW.id;
-- If there's a stock record, process refunds
IF FOUND THEN -- Get current stock price
current_stock_price := stock_record.current_price;
-- Refund all stockholders
FOR holding_record IN
SELECT sh.*,
    up.cash
FROM stock_holdings sh
    JOIN user_profiles up ON sh.holder_id = up.id
WHERE sh.stock_id = stock_record.id
    AND sh.shares_owned > 0 LOOP -- Calculate refund: shares * current stock price
    refund_amount := holding_record.shares_owned * current_stock_price;
-- Add refund to user's cash
UPDATE user_profiles
SET cash = cash + refund_amount,
    updated_at = NOW()
WHERE id = holding_record.holder_id;
-- Create a transaction record for the forced sale
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type,
        created_at
    )
VALUES (
        stock_record.id,
        NULL,
        -- No buyer for business deletion
        holding_record.holder_id,
        holding_record.shares_owned,
        current_stock_price,
        refund_amount,
        'business_deletion_refund',
        NOW()
    );
-- Log the refund for transparency
RAISE NOTICE 'Refunded user % with $% for % shares of deleted business %',
holding_record.holder_id,
refund_amount,
holding_record.shares_owned,
NEW.business_name;
END LOOP;
-- Update the stock record to mark it as deleted
UPDATE business_stocks
SET is_active = false,
    updated_at = NOW()
WHERE id = stock_record.id;
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create the trigger on habit_businesses table
DROP TRIGGER IF EXISTS business_deletion_stock_refund_trigger ON habit_businesses;
CREATE TRIGGER business_deletion_stock_refund_trigger
AFTER
UPDATE ON habit_businesses FOR EACH ROW EXECUTE FUNCTION handle_business_deletion_stock_refunds();
-- Add the new transaction type to the constraint
ALTER TABLE stock_transactions DROP CONSTRAINT IF EXISTS stock_transactions_transaction_type_check;
ALTER TABLE stock_transactions
ADD CONSTRAINT stock_transactions_transaction_type_check CHECK (
        transaction_type IN (
            'purchase',
            'sale',
            'ipo',
            'business_deletion_refund'
        )
    );
-- Add is_active column to business_stocks if it doesn't exist
ALTER TABLE business_stocks
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- Test the trigger (uncomment to test)
-- UPDATE habit_businesses SET is_active = false WHERE id = 'test-business-id';