-- Expose the stock price ramp anchor (ramp_start_price) via
-- get_user_stock_portfolio() so the client can explain *why* a stock's
-- current price sits below its displayed base price after a business
-- upgrade, and estimate how long it'll take to catch up.
--
-- update_stock_price_by_streak() (20260811020000_fix_ramp_compounding_and_hourly_sync.sql)
-- caps upward price movement at +50% of ramp_start_price per 24h, measured
-- from ramp_start_at. Given that anchor, the days remaining for the price
-- to reach any target T >= current price is:
--   days = 2 * (T - current_price) / ramp_start_price
-- (derived from max_price(t) = anchor * (1 + 0.5 * hours/24)).
--
-- Byte-for-byte identical to 20260816010000_add_base_price_to_portfolio.sql
-- otherwise.

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
        ramp_start_price NUMERIC,
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
    COALESCE(bs.ramp_start_price, bs.current_stock_price) as ramp_start_price,
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
