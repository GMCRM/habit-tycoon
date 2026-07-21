-- Fix: "column reference \"current_stock_price\" is ambiguous" when selling shares
--
-- ROOT CAUSE: sell_stock_shares() declared a local variable named
-- current_stock_price, which collides with the business_stocks.current_stock_price
-- column. The line `SELECT current_stock_price INTO current_stock_price FROM
-- business_stocks ...` can't tell which one is meant, so Postgres rejects it.
--
-- FIX: rename the local variable to v_current_stock_price throughout the function.
--
-- Run this in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION sell_stock_shares(
        seller_id UUID,
        stock_uuid UUID,
        shares_to_sell INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_current_stock_price NUMERIC;
holding_record RECORD;
total_sale_value NUMERIC;
capital_gains NUMERIC;
transaction_fee NUMERIC := 0.02;
-- 2% transaction fee
net_proceeds NUMERIC;
BEGIN -- Get current stock price
SELECT current_stock_price INTO v_current_stock_price
FROM business_stocks
WHERE id = stock_uuid;
IF v_current_stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
-- Get user's holding
SELECT * INTO holding_record
FROM stock_holdings
WHERE holder_id = seller_id
    AND stock_id = stock_uuid;
IF holding_record IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'No holdings found');
END IF;
-- Check if user has enough shares to sell
IF holding_record.shares_owned < shares_to_sell THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Insufficient shares to sell'
);
END IF;
-- Calculate sale proceeds
total_sale_value := v_current_stock_price * shares_to_sell;
transaction_fee := total_sale_value * 0.02;
-- 2% fee
net_proceeds := total_sale_value - transaction_fee;
-- Calculate capital gains/loss
capital_gains := (
    v_current_stock_price - holding_record.average_purchase_price
) * shares_to_sell;
-- Update or remove holding
IF holding_record.shares_owned = shares_to_sell THEN -- Selling all shares - remove holding
DELETE FROM stock_holdings
WHERE id = holding_record.id;
ELSE -- Partial sale - update holding
UPDATE stock_holdings
SET shares_owned = shares_owned - shares_to_sell,
    total_invested = total_invested - (
        holding_record.average_purchase_price * shares_to_sell
    ),
    updated_at = NOW()
WHERE id = holding_record.id;
END IF;
-- Update stock availability (shares go back to available pool)
UPDATE business_stocks
SET shares_available = shares_available + shares_to_sell,
    updated_at = NOW()
WHERE id = stock_uuid;
-- Record the transaction
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        NULL,
        -- No specific buyer (back to market)
        seller_id,
        shares_to_sell,
        v_current_stock_price,
        total_sale_value,
        'sale'
    );
-- Add proceeds to seller's cash and update net worth
UPDATE user_profiles
SET cash = cash + net_proceeds,
    net_worth = COALESCE(net_worth, 0) + net_proceeds,
    updated_at = NOW()
WHERE id = seller_id;
RETURN jsonb_build_object(
    'success',
    true,
    'shares_sold',
    shares_to_sell,
    'sale_price_per_share',
    v_current_stock_price,
    'total_sale_value',
    total_sale_value,
    'transaction_fee',
    transaction_fee,
    'net_proceeds',
    net_proceeds,
    'capital_gains',
    capital_gains
);
END;
$$;

GRANT EXECUTE ON FUNCTION sell_stock_shares(UUID, UUID, INTEGER) TO authenticated;
