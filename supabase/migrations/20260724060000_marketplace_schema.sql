-- Business Marketplace: schema
--
-- When a business is upgraded or its habit is deleted, the old business no
-- longer just disappears — it gets listed on the Marketplace for 24 hours so
-- a friend can buy it. Two new tables:
--
--   marketplace_listings  — a snapshot of the old business plus a frozen
--     listing price (base sell value x streak bonus, capped at +100%).
--     Snapshotted rather than FK'd to habit_businesses because the "upgrade"
--     path (upgradeHabitBusiness in habit-business.service.ts) mutates the
--     habit_businesses row in place — nothing else preserves the pre-upgrade
--     business once that update runs.
--
--   marketplace_purchases — bridges the moment money changes hands (atomic,
--     via purchase_marketplace_listing) from the moment the buyer picks a
--     target business or a brand-new habit (resolve_marketplace_purchase).
--     Splitting these means a buyer who closes the app mid-flow hasn't lost
--     anything — the purchase already happened, they just still owe
--     themselves a "which business" decision.
--
-- habit_businesses.marketplace_base_value: when a business changes hands via
-- the Marketplace, its future sell/listing value must be based on 70% of the
-- purchase price, not 70% of the business_type's base_cost (the normal
-- formula used by deleteHabitBusiness()). NULL means "never marketplace
-- sourced — use the normal cost*0.7 formula".

ALTER TABLE habit_businesses
    ADD COLUMN IF NOT EXISTS marketplace_base_value NUMERIC(12, 2) NULL;

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- The source row. For 'upgrade' listings this row survives (mutated in place
    -- by upgradeHabitBusiness) under a new business; for 'habit_deletion' listings
    -- it survives soft-deleted (is_active=false). Kept so a settled 'habit_deletion'
    -- sale can be logged to business_sales (the Weekly Receipt ledger) at the moment
    -- payout actually happens, not at listing time.
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,

    -- Snapshot of the business being sold, taken at listing time
    business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    business_name TEXT NOT NULL,
    business_icon TEXT NOT NULL,
    base_cost NUMERIC(12, 2) NOT NULL, -- business_types.base_cost at listing time; used as the "level" for buyer merge eligibility
    earnings_per_completion NUMERIC(12, 2) NOT NULL, -- the improved earning value that transfers to the buyer

    base_sell_value NUMERIC(12, 2) NOT NULL, -- pre-streak-bonus value (marketplace_base_value or floor(cost*0.7))
    streak_at_listing INTEGER NOT NULL DEFAULT 0,
    listing_price NUMERIC(12, 2) NOT NULL, -- frozen: base_sell_value * (1 + LEAST(streak,100)*0.01)

    reason TEXT NOT NULL CHECK (reason IN ('upgrade', 'habit_deletion')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),

    buyer_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    sold_at TIMESTAMP WITH TIME ZONE NULL,
    payout_settled BOOLEAN NOT NULL DEFAULT false, -- guards the lazy-expiry payout from double-firing

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active_expiry ON marketplace_listings(status, expires_at) WHERE status = 'active';

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Sellers can always see their own listings directly. Friends browse via the
-- get_friend_marketplace_listings() SECURITY DEFINER RPC (a friend's
-- listing row is not otherwise visible under RLS, same pattern used for
-- friends' business_stocks / stock_holdings elsewhere in this app).
DROP POLICY IF EXISTS "Users can view own marketplace listings" ON marketplace_listings;
CREATE POLICY "Users can view own marketplace listings" ON marketplace_listings FOR
SELECT USING (auth.uid() = seller_id);

-- Inserts/updates only ever happen through SECURITY DEFINER RPCs (which bypass
-- RLS entirely), so no direct INSERT/UPDATE/DELETE policy is granted here —
-- clients cannot write to this table at all except through the RPCs below.

CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Snapshot copied from the listing at purchase time (survives even if the
    -- listing row is later cleaned up)
    business_type_id INTEGER NOT NULL REFERENCES business_types(id),
    business_name TEXT NOT NULL,
    business_icon TEXT NOT NULL,
    base_cost NUMERIC(12, 2) NOT NULL,
    earnings_per_completion NUMERIC(12, 2) NOT NULL,
    purchase_price NUMERIC(12, 2) NOT NULL,

    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_habit_business_id UUID NULL REFERENCES habit_businesses(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_unresolved ON marketplace_purchases(buyer_id, resolved) WHERE resolved = false;

ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own marketplace purchases" ON marketplace_purchases;
CREATE POLICY "Users can view own marketplace purchases" ON marketplace_purchases FOR
SELECT USING (auth.uid() = buyer_id);

NOTIFY pgrst, 'reload schema';
