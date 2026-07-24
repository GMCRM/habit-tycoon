-- Fix: "Send Reminder" still fails after 012 with the same error
-- (public.send_stockholder_reminder(business_name, from_user_id, from_user_name) —
-- note to_user_id is missing from that list)
--
-- ROOT CAUSE: the reminder function itself was fine. The bug is upstream in
-- get_user_stock_portfolio (stocks-system-functions.sql), whose RETURNS TABLE
-- dropped the owner_id column at some point (likely during the "use business
-- type name for privacy" pass). Every portfolio holding the app loads
-- therefore has ownerId === undefined. supabase-js's .rpc() JSON.stringifies
-- the params object, which silently drops keys with an undefined value — so
-- the "Send Reminder" click sends to_user_id: undefined, PostgREST can't
-- match any overload, and the error only lists the 3 keys that survived.
--
-- FIX: restore owner_id (hb.user_id) to get_user_stock_portfolio's return
-- columns so holding.ownerId is populated again.
--
-- Run this in Supabase SQL Editor (after 012).

DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);

CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_id UUID,
        owner_name TEXT,
        shares_owned INTEGER,
        average_purchase_price NUMERIC,
        current_stock_price NUMERIC,
        total_invested NUMERIC,
        current_value NUMERIC,
        profit_loss NUMERIC,
        total_dividends_earned NUMERIC,
        daily_dividend_rate NUMERIC,
        business_streak INTEGER
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    hb.user_id as owner_id,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    -- Estimated dividend per completion: apply same GREATEST($0.01) floor as the payout function
    GREATEST(
        ROUND(
            (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * (
                sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC
            ),
            2
        ),
        0.01
    ) as daily_dividend_rate,
    hb.streak
FROM stock_holdings sh
    INNER JOIN business_stocks bs ON sh.stock_id = bs.id
    INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id
    INNER JOIN user_profiles up ON hb.user_id = up.id
WHERE sh.holder_id = user_uuid
    AND sh.shares_owned > 0
    AND hb.is_active = true
ORDER BY current_value DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
