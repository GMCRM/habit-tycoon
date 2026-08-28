-- Backfill marketplace_base_value for businesses launched before the
-- 20260824230300 pricing update.
--
-- The previous two backfills (20260827010000 for earnings_per_completion,
-- 20260827020000 for cost) fixed cost/net-worth and pay, but missed a
-- business's *sell value*. getBaseSellValue() (habit-business.service.ts)
-- and every server-side sell-value computation (create_marketplace_listing,
-- queue_marketplace_listing, resolve_marketplace_purchase) all prefer
-- marketplace_base_value over cost*0.7 whenever it's set — it's stamped
-- once, at Marketplace purchase/resolve time, and never revisited
-- afterward, exactly like earnings_per_completion. So any business that
-- was ever bought (or received) via the Marketplace before the repricing
-- — e.g. an Oil Company purchased for $99,999,999.99, worth
-- floor($99,999,999.99 * 0.7) = $69,999,999 — is still stuck selling for
-- that amount today, even after the cost backfill, because
-- marketplace_base_value silently overrides cost*0.7 in every sell-value
-- calculation. A freshly bought/upgraded Oil Company now sells for
-- floor($10,000,000,000 * 0.7) = $7,000,000,000.
--
-- Same fix as 20260807000000_fix_marketplace_price_decay.sql used for the
-- resale-decay bug: marketplace_base_value should never be below
-- floor(business_types.base_cost * 0.7) for its type, so raise (never
-- lower) any row that's currently under that floor. This also covers any
-- listing_price the business had already frozen onto an active Marketplace
-- listing while unsold.

-- ─── Backfill: raise stale marketplace_base_value on existing businesses ───
UPDATE habit_businesses hb
SET marketplace_base_value = FLOOR(bt.base_cost * 0.7),
    updated_at = TIMEZONE('utc'::text, NOW())
FROM business_types bt
WHERE hb.business_type_id = bt.id
  AND hb.is_active = true
  AND hb.marketplace_base_value IS NOT NULL
  AND hb.marketplace_base_value < FLOOR(bt.base_cost * 0.7);

-- ─── Backfill: also fix already-frozen active listings still on the
-- Marketplace right now (not yet sold/expired) that are underpriced for the
-- same reason. Re-derive listing_price with the same capped streak-bonus
-- multiplier already frozen on the row. ───
UPDATE marketplace_listings ml
SET base_sell_value = FLOOR(bt.base_cost * 0.7),
    listing_price = ROUND(
        FLOOR(bt.base_cost * 0.7) * (1 + LEAST(GREATEST(ml.streak_at_listing, 0), 100) * 0.01),
        2
    )
FROM business_types bt
WHERE ml.business_type_id = bt.id
  AND ml.status = 'active'
  AND ml.expires_at > NOW()
  AND ml.base_sell_value < FLOOR(bt.base_cost * 0.7);

NOTIFY pgrst, 'reload schema';
