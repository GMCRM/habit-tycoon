-- Quick fix for lemonade stock showing $100 instead of $1
-- This directly updates the current_stock_price in business_stocks table
-- Update all lemonade stand stocks to have correct price
UPDATE business_stocks
SET current_stock_price = 1.00,
    price_multiplier = 1.0,
    last_price_update = NOW()
WHERE habit_business_id IN (
        SELECT hb.id
        FROM habit_businesses hb
            JOIN business_types bt ON hb.business_type_id = bt.id
        WHERE bt.name = 'Lemonade Stand'
            OR bt.icon = '🍋'
            OR hb.business_icon = '🍋'
            OR hb.earnings_per_completion = 1.00
    );
-- Verify the update
SELECT hb.business_name,
    hb.business_icon,
    hb.earnings_per_completion,
    bs.current_stock_price,
    bt.name as business_type_name
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN business_stocks bs ON bs.habit_business_id = hb.id
WHERE bt.name = 'Lemonade Stand'
    OR bt.icon = '🍋'
    OR hb.business_icon = '🍋'
    OR hb.earnings_per_completion = 1.00;