-- Fix lemonade stock prices to match actual business earnings
-- This updates stock prices for all Lemonade Stand businesses
-- First, let's see what we have
SELECT hb.business_name,
    hb.earnings_per_completion,
    bs.current_stock_price,
    bt.name as business_type_name,
    bt.base_pay
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN business_stocks bs ON bs.habit_business_id = hb.id
WHERE bt.name = 'Lemonade Stand'
    OR hb.business_icon = '🍋'
    OR hb.earnings_per_completion = 1.00;
-- Update all stock prices to match earnings_per_completion 
-- This calls the existing SQL function to recalculate prices properly
DO $$
DECLARE habit_record RECORD;
BEGIN FOR habit_record IN
SELECT hb.id as habit_id
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE bt.name = 'Lemonade Stand'
    OR hb.business_icon = '🍋'
    AND hb.is_active = true LOOP -- Call the existing function to update stock price
    PERFORM update_stock_price_by_streak(habit_record.habit_id);
RAISE NOTICE 'Updated stock price for habit business: %',
habit_record.habit_id;
END LOOP;
END $$;
-- Verify the changes
SELECT hb.business_name,
    hb.earnings_per_completion,
    bs.current_stock_price,
    bt.name as business_type_name,
    bt.base_pay
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN business_stocks bs ON bs.habit_business_id = hb.id
WHERE bt.name = 'Lemonade Stand'
    OR hb.business_icon = '🍋'
    OR hb.earnings_per_completion = 1.00;