-- FIX: get_user_stock_portfolio reads from stock_holdings (authoritative source)
--
-- ROOT CAUSE OF BUG: The previously deployed version read from stock_transactions
-- (purchases only) and never subtracted sales. This caused two problems:
--   1. After reset, stock_holdings was cleared but stock_transactions remained,
--      so the portfolio kept showing ghost stocks.
--   2. Calling sell_stock_shares on a ghost stock failed with "No holdings found"
--      because sell_stock_shares correctly reads stock_holdings.
--
-- This fix switches back to reading from stock_holdings, which is always the
-- authoritative live state (kept in sync by purchase_stock_shares and sell_stock_shares).
-- Also includes the owner_id column required by the frontend.
DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_name TEXT,
        owner_id UUID,
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
SELECT sh.id AS holding_id,
    bs.id AS stock_id,
    hb.id AS business_id,
    COALESCE(bt.name, hb.business_name, 'Unknown Business')::TEXT AS business_name,
    COALESCE(hb.business_icon, '🏢')::TEXT AS business_icon,
    COALESCE(up.name, 'Unknown Owner')::TEXT AS owner_name,
    bs.business_owner_id AS owner_id,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) AS current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested AS profit_loss,
    sh.total_dividends_earned,
    ROUND(
        (
            COALESCE(hb.earnings_per_completion, 0) * 0.10 * GREATEST(COALESCE(hb.streak, 0), 1)
        ) * sh.shares_owned,
        2
    ) AS daily_dividend_rate,
    COALESCE(hb.streak, 0) AS business_streak
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
    LEFT JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN user_profiles up ON bs.business_owner_id = up.id
WHERE sh.holder_id = user_uuid
    AND sh.shares_owned > 0
ORDER BY (sh.shares_owned * bs.current_stock_price) DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;