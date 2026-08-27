-- Backfill earnings_per_completion for businesses launched before the
-- 20260824230300 pricing update.
--
-- earnings_per_completion is computed once at launch time from
-- business_types.base_pay (habit-business.service.ts calculateReasonableEarnings)
-- and stored permanently on habit_businesses — it is never recalculated
-- afterward. The 20260824230300 migration repriced tier-1 Movie
-- Studio/Bank/Oil Company and cascaded a uniform x100 through every tier-2
-- ("Habit Tycoon") business, but only touched the business_types catalog.
-- Any habit_businesses row for one of those types created before that
-- migration ran is stuck showing its old, now-understated, base pay —
-- visibly out of step with the 10%-of-cost ratio shown on the create-habit
-- page for the same business type today.
--
-- calculateReasonableEarnings(basePay, goalValue) is linear/homogeneous in
-- basePay: for a fixed goal_value it is always `basePay * f(goal_value)`
-- for some clamp factor f in [0.01, 1]. That means a row's *current*
-- earnings_per_completion, if it still reflects the pre-repricing base_pay,
-- must equal calculateReasonableEarnings(old_base_pay, goal_value) exactly
-- (within cent rounding). We only touch rows that match that check, and
-- reset them to calculateReasonableEarnings(current_base_pay, goal_value) —
-- the value a business of that type launched today would get. Rows that
-- don't match (already repriced, or adjusted afterward for a Joint Venture
-- split or a Marketplace streak-bonus purchase) are left untouched.

DO $$
DECLARE
    affected_count INTEGER;
BEGIN
    WITH stale AS (
        SELECT
            hb.id,
            bt.base_pay AS new_base_pay,
            CASE
                WHEN bt.tier = 1 AND bt.name = 'Movie Studio' THEN 5000000.00
                WHEN bt.tier = 1 AND bt.name = 'Bank' THEN 7500000.00
                WHEN bt.tier = 1 AND bt.name = 'Oil Company' THEN 9999999.99
                WHEN bt.tier = 2 THEN bt.base_pay / 100
            END AS old_base_pay,
            hb.goal_value,
            hb.earnings_per_completion AS current_value
        FROM habit_businesses hb
        JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE (bt.tier = 1 AND bt.name IN ('Movie Studio', 'Bank', 'Oil Company'))
           OR bt.tier = 2
    ),
    expected AS (
        SELECT
            id,
            new_base_pay,
            current_value,
            CASE
                WHEN goal_value IS NULL OR goal_value <= 0 THEN old_base_pay
                ELSE LEAST(
                    old_base_pay,
                    GREATEST(GREATEST(0.01, old_base_pay * 0.01), old_base_pay / goal_value)
                )
            END AS expected_old_value,
            CASE
                WHEN goal_value IS NULL OR goal_value <= 0 THEN new_base_pay
                ELSE LEAST(
                    new_base_pay,
                    GREATEST(GREATEST(0.01, new_base_pay * 0.01), new_base_pay / goal_value)
                )
            END AS expected_new_value
        FROM stale
    ),
    updated AS (
        UPDATE habit_businesses hb
        SET earnings_per_completion = ROUND(expected.expected_new_value, 2),
            updated_at = TIMEZONE('utc'::text, NOW())
        FROM expected
        WHERE hb.id = expected.id
          AND ABS(expected.current_value - expected.expected_old_value) < 0.01
        RETURNING hb.id
    )
    SELECT COUNT(*) INTO affected_count FROM updated;

    RAISE NOTICE 'Backfilled earnings_per_completion on % stale habit_businesses row(s)', affected_count;
END $$;

NOTIFY pgrst, 'reload schema';
