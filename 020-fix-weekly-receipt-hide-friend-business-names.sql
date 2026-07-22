-- 020-fix-weekly-receipt-hide-friend-business-names.sql
--
-- get_weekly_receipt() (see 019-business-sales-ledger.sql) was leaking a
-- friend's chosen business/habit name (e.g. "Balance of Nature Fruits") to
-- other stockholders via the dividend and stock trade line items. That name
-- is player-chosen and can reveal what the friend's underlying habit
-- actually is, which they never agreed to share with stockholders.
--
-- Fix: for line items about a business you don't own (dividends received,
-- stock purchases/sales, forced refunds), surface only the generic business
-- TYPE (e.g. "Donut Shop", "Pizza Delivery") instead of the owner's custom
-- business name. Your own habit_earning and business_sale rows are
-- unaffected since those are already your own data.

DROP FUNCTION IF EXISTS get_weekly_receipt(TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION get_weekly_receipt(
    p_week_start TIMESTAMPTZ,
    p_week_end TIMESTAMPTZ
) RETURNS TABLE (
    item_type TEXT,
    occurred_at TIMESTAMPTZ,
    amount NUMERIC,
    primary_label TEXT,
    secondary_label TEXT,
    icon TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    RETURN QUERY

    -- Personal habit completions
    SELECT
        'habit_earning'::TEXT,
        hc.completed_at,
        hc.earnings::NUMERIC,
        hb.business_name,
        COALESCE(bt.name, 'Business'),
        COALESCE(hb.business_icon, '✅')
    FROM habit_completions hc
    JOIN habit_businesses hb ON hb.id = hc.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hc.user_id = v_user_id
      AND hc.completed_at >= p_week_start
      AND hc.completed_at < p_week_end

    UNION ALL

    -- Dividends received from a friend's business you own stock in.
    -- primary = friend's name, secondary = business TYPE (not the friend's
    -- custom business name — that would reveal their actual habit).
    SELECT
        'dividend'::TEXT,
        sdd.created_at,
        sdd.total_dividend::NUMERIC,
        COALESCE(up.name, 'A friend'),
        COALESCE(bt.name, 'a business'),
        '📈'::TEXT
    FROM stock_dividend_distributions sdd
    JOIN dividend_payments dp ON dp.id = sdd.dividend_payment_id
    JOIN business_stocks bs ON bs.id = dp.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    LEFT JOIN user_profiles up ON up.id = dp.business_owner_id
    WHERE sdd.stockholder_id = v_user_id
      AND sdd.created_at >= p_week_start
      AND sdd.created_at < p_week_end

    UNION ALL

    -- Stock purchases, sales, and forced refunds (business deleted underneath you).
    -- primary = business TYPE (not the owner's custom business name),
    -- secondary = the counterparty's display name.
    SELECT
        CASE
            WHEN st.buyer_id = v_user_id THEN 'stock_purchase'
            WHEN st.transaction_type = 'business_deletion_refund' THEN 'stock_refund'
            ELSE 'stock_sale'
        END::TEXT,
        st.created_at,
        CASE
            WHEN st.buyer_id = v_user_id THEN -st.total_cost
            WHEN st.transaction_type = 'business_deletion_refund' THEN st.total_cost
            ELSE ROUND(st.total_cost * 0.98, 2) -- net of the 2% sale fee actually credited to cash
        END::NUMERIC,
        COALESCE(bt.name, 'a business'),
        COALESCE(up.name, 'Unknown'),
        '📊'::TEXT
    FROM stock_transactions st
    JOIN business_stocks bs ON bs.id = st.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    LEFT JOIN user_profiles up ON up.id = bs.business_owner_id
    WHERE (st.buyer_id = v_user_id OR st.seller_id = v_user_id)
      AND st.created_at >= p_week_start
      AND st.created_at < p_week_end

    UNION ALL

    -- Sale of one of your own habit-businesses (your own data, unaffected)
    SELECT
        'business_sale'::TEXT,
        bsale.created_at,
        bsale.sell_value::NUMERIC,
        bsale.business_name,
        bsale.business_type_name,
        '💰'::TEXT
    FROM business_sales bsale
    WHERE bsale.user_id = v_user_id
      AND bsale.created_at >= p_week_start
      AND bsale.created_at < p_week_end

    ORDER BY 2 ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_receipt(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
