-- SIMPLIFIED portfolio function without user_profiles dependency
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
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY WITH user_holdings AS (
        -- Aggregate all purchases by stock_id for the user
        SELECT st.stock_id,
            SUM(st.shares_traded) as total_shares,
            ROUND(AVG(st.price_per_share), 2) as avg_price,
            SUM(st.total_cost) as total_invested
        FROM stock_transactions st
        WHERE st.buyer_id = user_uuid
            AND st.transaction_type = 'purchase'
        GROUP BY st.stock_id
        HAVING SUM(st.shares_traded) > 0
    )
SELECT gen_random_uuid() as holding_id,
    uh.stock_id,
    bs.habit_business_id as business_id,
    COALESCE(hb.business_name, 'Unknown Business') as business_name,
    COALESCE(hb.business_icon, '🏢') as business_icon,
    'Business Owner' as owner_name,
    -- Simple fallback
    bs.business_owner_id as owner_id,
    uh.total_shares::INTEGER as shares_owned,
    uh.avg_price as average_purchase_price,
    bs.current_stock_price,
    uh.total_invested,
    (uh.total_shares * bs.current_stock_price) as current_value,
    (uh.total_shares * bs.current_stock_price) - uh.total_invested as profit_loss,
    0.00 as total_dividends_earned,
    -- TODO: Calculate from dividends table if exists
    ROUND(
        (
            COALESCE(hb.earnings_per_completion, 0) * 0.10 * GREATEST(COALESCE(hb.streak, 0), 1)
        ) * uh.total_shares,
        2
    ) as daily_dividend_rate,
    COALESCE(hb.streak, 0) as business_streak
FROM user_holdings uh
    JOIN business_stocks bs ON uh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id
ORDER BY uh.total_invested DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;
-- Test the function with your user ID
SELECT *
FROM get_user_stock_portfolio('cf12469a-d7a2-40ef-82ca-21e8ade1d69b');