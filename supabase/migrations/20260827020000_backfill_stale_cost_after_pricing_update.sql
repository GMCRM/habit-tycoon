-- Backfill habit_businesses.cost for businesses launched before the
-- 20260824230300 pricing update.
--
-- The 20260827010000 migration already fixed earnings_per_completion for
-- this same class of row but only mentioned that cost/base_cost "is always
-- kept in sync ... on every purchase/upgrade/merge path" (true going
-- forward) — it never actually backfilled cost on existing rows. cost is
-- set once at purchase/upgrade/marketplace-resolve time and then never
-- revisited, and it directly drives net worth via
-- recalculate_net_worth()'s `COALESCE(hb.cost, bt.base_cost, 0) * 0.7` sum
-- (see 20260721075144_fix_net_worth_calculation.sql) and the business's own
-- sell value. So any tier-1 Movie Studio/Bank/Oil Company or tier-2 Habit
-- Tycoon business bought before the repricing is still valued in net worth
-- at its old, now heavily understated, price — e.g. a pre-repricing Oil
-- Company (bought for $99,999,999.99) only contributes ~$70M to net worth
-- today even though the same business type now costs $10,000,000,000 and a
-- freshly bought one would contribute ~$7B.
--
-- Same conservative approach as the earnings backfill: only touch rows
-- whose current cost exactly matches the known pre-repricing base_cost for
-- their business type (within a cent), so a business that already went
-- through a post-repricing upgrade or Marketplace resolve (which stamp
-- cost = current base_cost) is left untouched.

DO $$
DECLARE
    affected_count INTEGER;
    v_user_ids UUID[];
    v_user_id UUID;
BEGIN
    WITH stale AS (
        SELECT
            hb.id,
            hb.user_id,
            bt.base_cost AS new_cost,
            CASE
                WHEN bt.tier = 1 AND bt.name = 'Movie Studio' THEN 50000000.00
                WHEN bt.tier = 1 AND bt.name = 'Bank' THEN 75000000.00
                WHEN bt.tier = 1 AND bt.name = 'Oil Company' THEN 99999999.99
                WHEN bt.tier = 2 THEN bt.base_cost / 100
            END AS old_cost
        FROM habit_businesses hb
        JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE (bt.tier = 1 AND bt.name IN ('Movie Studio', 'Bank', 'Oil Company'))
           OR bt.tier = 2
    ),
    updated AS (
        UPDATE habit_businesses hb
        SET cost = stale.new_cost,
            updated_at = TIMEZONE('utc'::text, NOW())
        FROM stale
        WHERE hb.id = stale.id
          AND ABS(hb.cost - stale.old_cost) < 0.01
        RETURNING hb.id, hb.user_id
    )
    SELECT COUNT(*), ARRAY_AGG(DISTINCT user_id) INTO affected_count, v_user_ids FROM updated;

    RAISE NOTICE 'Backfilled cost on % stale habit_businesses row(s)', affected_count;

    IF v_user_ids IS NOT NULL THEN
        FOREACH v_user_id IN ARRAY v_user_ids LOOP
            PERFORM recalculate_net_worth(v_user_id);
        END LOOP;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
