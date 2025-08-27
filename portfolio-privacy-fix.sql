-- Fix portfolio privacy: Show business type names instead of personal habit names
-- Run this in your Supabase SQL Editor
-- Update the portfolio function to use business type names for privacy
DROP FUNCTION IF EXISTS get_user_stock_portfolio(UUID);
CREATE OR REPLACE FUNCTION get_user_stock_portfolio(user_uuid UUID) RETURNS TABLE (
        holding_id UUID,
        stock_id UUID,
        business_name TEXT,
        business_icon TEXT,
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
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (sh.shares_owned * bs.current_stock_price) as current_value,
    (sh.shares_owned * bs.current_stock_price) - sh.total_invested as profit_loss,
    sh.total_dividends_earned,
    -- Calculate daily dividend rate: 10% of earnings per completion * streak multiplier
    ROUND(
        (hb.earnings_per_completion * 0.1) * LEAST(1 + (hb.streak * 0.01), 2) * (
            sh.shares_owned::NUMERIC / bs.total_shares_issued::NUMERIC
        ),
        4
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
-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;