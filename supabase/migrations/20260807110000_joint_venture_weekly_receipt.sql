-- Joint Venture — Weekly Receipt.
--
-- Two new item types, purely additive: what a co-owner paid into a new
-- venture or an upgrade, and any refund from an invite/upgrade that expired
-- or was declined. The daily payout itself and Marketplace sale proceeds
-- need NO new type at all — they already flow through the existing
-- habit_earning and business_sale branches unchanged, since
-- complete_joint_venture_checkin / purchase_marketplace_listing /
-- resolve_expired_marketplace_listings write into habit_completions /
-- business_sales in exactly the shape those branches already expect.
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

    -- Personal habit completions (includes joint-venture daily check-in payouts —
    -- complete_joint_venture_checkin() writes into habit_completions in the
    -- same shape as a solo completion, so no separate branch is needed here)
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

    -- Sale of one of your own habit-businesses (your own data, unaffected).
    -- For a joint venture's sale/deletion payout, this is your own split cut
    -- — purchase_marketplace_listing() / resolve_expired_marketplace_listings()
    -- insert one business_sales row per co-owner, so this branch needs no change.
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

    UNION ALL

    -- Marketplace listings bought from a friend
    SELECT
        'marketplace_purchase'::TEXT,
        mp.created_at,
        -mp.purchase_price::NUMERIC,
        mp.business_name,
        COALESCE(bt.name, 'Business'),
        COALESCE(mp.business_icon, '🛒')
    FROM marketplace_purchases mp
    LEFT JOIN business_types bt ON bt.id = mp.business_type_id
    WHERE mp.buyer_id = v_user_id
      AND mp.created_at >= p_week_start
      AND mp.created_at < p_week_end

    UNION ALL

    -- Joint venture: your own share paid to co-found a new venture
    SELECT
        'joint_venture_investment'::TEXT,
        jvp.paid_at,
        (-jvp.share_amount)::NUMERIC,
        prop.business_name,
        'New joint venture'::TEXT,
        prop.business_icon
    FROM joint_venture_participants jvp
    JOIN joint_venture_proposals prop ON prop.id = jvp.proposal_id
    WHERE jvp.user_id = v_user_id
      AND jvp.paid = true
      AND jvp.paid_at IS NOT NULL
      AND jvp.paid_at >= p_week_start
      AND jvp.paid_at < p_week_end

    UNION ALL

    -- Joint venture: your own share paid toward a group upgrade
    SELECT
        'joint_venture_investment'::TEXT,
        jvup.paid_at,
        (-jvup.share_amount)::NUMERIC,
        hb.business_name,
        'Upgrade payment'::TEXT,
        hb.business_icon
    FROM joint_venture_upgrade_participants jvup
    JOIN joint_venture_upgrade_proposals uprop ON uprop.id = jvup.upgrade_proposal_id
    JOIN habit_businesses hb ON hb.id = uprop.habit_business_id
    WHERE jvup.user_id = v_user_id
      AND jvup.paid = true
      AND jvup.paid_at IS NOT NULL
      AND jvup.paid_at >= p_week_start
      AND jvup.paid_at < p_week_end

    UNION ALL

    -- Joint venture: refund from an invite that expired or was declined
    -- before the venture was fully funded
    SELECT
        'joint_venture_refund'::TEXT,
        jvp.refunded_at,
        jvp.share_amount::NUMERIC,
        prop.business_name,
        'Joint venture refund'::TEXT,
        prop.business_icon
    FROM joint_venture_participants jvp
    JOIN joint_venture_proposals prop ON prop.id = jvp.proposal_id
    WHERE jvp.user_id = v_user_id
      AND jvp.refunded_at IS NOT NULL
      AND jvp.refunded_at >= p_week_start
      AND jvp.refunded_at < p_week_end

    UNION ALL

    -- Joint venture: refund from an upgrade that expired or was declined
    -- before it was fully funded
    SELECT
        'joint_venture_refund'::TEXT,
        jvup.refunded_at,
        jvup.share_amount::NUMERIC,
        hb.business_name,
        'Upgrade refund'::TEXT,
        hb.business_icon
    FROM joint_venture_upgrade_participants jvup
    JOIN joint_venture_upgrade_proposals uprop ON uprop.id = jvup.upgrade_proposal_id
    JOIN habit_businesses hb ON hb.id = uprop.habit_business_id
    WHERE jvup.user_id = v_user_id
      AND jvup.refunded_at IS NOT NULL
      AND jvup.refunded_at >= p_week_start
      AND jvup.refunded_at < p_week_end

    ORDER BY 2 ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_receipt(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

NOTIFY pgrst, 'reload schema';
