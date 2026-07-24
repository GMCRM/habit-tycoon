-- Weekly Receipt feature
--
-- 1) business_sales: records when a user sells (deletes) one of their own
--    habit-businesses. This event previously wasn't persisted anywhere —
--    deleteHabitBusiness() only soft-deleted the habit_businesses row and
--    credited cash — so there was no historical record to itemize.
--
-- 2) get_weekly_receipt(): a SECURITY DEFINER RPC that assembles the
--    itemized transaction list for the current user for a given date range,
--    joining across habit_completions, stock_dividend_distributions,
--    stock_transactions, and business_sales.
--
--    This has to run as a privileged function rather than plain client-side
--    selects because habit_businesses' RLS policy only allows a user to read
--    their OWN rows (auth.uid() = user_id) — so a friend's business_name
--    (needed for dividend / stock-trade line items) isn't visible to the
--    client directly. The function only ever returns non-sensitive fields
--    (business name/type/icon, a counterparty's display name) that the app
--    already surfaces elsewhere (e.g. the stock marketplace), and it always
--    scopes to auth.uid() internally — it never takes a user id as input, so
--    it cannot be used to read another user's receipt.

CREATE TABLE IF NOT EXISTS business_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_business_id UUID NOT NULL REFERENCES habit_businesses(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type_name TEXT NOT NULL,
    sell_value DECIMAL(12, 2) NOT NULL,
    streak_at_sale INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_sales_user_id_created_at ON business_sales(user_id, created_at DESC);

ALTER TABLE business_sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own business sales" ON business_sales;
CREATE POLICY "Users can view own business sales" ON business_sales FOR
SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own business sales" ON business_sales;
CREATE POLICY "Users can create own business sales" ON business_sales FOR
INSERT WITH CHECK (auth.uid() = user_id);

-- RPC: itemized transaction history for the calling user within [p_week_start, p_week_end)
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

    -- Dividends received from a friend's business you own stock in
    SELECT
        'dividend'::TEXT,
        sdd.created_at,
        sdd.total_dividend::NUMERIC,
        COALESCE(up.name, 'A friend'),
        COALESCE(hb.business_name, 'a business'),
        '📈'::TEXT
    FROM stock_dividend_distributions sdd
    JOIN dividend_payments dp ON dp.id = sdd.dividend_payment_id
    JOIN business_stocks bs ON bs.id = dp.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN user_profiles up ON up.id = dp.business_owner_id
    WHERE sdd.stockholder_id = v_user_id
      AND sdd.created_at >= p_week_start
      AND sdd.created_at < p_week_end

    UNION ALL

    -- Stock purchases, sales, and forced refunds (business deleted underneath you)
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
        hb.business_name,
        COALESCE(up.name, 'Unknown'),
        '📊'::TEXT
    FROM stock_transactions st
    JOIN business_stocks bs ON bs.id = st.stock_id
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    LEFT JOIN user_profiles up ON up.id = bs.business_owner_id
    WHERE (st.buyer_id = v_user_id OR st.seller_id = v_user_id)
      AND st.created_at >= p_week_start
      AND st.created_at < p_week_end

    UNION ALL

    -- Sale of one of your own habit-businesses
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
