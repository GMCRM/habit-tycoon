-- Simplify the streak -> stock price curve.
--
-- Previously update_stock_price_by_streak() used a four-tier piecewise
-- curve (roughly +8.3%/day up to day 7, +7.1%/day up to day 14, +6.25%/day
-- up to day 30, then +5%/day capped at 5x total). Replace it with a flat,
-- uncapped rule: every streak day adds a flat 1% to the base price, with
-- no ceiling. Streak 0 (broken/reset) still maps to exactly the base price
-- (10% of business_type.base_cost), same as before.
--
-- The +50%/day-of-real-elapsed-time ramp cap on upward price movement
-- (added in 20260724020000_prevent_stock_pump_and_dump.sql) is unrelated
-- to this curve and is left in place - it still stops a streak/tier jump
-- from being cashed out at the new price instantly.

DROP FUNCTION IF EXISTS update_stock_price_by_streak(UUID);
CREATE OR REPLACE FUNCTION update_stock_price_by_streak(habit_business_uuid UUID) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_streak INTEGER;
business_base_cost NUMERIC;
base_price NUMERIC;
streak_multiplier NUMERIC;
target_price NUMERIC;
new_price NUMERIC;
stock_uuid UUID;
prev_price NUMERIC;
prev_update TIMESTAMPTZ;
elapsed_hours NUMERIC;
max_price NUMERIC;
BEGIN
SELECT hb.streak,
    bt.base_cost INTO current_streak,
    business_base_cost
FROM habit_businesses hb
    JOIN business_types bt ON hb.business_type_id = bt.id
WHERE hb.id = habit_business_uuid;
IF current_streak IS NULL THEN RAISE EXCEPTION 'Habit business not found';
END IF;

SELECT id,
    current_stock_price,
    last_price_update INTO stock_uuid,
    prev_price,
    prev_update
FROM business_stocks
WHERE habit_business_id = habit_business_uuid;
IF stock_uuid IS NULL THEN RETURN 0;
END IF;

-- Calculate base price as 10% of business base cost
base_price := COALESCE(business_base_cost * 0.1, 1);

-- Streak multiplier: flat +1% per streak day, uncapped. Streak 0 -> 1.0x
-- (exactly base price).
streak_multiplier := 1.0 + current_streak * 0.01;

target_price := ROUND(base_price * streak_multiplier, 2);

-- Cap upward movement at +50%/day of real elapsed time since the last
-- price update, so a business that just jumped tiers (or streak) can't
-- have its attached stock cashed out at the new valuation instantly -
-- it has to ramp up over real time. Drops apply immediately.
IF target_price > COALESCE(prev_price, target_price) THEN
    elapsed_hours := GREATEST(EXTRACT(EPOCH FROM (now() - COALESCE(prev_update, now() - INTERVAL '999 hours'))) / 3600.0, 0);
    max_price := prev_price * (1 + 0.5 * elapsed_hours / 24.0);
    new_price := LEAST(target_price, max_price);
ELSE
    new_price := target_price;
END IF;

UPDATE business_stocks
SET current_stock_price = new_price,
    price_multiplier = streak_multiplier,
    last_price_update = NOW()
WHERE id = stock_uuid;
RETURN new_price;
END;
$$;
GRANT EXECUTE ON FUNCTION update_stock_price_by_streak(UUID) TO authenticated;
COMMENT ON FUNCTION update_stock_price_by_streak(UUID) IS 'Update stock price based on business type base cost and current streak: base_price * (1 + streak * 0.01), uncapped, resetting to base_price at streak 0. Upward movement is still capped to +50%/day of real elapsed time to prevent instant pump-and-dump after a tier upgrade or streak jump.';

NOTIFY pgrst, 'reload schema';
