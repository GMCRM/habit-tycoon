-- Reprice the top of the tier-1 ladder (Movie Studio, Bank, Oil Company)
-- to round numbers, and cascade the change through the entire Habit Tycoon
-- (tier 2) ladder, which is defined as 100x-per-step starting from Oil
-- Company's new price.
--
-- Tier 1 (base_pay stays 10% of base_cost, matching every other row):
--   Movie Studio:  50,000,000        -> 100,000,000
--   Bank:          75,000,000        -> 1,000,000,000
--   Oil Company:   99,999,999.99     -> 10,000,000,000
--
-- Tier 2 (Habit Tycoon): every row is exactly 100x the tier-1 ladder's
-- corresponding row's *old* relationship — in practice this is the same as
-- multiplying every existing tier-2 base_cost/base_pay by 100, since the
-- tier-2 ladder was already "10x-per-step, starting at 100x tier-1 Oil
-- Company's old price".

-- ─── Tier 1 ───

UPDATE business_types
SET base_cost = 100000000, base_pay = 10000000
WHERE tier = 1 AND name = 'Movie Studio';

UPDATE business_types
SET base_cost = 1000000000, base_pay = 100000000
WHERE tier = 1 AND name = 'Bank';

UPDATE business_types
SET base_cost = 10000000000, base_pay = 1000000000
WHERE tier = 1 AND name = 'Oil Company';

-- ─── Tier 2 (Habit Tycoon) ───

UPDATE business_types
SET base_cost = base_cost * 100, base_pay = base_pay * 100
WHERE tier = 2;

NOTIFY pgrst, 'reload schema';
