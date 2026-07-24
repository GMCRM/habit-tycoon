-- Updated stock price calculation function that uses business type base_cost
-- instead of just earnings_per_completion for more reasonable pricing
DROP FUNCTION IF EXISTS update_stock_price_by_streak(UUID);
CREATE OR REPLACE FUNCTION update_stock_price_by_streak(habit_business_uuid UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE current_streak INTEGER;
business_base_cost NUMERIC;
base_price NUMERIC;
streak_multiplier NUMERIC;
new_price NUMERIC;
stock_uuid UUID;
BEGIN -- Get current streak and business type base cost
SELECT hb.streak,
    bt.base_cost INTO current_streak,
    business_base_cost
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE hb.id = habit_business_uuid;
IF current_streak IS NULL THEN RAISE EXCEPTION 'Habit business not found';
END IF;
-- Get stock ID
SELECT id INTO stock_uuid
FROM business_stocks
WHERE habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN 0;
-- No stock exists
END IF;
-- Calculate base price as 10% of business base cost
-- This ensures reasonable pricing: Lemonade Stand = $1, Newspaper = $10, etc.
base_price := COALESCE(business_base_cost * 0.1, 1);
-- Calculate streak multiplier: 
-- Streak 0-1: 1.0x (base price)
-- Streak 2-7: 1.0x to 1.5x (gradual increase)
-- Streak 8-14: 1.5x to 2.0x 
-- Streak 15-30: 2.0x to 3.0x
-- Streak 31+: 3.0x to 5.0x (capped)
IF current_streak <= 1 THEN streak_multiplier := 1.0;
ELSIF current_streak <= 7 THEN streak_multiplier := 1.0 + (current_streak - 1) * 0.083;
-- +8.3% per day up to 50%
ELSIF current_streak <= 14 THEN streak_multiplier := 1.5 + (current_streak - 7) * 0.071;
-- +7.1% per day up to 100%
ELSIF current_streak <= 30 THEN streak_multiplier := 2.0 + (current_streak - 14) * 0.0625;
-- +6.25% per day up to 200%
ELSE streak_multiplier := 3.0 + LEAST((current_streak - 30) * 0.05, 2.0);
-- +5% per day, capped at 5x total
END IF;
-- Calculate new price
new_price := ROUND(base_price * streak_multiplier, 2);
-- Update stock price
UPDATE business_stocks
SET current_stock_price = new_price,
    price_multiplier = streak_multiplier,
    last_price_update = NOW()
WHERE id = stock_uuid;
RETURN new_price;
END;
$$;
GRANT EXECUTE ON FUNCTION update_stock_price_by_streak(UUID) TO authenticated;
COMMENT ON FUNCTION update_stock_price_by_streak(UUID) IS 'Update stock price based on business type base cost and current streak. Base price = base_cost * 0.1';