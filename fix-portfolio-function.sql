-- FIX: get_user_stock_portfolio function
-- The previous deployed version had wrong column names causing silent errors:
--   bs.business_id      → should be bs.habit_business_id
--   sh.user_id          → should be sh.holder_id
--   up.user_id          → should be up.id
-- This version reads from stock_transactions (reliable) and uses correct column names.
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
        -- Aggregate all net purchases per stock for this user
        SELECT st.stock_id,
            SUM(st.shares_traded) AS total_shares,
            ROUND(AVG(st.price_per_share), 2) AS avg_price,
            SUM(st.total_cost) AS total_invested
        FROM stock_transactions st
        WHERE st.buyer_id = user_uuid
            AND st.transaction_type = 'purchase'
        GROUP BY st.stock_id
        HAVING SUM(st.shares_traded) > 0
    )
SELECT gen_random_uuid() AS holding_id,
    uh.stock_id,
    bs.habit_business_id AS business_id,
    -- CORRECT column
    COALESCE(bt.name, hb.business_name, 'Unknown Business') AS business_name,
    COALESCE(hb.business_icon, '🏢') AS business_icon,
    COALESCE(up.name, 'Unknown Owner') AS owner_name,
    bs.business_owner_id AS owner_id,
    uh.total_shares::INTEGER AS shares_owned,
    uh.avg_price AS average_purchase_price,
    COALESCE(bs.current_stock_price, uh.avg_price) AS current_stock_price,
    uh.total_invested,
    (
        uh.total_shares * COALESCE(bs.current_stock_price, uh.avg_price)
    ) AS current_value,
    (
        uh.total_shares * COALESCE(bs.current_stock_price, uh.avg_price)
    ) - uh.total_invested AS profit_loss,
    COALESCE(
        (
            SELECT SUM(sdd.total_dividend)
            FROM stock_dividend_distributions sdd
            WHERE sdd.stockholder_id = user_uuid
                AND sdd.dividend_payment_id IN (
                    SELECT dp.id
                    FROM dividend_payments dp
                    WHERE dp.stock_id = uh.stock_id
                )
        ),
        0.00
    ) AS total_dividends_earned,
    ROUND(
        (
            COALESCE(hb.earnings_per_completion, 0) * 0.10 * GREATEST(COALESCE(hb.streak, 0), 1)
        ) * uh.total_shares,
        2
    ) AS daily_dividend_rate,
    COALESCE(hb.streak, 0) AS business_streak
FROM user_holdings uh
    JOIN business_stocks bs ON uh.stock_id = bs.id
    JOIN habit_businesses hb ON bs.habit_business_id = hb.id -- CORRECT column
    LEFT JOIN business_types bt ON hb.business_type_id = bt.id
    LEFT JOIN user_profiles up ON bs.business_owner_id = up.id -- CORRECT column
ORDER BY uh.total_invested DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_user_stock_portfolio(UUID) TO authenticated;
-- Quick validation: should return rows if any purchases exist
-- SELECT * FROM get_user_stock_portfolio('<your-user-uuid>');