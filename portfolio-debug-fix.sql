-- Debug and fix the portfolio function
-- Run this in your Supabase SQL Editor
-- First, let's create a debug version to see what's happening
DROP FUNCTION IF EXISTS debug_portfolio(UUID);
CREATE OR REPLACE FUNCTION debug_portfolio(user_uuid UUID) RETURNS TABLE (debug_info TEXT, holding_count BIGINT) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN -- Check if user has any stock holdings
SELECT 'Stock Holdings Count',
    COUNT(*)
FROM stock_holdings
WHERE user_id = user_uuid
    AND shares_owned > 0 INTO debug_info,
    holding_count;
RETURN NEXT;
-- Check if business_stocks exist
SELECT 'Business Stocks Count',
    COUNT(*)
FROM business_stocks INTO debug_info,
    holding_count;
RETURN NEXT;
-- Check if habit_businesses exist
SELECT 'Habit Businesses Count',
    COUNT(*)
FROM habit_businesses INTO debug_info,
    holding_count;
RETURN NEXT;
END;
$$;
-- Now let's fix the main portfolio function with better error handling
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
SELECT sh.id as holding_id,
    bs.id as stock_id,
    hb.id as business_id,
    COALESCE(bt.name, hb.business_name, 'Unknown Business') as business_name,
    COALESCE(hb.business_icon, '🏢') as business_icon,
    COALESCE(up.name, up.display_name, 'Unknown User') as owner_name,
    hb.user_id as owner_id,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    sh.total_invested,
    (
        sh.shares_owned::NUMERIC * bs.current_stock_price
    ) as current_value,
    (
        sh.shares_owned::NUMERIC * bs.current_stock_price
    ) - sh.total_invested as profit_loss,
    COALESCE(sh.total_dividends_earned, 0) as total_dividends_earned,
    ROUND(
        (
            COALESCE(hb.earnings_per_completion, 0) * 0.10 * GREATEST(COALESCE(hb.streak, 0), 1)
        ) * sh.shares_owned,
        2
    ) as daily_dividend_rate,
    COALESCE(hb.streak, 0) as business_streak
FROM stock_holdings sh
    JOIN business_stocks bs ON sh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.business_id = hb.id
    LEFT JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN user_profiles up ON hb.user_id = up.user_id
WHERE sh.user_id = user_uuid
    AND sh.shares_owned > 0
ORDER BY sh.total_invested DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION debug_portfolio(UUID) TO authenticated;