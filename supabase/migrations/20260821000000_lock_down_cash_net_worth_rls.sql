-- Lock down direct client updates to cash and net_worth columns.
--
-- The existing UPDATE policy on user_profiles only checks row ownership
-- (auth.uid() = id) with no column restriction. Any authenticated user
-- can bypass the app and set arbitrary cash/net_worth values via the
-- Supabase JS client (e.g. from devtools).
--
-- All legitimate cash/net_worth mutations already go through SECURITY
-- DEFINER RPCs (purchase_stock_shares, dividends, etc.) that bypass
-- RLS entirely, so blocking these columns in the direct UPDATE policy
-- does not affect normal operation.
--
-- Related: update_username() migration (20260813010000) applied the
-- same pattern for the name column.

-- Replace the unrestricted UPDATE policy with one that blocks cash/net_worth.
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND cash IS NOT DISTINCT FROM OLD.cash
    AND net_worth IS NOT DISTINCT FROM OLD.net_worth
  );

COMMENT ON POLICY "Users can update own profile" ON user_profiles
  IS 'Allows users to update their own profile, but blocks direct changes to cash and net_worth. Those columns must only be modified through SECURITY DEFINER RPCs.';
