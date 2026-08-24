-- Habit Tycoon (part 2/4): the "Habit Tycoon" business tier itself.
--
-- A second, much more expensive lap through the same 10 business types
-- (same name/icon, reused — the client renders a green "HABIT TYCOON" banner
-- across the icon to distinguish them, see the companion client changes).
-- Tycoon Lemonade Stand starts at $10,000,000,000; each subsequent business
-- is 100x the previous one's cost, same as the "each is 10x the last"
-- convention business_types_seed.sql used for tier 1 — just a steeper
-- multiplier, reflecting how much further past the original ladder this
-- tier reaches. base_pay stays at exactly 10% of base_cost, matching every
-- existing row in the table.
--
-- Tier 2 is otherwise a plain business_types row — no separate table, no
-- special-cased stock/marketplace/joint-venture handling needed, since
-- business_stocks/marketplace_listings/joint_venture_* all key off a
-- specific *habit_businesses* row (one per owned instance), not off
-- business_types directly. The gating (only offered once a habit has earned
-- all 6 of its milestone achievements) is added in the next migration.

ALTER TABLE business_types ADD COLUMN IF NOT EXISTS tier INTEGER NOT NULL DEFAULT 1;

-- Tycoon businesses reuse tier-1 names, so the old "name must be globally
-- unique" constraint has to relax to "unique within a tier" instead.
ALTER TABLE business_types DROP CONSTRAINT IF EXISTS business_types_name_key;
ALTER TABLE business_types ADD CONSTRAINT business_types_name_tier_key UNIQUE (name, tier);

INSERT INTO business_types (name, icon, base_cost, base_pay, description, tier)
VALUES
    ('Lemonade Stand', '🍋', 10000000000, 1000000000, 'A lemonade empire, Tycoon status. The one that started it all — at a scale nobody could have imagined.', 2),
    ('Newspaper Route', '📰', 1000000000000, 100000000000, 'A media conglomerate, Tycoon status. Every paper in every driveway, worldwide.', 2),
    ('Car Wash', '🚗', 100000000000000, 10000000000000, 'A car care empire, Tycoon status. Every car on every road, gleaming.', 2),
    ('Pizza Delivery', '🍕', 10000000000000000, 1000000000000000, 'A delivery empire, Tycoon status. A slice reaches every corner of the globe.', 2),
    ('Donut Shop', '🍩', 1000000000000000000, 100000000000000000, 'A pastry empire, Tycoon status. Fresh donuts, everywhere, always.', 2),
    ('Shrimp Boat', '🦐', 100000000000000000000, 10000000000000000000, 'A seafood empire, Tycoon status. The entire ocean, practically your business.', 2),
    ('Hockey Team', '🏒', 10000000000000000000000, 1000000000000000000000, 'A sports league empire, Tycoon status. Every rink, every trophy.', 2),
    ('Movie Studio', '🎬', 1000000000000000000000000, 100000000000000000000000, 'A media empire, Tycoon status. Every screen, every premiere.', 2),
    ('Bank', '🏦', 100000000000000000000000000, 10000000000000000000000000, 'A financial empire, Tycoon status. The economy itself starts to look like a subsidiary.', 2),
    ('Oil Company', '🛢️', 10000000000000000000000000000, 1000000000000000000000000000, 'A global energy empire, Tycoon status. As big as this game gets.', 2)
ON CONFLICT (name, tier) DO UPDATE
SET icon = EXCLUDED.icon,
    base_cost = EXCLUDED.base_cost,
    base_pay = EXCLUDED.base_pay,
    description = EXCLUDED.description;

NOTIFY pgrst, 'reload schema';
