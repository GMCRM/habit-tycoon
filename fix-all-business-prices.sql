-- Fix all business stock prices by correcting earnings_per_completion and stock prices
-- This script will:
-- 1. Fix earnings_per_completion for businesses with incorrect values
-- 2. Update stock prices to be reasonable based on business type
-- First, let's see what we're dealing with
SELECT hb.business_name,
    hb.business_icon,
    bt.name as business_type,
    bt.base_cost,
    bt.base_pay,
    hb.goal_value,
    hb.earnings_per_completion,
    bs.current_stock_price,
    CASE
        WHEN hb.goal_value > 0 THEN bt.base_pay / hb.goal_value
        ELSE bt.base_pay
    END as calculated_earnings,
    -- Stock price should be reasonable - using base_cost * 0.1 as baseline
    (bt.base_cost * 0.1) as suggested_stock_price
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN business_stocks bs ON bs.habit_business_id = hb.id
WHERE bs.current_stock_price IS NOT NULL
ORDER BY bt.base_cost;
-- Now fix the earnings_per_completion for businesses where it's unreasonable
-- Rule: earnings_per_completion should never exceed base_pay, and should be reasonable
UPDATE habit_businesses
SET earnings_per_completion = CASE
        -- If earnings is way too high (> base_pay), cap it at base_pay
        WHEN earnings_per_completion > (
            SELECT base_pay
            FROM business_types bt
            WHERE bt.id = habit_businesses.business_type_id
        ) THEN (
            SELECT base_pay
            FROM business_types bt
            WHERE bt.id = habit_businesses.business_type_id
        ) -- If earnings is unreasonably small (< 0.01), set to reasonable minimum
        WHEN earnings_per_completion < 0.01 THEN GREATEST(
            0.01,
            (
                SELECT base_pay / 100 -- 1% of base_pay as minimum
                FROM business_types bt
                WHERE bt.id = habit_businesses.business_type_id
            )
        )
        ELSE earnings_per_completion
    END;
-- Update stock prices to be more reasonable
-- Base stock price = base_cost * 0.1 (10% of business cost)
-- Then apply the existing streak multiplier
UPDATE business_stocks
SET current_stock_price = ROUND(
        (bt.base_cost * 0.1) * COALESCE(price_multiplier, 1.0),
        2
    ),
    last_price_update = NOW()
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE business_stocks.habit_business_id = hb.id;
-- Verify the results
SELECT hb.business_name,
    hb.business_icon,
    bt.name as business_type,
    bt.base_cost,
    bt.base_pay,
    hb.earnings_per_completion,
    bs.current_stock_price,
    bs.price_multiplier
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN business_stocks bs ON bs.habit_business_id = hb.id
WHERE bs.current_stock_price IS NOT NULL
ORDER BY bt.base_cost;