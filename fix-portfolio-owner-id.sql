-- Fix portfolio function to include owner_id for reminders
-- Run this in your Supabase SQL Editor
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
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    hb.business_icon,
    up.name,
    hb.user_id as owner_id,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    ROUND(
        (
            hb.earnings_per_completion * 0.10 * GREATEST(hb.streak, 1)
        ) * sh.shares_owned,
        2
    ) as daily_dividend_rate,
    hb.streak as business_streak
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.business_id = hb.id
    JOIN business_types bt ON hb.business_type_id = bt.id
    JOIN user_profiles up ON hb.user_id = up.user_id
WHERE sh.user_id = user_uuid
    AND sh.shares_owned > 0
ORDER BY sh.total_invested DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;