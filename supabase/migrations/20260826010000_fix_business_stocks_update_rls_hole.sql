-- Security fix: "Business owners can update their stocks" has no
-- WITH CHECK, so (same class of bug as user_profiles/friendships) a
-- business owner can write current_stock_price/shares_available/
-- price_multiplier/etc. on their own business_stocks row directly via a
-- raw client call, bypassing update_stock_price_by_streak()'s smoothing
-- and the pump-and-dump cooldown that 20260724020000 already added for
-- the sibling habit_businesses table.
--
-- FIX: a BEFORE UPDATE trigger blocks changes to the computed/identity
-- columns unless the UPDATE is happening inside a SECURITY DEFINER
-- function (update_stock_price_by_streak, purchase_stock_shares,
-- sell_stock_shares, ...). SECURITY DEFINER functions execute with
-- current_user set to the function's owner, never to `authenticated` --
-- that's how every Supabase REST/RPC call is scoped -- so gating on
-- `current_user <> 'authenticated'` reliably distinguishes "the app's own
-- server-side logic did this" from "a client wrote straight to the table"
-- without having to touch any of those (long, frequently-revised)
-- function bodies.
--
-- The two remaining legitimate call sites that *did* write these columns
-- directly from the client (admin's "fix lemonade stock prices" tool, and
-- the account-reset flow returning a user's held shares to the market) are
-- moved into their own SECURITY DEFINER RPCs below so they keep working
-- under the new guard.

CREATE OR REPLACE FUNCTION guard_business_stocks_mutation() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF current_user = 'authenticated' THEN
        IF NEW.habit_business_id IS DISTINCT FROM OLD.habit_business_id
           OR NEW.business_owner_id IS DISTINCT FROM OLD.business_owner_id
           OR NEW.current_stock_price IS DISTINCT FROM OLD.current_stock_price
           OR NEW.total_shares_issued IS DISTINCT FROM OLD.total_shares_issued
           OR NEW.shares_owned_by_owner IS DISTINCT FROM OLD.shares_owned_by_owner
           OR NEW.shares_available IS DISTINCT FROM OLD.shares_available
           OR NEW.price_multiplier IS DISTINCT FROM OLD.price_multiplier
           OR NEW.ramp_start_price IS DISTINCT FROM OLD.ramp_start_price
           OR NEW.ramp_start_at IS DISTINCT FROM OLD.ramp_start_at THEN
            RAISE EXCEPTION 'business_stocks pricing/share columns can only be changed by server-side logic';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_business_stocks_mutation_trigger ON business_stocks;
CREATE TRIGGER guard_business_stocks_mutation_trigger
    BEFORE UPDATE ON business_stocks
    FOR EACH ROW EXECUTE FUNCTION guard_business_stocks_mutation();

-- Replaces the client's direct `.from('business_stocks').update({current_stock_price: 1, ...})`
-- in HabitBusinessService.fixLemonadeStockPrices(). Admin-only, mirrors is_admin() gating
-- used elsewhere.
CREATE OR REPLACE FUNCTION admin_reset_stock_prices(p_habit_business_ids UUID[])
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can reset stock prices';
    END IF;

    UPDATE business_stocks
    SET current_stock_price = 1.00,
        price_multiplier = 1.0,
        ramp_start_price = 1.00,
        ramp_start_at = NOW(),
        last_price_update = NOW()
    WHERE habit_business_id = ANY(p_habit_business_ids);
END;
$$;
GRANT EXECUTE ON FUNCTION admin_reset_stock_prices(UUID[]) TO authenticated;

-- Replaces the client's direct `.from('business_stocks').update({shares_available: ...})`
-- loop in AuthService's account-reset flow. Only ever touches shares the
-- calling user actually holds (their own stock_holdings rows), and only
-- returns those shares to the market -- it does not delete the holdings
-- themselves, matching the caller's existing follow-up cleanup.
CREATE OR REPLACE FUNCTION return_user_stock_shares_to_market()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_holding RECORD;
BEGIN
    FOR v_holding IN
        SELECT stock_id, shares_owned
        FROM stock_holdings
        WHERE holder_id = auth.uid()
          AND shares_owned > 0
    LOOP
        UPDATE business_stocks
        SET shares_available = shares_available + v_holding.shares_owned,
            updated_at = NOW()
        WHERE id = v_holding.stock_id;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION return_user_stock_shares_to_market() TO authenticated;

NOTIFY pgrst, 'reload schema';
