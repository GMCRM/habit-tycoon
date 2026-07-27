-- Backfill: 20260727000000 fixed resolve_marketplace_purchase() to apply the
-- streak bonus to the buyer's earnings_per_completion going forward, but only
-- backfilled streak_at_purchase for purchases that were still unresolved at
-- the time. Any purchase that had already been merged/resolved into a
-- habit_businesses row before that fix shipped is still sitting on the old,
-- unboosted earnings_per_completion — the buyer paid the streak-bonus premium
-- in the price but never got it in their base pay. Fix both up now.

-- Recover streak_at_purchase for already-resolved purchases too (the prior
-- backfill only covered resolved = false). marketplace_listings rows are
-- never deleted, only flipped to 'sold', so streak_at_listing is still there
-- to recover from.
UPDATE marketplace_purchases mp
SET streak_at_purchase = ml.streak_at_listing
FROM marketplace_listings ml
WHERE ml.id = mp.listing_id
  AND mp.resolved = true
  AND mp.streak_at_purchase = 0
  AND ml.streak_at_listing <> 0;

-- Recompute the correct boosted earnings for every resolved purchase (same
-- capped formula as resolve_marketplace_purchase()) and push it onto the
-- buyer's business, but only where earnings_per_completion still matches the
-- raw, unboosted value from the purchase — i.e. it was never actually
-- boosted. This makes the backfill idempotent and leaves alone any business
-- whose earnings already reflect the bonus (or were already migrated).
UPDATE habit_businesses hb
SET earnings_per_completion = ROUND(
        mp.earnings_per_completion
            * (1 + LEAST(GREATEST(mp.streak_at_purchase, 0), 100) * 0.01),
        2
    ),
    updated_at = NOW()
FROM marketplace_purchases mp
WHERE mp.resolved_habit_business_id = hb.id
  AND mp.resolved = true
  AND hb.earnings_per_completion = mp.earnings_per_completion
  AND mp.streak_at_purchase > 0;
