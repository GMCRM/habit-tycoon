-- Fix ramp-cap compounding bug, then add an hourly job to keep every
-- stock's price synced toward its target - not just ones with a
-- completion event that hour.
--
-- BUG: update_stock_price_by_streak() reset last_price_update to NOW()
-- on every call, even when nothing changed, and the +50%/day upward-
-- movement cap measured elapsed time from that timestamp against the
-- *current* (already-partially-grown) stored price. Calling the
-- function more often than once per real ramp step compounds past the
-- intended rate: 24 hourly calls each granting (1 + 0.5*1/24) compound
-- to ~1.64x/day instead of the intended 1.5x/day, and the gap widens
-- over multiple days. That made the anti-pump-and-dump cap leaky in
-- proportion to how often the function was called - the opposite of
-- what you'd want from a job that calls it more often.
--
-- FIX: track a stable ramp anchor (ramp_start_price, ramp_start_at)
-- that only moves when a *new* target is actually set (streak/tier
-- change), not on every call. The cap then always measures real
-- elapsed time and growth from that fixed anchor, so calling the
-- function any number of times in a row gives the same answer as
-- calling it once - safe to run as often as desired.
--
-- This unblocks scheduling update_stock_price_by_streak() hourly for
-- every stock via pg_cron, so two stocks at the same business type and
-- streak stay caught up with each other instead of drifting apart just
-- because one happened to get a completion event more recently.

ALTER TABLE business_stocks ADD COLUMN IF NOT EXISTS ramp_start_price DECIMAL(10, 2);
ALTER TABLE business_stocks ADD COLUMN IF NOT EXISTS ramp_start_at TIMESTAMPTZ;

-- Backfill: anchor existing stocks at their current price/last update, so
-- nobody gets a free instant jump to target price the first time this runs.
UPDATE business_stocks
SET ramp_start_price = COALESCE(ramp_start_price, current_stock_price),
    ramp_start_at = COALESCE(ramp_start_at, last_price_update, NOW())
WHERE ramp_start_price IS NULL
    OR ramp_start_at IS NULL;

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
prev_multiplier NUMERIC;
anchor_price NUMERIC;
anchor_at TIMESTAMPTZ;
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
    price_multiplier,
    ramp_start_price,
    ramp_start_at INTO stock_uuid,
    prev_price,
    prev_multiplier,
    anchor_price,
    anchor_at
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

-- A new target was set (streak/tier changed since the price was last
-- calculated) - re-anchor the ramp to the price/time this new target
-- started from. This anchor deliberately does NOT move on repeat calls
-- while the multiplier is unchanged, so calling this function 1x/day or
-- 100x/day produces the same capped price.
IF prev_multiplier IS NULL OR streak_multiplier IS DISTINCT FROM prev_multiplier THEN
    anchor_price := COALESCE(prev_price, target_price);
    anchor_at := NOW();
END IF;

-- Cap upward movement at +50%/day of real elapsed time since the ramp
-- toward the current target began, so a business that just jumped tiers
-- (or streak) can't have its attached stock cashed out at the new
-- valuation instantly - it has to ramp up over real time. Drops apply
-- immediately.
IF target_price > COALESCE(prev_price, target_price) THEN
    elapsed_hours := GREATEST(EXTRACT(EPOCH FROM (NOW() - COALESCE(anchor_at, NOW() - INTERVAL '999 hours'))) / 3600.0, 0);
    max_price := COALESCE(anchor_price, target_price) * (1 + 0.5 * elapsed_hours / 24.0);
    new_price := LEAST(target_price, max_price);
ELSE
    new_price := target_price;
    -- Fully caught up (or dropped) - collapse the anchor to here, so the
    -- next increase ramps from this point rather than a stale one.
    anchor_price := new_price;
    anchor_at := NOW();
END IF;

UPDATE business_stocks
SET current_stock_price = new_price,
    price_multiplier = streak_multiplier,
    ramp_start_price = anchor_price,
    ramp_start_at = anchor_at,
    last_price_update = NOW()
WHERE id = stock_uuid;
RETURN new_price;
END;
$$;
GRANT EXECUTE ON FUNCTION update_stock_price_by_streak(UUID) TO authenticated;
COMMENT ON FUNCTION update_stock_price_by_streak(UUID) IS 'Update stock price based on business type base cost and current streak: base_price * (1 + streak * 0.01), uncapped, resetting to base_price at streak 0. Upward movement is capped to +50%/day of real elapsed time since the ramp toward the current target began (ramp_start_price/ramp_start_at) - not since this function last happened to run - so it is safe to call any number of times without loosening the cap.';

-- ─── Hourly sync: re-run the price calc for every active business's
-- stock, not just ones with a completion event, so identical
-- business-type+streak stocks stay caught up with each other. ───

CREATE OR REPLACE FUNCTION sync_all_stock_prices() RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_biz RECORD;
v_count INTEGER := 0;
BEGIN
FOR v_biz IN
    SELECT hb.id
    FROM habit_businesses hb
        INNER JOIN business_stocks bs ON bs.habit_business_id = hb.id
    WHERE hb.is_active = true
LOOP
    PERFORM update_stock_price_by_streak(v_biz.id);
    v_count := v_count + 1;
END LOOP;
RETURN v_count;
END;
$$;
COMMENT ON FUNCTION sync_all_stock_prices() IS 'Re-runs update_stock_price_by_streak() for every active business''s stock. Scheduled hourly via pg_cron so stocks stay in sync without waiting on a completion event; safe to call any number of times thanks to the ramp-anchor fix above.';

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-stock-prices-hourly') THEN
        PERFORM cron.unschedule('sync-stock-prices-hourly');
    END IF;
END $$;

SELECT cron.schedule('sync-stock-prices-hourly', '0 * * * *', $$SELECT public.sync_all_stock_prices();$$);

NOTIFY pgrst, 'reload schema';
