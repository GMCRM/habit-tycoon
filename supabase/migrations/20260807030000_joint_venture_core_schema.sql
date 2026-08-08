-- Joint Venture (shared habit businesses) — core schema.
--
-- Lets multiple friends co-own a single habit_businesses row: they split the
-- cost evenly, all see it on their own home pages, and only earn a streak on
-- days every co-owner checks in — while each still receives the full,
-- undivided per-completion payout. See the companion migrations
-- (joint_venture_proposals, joint_venture_checkin, joint_venture_upgrade,
-- joint_venture_deletion, joint_venture_marketplace_integration) for the
-- RPCs that actually populate/use what's added here.
--
-- Guiding principle throughout all of these migrations: additive-only. Every
-- new column defaults to the "not a joint venture" value for every existing
-- row, every new branch in a modified RPC is gated on is_joint_venture /
-- business_co_owners (both vacuously false/empty today), and no existing
-- table, RPC, or RLS policy is removed — only extended.

ALTER TABLE habit_businesses
    ADD COLUMN IF NOT EXISTS is_joint_venture BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS joint_venture_timezone TEXT;

-- v1 scope: a joint venture is always a plain "once a day, every day" habit —
-- no custom weekly schedule, no multi-completion daily goals. This keeps the
-- multi-person check-in coordination (complete_joint_venture_checkin) simple.
-- Vacuous for every existing row (is_joint_venture is always false today).
ALTER TABLE habit_businesses
    DROP CONSTRAINT IF EXISTS joint_venture_habit_shape_check;
ALTER TABLE habit_businesses
    ADD CONSTRAINT joint_venture_habit_shape_check
    CHECK (NOT is_joint_venture OR (goal_value = 1 AND recurrence_interval = '24h'));

-- The live roster of who co-owns a joint venture business, including the
-- creator — fixed for the business's lifetime (no add/remove-co-owner flow
-- exists), which is what lets the daily check-in RPC compare "how many
-- co-owners checked in today" against a stable count without snapshotting it
-- per day. Only ever populated by accept_joint_venture_invite() once a
-- proposal is fully funded (see joint_venture_proposals.sql).
CREATE TABLE IF NOT EXISTS business_co_owners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_creator BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (habit_business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_co_owners_habit_business_id ON business_co_owners(habit_business_id);
CREATE INDEX IF NOT EXISTS idx_business_co_owners_user_id ON business_co_owners(user_id);

ALTER TABLE business_co_owners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Co-owners can view their own co-ownership rows" ON business_co_owners;
CREATE POLICY "Co-owners can view their own co-ownership rows" ON business_co_owners FOR
SELECT USING (auth.uid() = user_id);
-- No client INSERT/UPDATE/DELETE policy — the roster is only ever written by
-- accept_joint_venture_invite() (SECURITY DEFINER), which bypasses RLS as the
-- function owner, same as every other mutation RPC in this codebase.

-- ─── habit_businesses RLS: let non-creator co-owners see the shared row ───
-- Postgres ORs multiple permissive policies together, so this is additive —
-- the existing "auth.uid() = user_id" SELECT policy is untouched, and this
-- new policy is only ever satisfied when is_joint_venture is true (never the
-- case for any row that exists today).
DROP POLICY IF EXISTS "Co-owners can view joint venture businesses" ON habit_businesses;
CREATE POLICY "Co-owners can view joint venture businesses" ON habit_businesses FOR
SELECT USING (
    is_joint_venture AND EXISTS (
        SELECT 1 FROM business_co_owners bco
        WHERE bco.habit_business_id = habit_businesses.id AND bco.user_id = auth.uid()
    )
);

-- ─── habit_businesses RLS: a joint venture row can only be mutated through
-- the trusted SECURITY DEFINER RPCs in the companion migrations (which
-- bypass RLS as the function owner, same as adjust_user_cash /
-- create_marketplace_listing / etc. already do), never by a raw client
-- update. Without this, the creator — whose auth.uid() still equals a JV
-- row's user_id — could e.g. write business_type_id directly and upgrade for
-- free, bypassing the whole group-payment flow entirely, or unilaterally
-- soft-delete a shared business. is_joint_venture is false for every
-- existing row, so this is a no-op for all current single-owner behavior. ───
DROP POLICY IF EXISTS "Users can update own habit businesses" ON habit_businesses;
CREATE POLICY "Users can update own habit businesses" ON habit_businesses FOR
UPDATE USING (auth.uid() = user_id AND NOT is_joint_venture);

NOTIFY pgrst, 'reload schema';
