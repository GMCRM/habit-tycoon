-- Temporary simple portfolio function to get things working
-- Run this if the debug shows your data exists but the function isn't working
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
    sh.stock_id,
    bs.business_id,
    'Test Business' as business_name,
    '🏢' as business_icon,
    'Test Owner' as owner_name,
    '00000000-0000-0000-0000-000000000000'::UUID as owner_id,
    sh.shares_owned,
    sh.average_purchase_price,
    COALESCE(bs.current_stock_price, 1.0) as current_stock_price,
    sh.total_invested,
    (
        sh.shares_owned * COALESCE(bs.current_stock_price, 1.0)
    ) as current_value,
    (
        sh.shares_owned * COALESCE(bs.current_stock_price, 1.0)
    ) - sh.total_invested as profit_loss,
    COALESCE(sh.total_dividends_earned, 0) as total_dividends_earned,
    0.01 as daily_dividend_rate,
    1 as business_streak
FROM stock_holdings sh
    LEFT JOIN business_stocks bs ON sh.stock_id = bs.id
WHERE sh.user_id = user_uuid
    AND sh.shares_owned > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;