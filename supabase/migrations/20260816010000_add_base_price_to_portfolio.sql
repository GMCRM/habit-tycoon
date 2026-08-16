-- Add a "base price" column to get_user_stock_portfolio(): the price a held
-- stock would trade at if the business's streak dropped to 0 right now.
--
-- update_stock_price_by_streak() (20260811010000_simplify_stock_price_streak_formula.sql)
-- prices a stock as business_types.base_cost * 0.1 * (1 + streak * 0.01), and
-- streak 0 maps to exactly base_cost * 0.1. That's the same quantity, computed
-- the same way, so the portfolio stat breakdown can show it without touching
-- the pricing engine itself. Byte-for-byte identical to the live version
-- (20260724020000_prevent_stock_pump_and_dump.sql) otherwise.
--
-- get_friend_businesses_for_stocks() is intentionally left alone here - its
-- own (differently-defined, pre-existing) base_price field feeds the
-- available-stocks price-change display and is out of scope for this change.

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
        base_price NUMERIC,
        total_invested NUMERIC,
        current_value NUMERIC,
        profit_loss NUMERIC,
        total_dividends_earned NUMERIC,
        daily_dividend_rate NUMERIC,
        business_streak INTEGER,
        goal_value INTEGER,
        current_progress INTEGER,
        last_completed_at TIMESTAMPTZ,
        recurrence_interval TEXT,
        active_days INTEGER[]
    ) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
SELECT sh.id,
    bs.id as stock_id,
    hb.id as business_id,
    bt.name as business_name,
    bt.icon as business_icon,
    -- Public business type name/icon, never the private per-habit name/icon
    hb.user_id as owner_id,
    up.name,
    sh.shares_owned,
    sh.average_purchase_price,
    bs.current_stock_price,
    COALESCE(bt.base_cost * 0.1, 1) as base_price,
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
    hb.streak,
    hb.goal_value,
    hb.current_progress,
    hb.last_completed_at,
    hb.recurrence_interval,
    hb.active_days
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
