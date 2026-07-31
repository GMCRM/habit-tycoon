-- Backfill marketplace_bonus_percent (added in 20260731000000_marketplace_bonus_badge.sql)
-- for businesses that were already bought/merged from the Marketplace before that
-- migration existed. Without this, only future purchases would show the "+X%"
-- badge on the Home Screen card — anyone who bought before today would be missing
-- it despite the bonus already being baked into their earnings_per_completion.
--
-- For each habit_business that a resolved marketplace_purchases row points to
-- (its most recent one, if it changed hands more than once), reapply the same
-- capped streak-bonus formula resolve_marketplace_purchase() uses.
--
-- Skipped when a normal (non-Marketplace) upgrade happened on that same row
-- after the purchase — upgradeHabitBusiness() always creates a
-- marketplace_listings row (reason='upgrade') referencing the same
-- habit_business_id before overwriting its earnings, so a later one of those
-- is reliable evidence the purchase's bonus is no longer what's baked into the
-- current earnings_per_completion.

WITH latest_purchase AS (
    SELECT DISTINCT ON (resolved_habit_business_id)
        resolved_habit_business_id AS habit_business_id,
        streak_at_purchase,
        created_at
    FROM marketplace_purchases
    WHERE resolved = true
      AND resolved_habit_business_id IS NOT NULL
    ORDER BY resolved_habit_business_id, created_at DESC
)
UPDATE habit_businesses hb
SET marketplace_bonus_percent = NULLIF(LEAST(GREATEST(lp.streak_at_purchase, 0), 100), 0)
FROM latest_purchase lp
WHERE hb.id = lp.habit_business_id
  AND hb.marketplace_bonus_percent IS NULL
  AND hb.is_active = true
  AND NOT EXISTS (
      SELECT 1 FROM marketplace_listings ml
      WHERE ml.habit_business_id = hb.id
        AND ml.reason = 'upgrade'
        AND ml.created_at > lp.created_at
  );
