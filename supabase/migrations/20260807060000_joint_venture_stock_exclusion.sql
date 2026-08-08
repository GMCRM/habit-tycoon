-- Joint Venture — stock exclusion + N-way "view owners" fan-out.
--
-- Requirement: none of a joint venture's co-creators may own stock in their
-- own venture — only their friends (non-co-owners) can buy shares. Today
-- self-buy exclusion for the single-owner case is enforced only client-side
-- (getAvailableStocks()'s .neq('business_owner_id', userId) and
-- get_friend_businesses_for_stocks()'s WHERE hb.user_id != user_uuid) —
-- purchase_stock_shares() itself has no ownership check at all. Closing this
-- at the DB layer, extended to the whole co-owner set, is a genuine,
-- independently-worthwhile fix and is required for the joint-venture rule.
--
-- Also fans out get_stock_owners() so a joint venture's 80 owner-shares
-- display as one row per co-owner, each owning an equal split (rounded to
-- one decimal place — e.g. 13.3 shares for 6 owners) instead of a single
-- 80-share row.

-- ─── get_friend_businesses_for_stocks: add a co-owner exclusion. Byte-for-byte
-- identical to the live version (20260723211307_effective_streak_fields_for_stocks.sql)
-- otherwise — this is a no-op for every non-JV business (business_co_owners
-- has zero rows for them). ───
CREATE OR REPLACE FUNCTION get_friend_businesses_for_stocks(user_uuid UUID) RETURNS TABLE (
        business_id UUID,
        business_name TEXT,
        business_icon TEXT,
        owner_id UUID,
        owner_name TEXT,
        streak INTEGER,
        frequency TEXT,
        goal_value INTEGER,
        current_progress INTEGER,
        earnings_per_completion NUMERIC,
        stock_id UUID,
        stock_price NUMERIC,
        base_price NUMERIC,
        price_multiplier NUMERIC,
        shares_available INTEGER,
        total_shares INTEGER,
        potential_dividend NUMERIC,
        last_completed_at TIMESTAMPTZ,
        recurrence_interval TEXT,
        active_days INTEGER[]
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT hb.id,
    bt.name as business_name,
    -- Use business type name for privacy instead of personal habit name
    hb.business_icon,
    hb.user_id,
    up.name,
    hb.streak,
    hb.frequency,
    hb.goal_value,
    hb.current_progress,
    hb.earnings_per_completion,
    bs.id as stock_id,
    COALESCE(
        bs.current_stock_price,
        COALESCE(hb.earnings_per_completion, 1) * COALESCE(bs.price_multiplier, 1)
    ) as stock_price,
    COALESCE(hb.earnings_per_completion, 1) as base_price,
    bs.price_multiplier,
    bs.shares_available,
    bs.total_shares_issued,
    -- Minimum $0.01 per share per completion regardless of pool size
    GREATEST(
        ROUND(
            (
                (hb.earnings_per_completion * 1.0) * LEAST(1 + (hb.streak * 0.01), 2) * CASE
                    WHEN hb.current_progress >= hb.goal_value THEN 1.5
                    ELSE 1
                END
            ) / COALESCE(NULLIF(bs.total_shares_issued, 0), 100),
            2
        ),
        0.01
    ) as potential_dividend,
    hb.last_completed_at,
    hb.recurrence_interval,
    hb.active_days
FROM habit_businesses hb
    INNER JOIN user_profiles up ON hb.user_id = up.id
    INNER JOIN business_types bt ON hb.business_type_id = bt.id -- Add join for business type
    LEFT JOIN business_stocks bs ON hb.id = bs.habit_business_id
    INNER JOIN friendships f ON (
        f.user_id = user_uuid
        AND f.friend_id = hb.user_id
    )
    OR (
        f.friend_id = user_uuid
        AND f.user_id = hb.user_id
    )
WHERE hb.is_active = true
    AND hb.user_id != user_uuid -- Don't show user's own businesses
    AND f.status = 'accepted' -- Only friends
    AND (
        bs.shares_available > 0
        OR bs.shares_available IS NULL
    ) -- Available shares or no stock created yet
    -- Joint venture: exclude if the viewer is themselves a co-owner of this
    -- business (no-op for non-JV businesses — zero business_co_owners rows).
    AND NOT EXISTS (
        SELECT 1 FROM business_co_owners bco
        WHERE bco.habit_business_id = hb.id AND bco.user_id = user_uuid
    )
ORDER BY hb.streak DESC,
    hb.business_name;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;

-- ─── purchase_stock_shares: hard-block any co-owner from buying stock in
-- their own joint venture (also subsumes the single-owner self-buy case,
-- previously only enforced client-side). Byte-for-byte identical to the live
-- version (20260724020000_prevent_stock_pump_and_dump.sql) otherwise. ───
CREATE OR REPLACE FUNCTION purchase_stock_shares(
        buyer_id UUID,
        stock_uuid UUID,
        shares_to_buy INTEGER
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stock_price NUMERIC;
available_shares INTEGER;
total_cost NUMERIC;
buyer_cash NUMERIC;
existing_holding_id UUID;
new_total_shares INTEGER;
new_total_invested NUMERIC;
new_avg_price NUMERIC;
BEGIN
IF EXISTS (
    SELECT 1 FROM business_co_owners bco
    JOIN business_stocks bs ON bs.habit_business_id = bco.habit_business_id
    WHERE bs.id = stock_uuid AND bco.user_id = buyer_id
) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Co-owners cannot invest in their own joint venture');
END IF;
SELECT business_stocks.current_stock_price,
    business_stocks.shares_available INTO stock_price,
    available_shares
FROM business_stocks
WHERE business_stocks.id = stock_uuid;
IF stock_price IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Stock not found');
END IF;
IF available_shares < shares_to_buy THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'Not enough shares available'
);
END IF;
total_cost := stock_price * shares_to_buy;
SELECT cash INTO buyer_cash
FROM user_profiles
WHERE id = buyer_id;
IF buyer_cash < total_cost THEN RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
END IF;
SELECT id INTO existing_holding_id
FROM stock_holdings
WHERE holder_id = buyer_id
    AND stock_id = stock_uuid;
IF existing_holding_id IS NOT NULL THEN
SELECT shares_owned + shares_to_buy,
    total_invested + total_cost INTO new_total_shares,
    new_total_invested
FROM stock_holdings
WHERE id = existing_holding_id;
new_avg_price := new_total_invested / new_total_shares;
UPDATE stock_holdings
SET shares_owned = new_total_shares,
    average_purchase_price = new_avg_price,
    total_invested = new_total_invested,
    last_purchase_at = NOW(),
    updated_at = NOW()
WHERE id = existing_holding_id;
ELSE
INSERT INTO stock_holdings (
        holder_id,
        stock_id,
        shares_owned,
        average_purchase_price,
        total_invested,
        total_dividends_earned,
        last_purchase_at
    )
VALUES (
        buyer_id,
        stock_uuid,
        shares_to_buy,
        stock_price,
        total_cost,
        0,
        NOW()
    );
END IF;
UPDATE business_stocks
SET shares_available = business_stocks.shares_available - shares_to_buy,
    updated_at = NOW()
WHERE business_stocks.id = stock_uuid;
INSERT INTO stock_transactions (
        stock_id,
        buyer_id,
        seller_id,
        shares_traded,
        price_per_share,
        total_cost,
        transaction_type
    )
VALUES (
        stock_uuid,
        buyer_id,
        NULL,
        shares_to_buy,
        stock_price,
        total_cost,
        'purchase'
    );
UPDATE user_profiles
SET cash = cash - total_cost,
    updated_at = NOW()
WHERE id = buyer_id;
PERFORM recalculate_net_worth(buyer_id);
RETURN jsonb_build_object(
    'success',
    true,
    'shares_purchased',
    shares_to_buy,
    'total_cost',
    total_cost,
    'new_cash_balance',
    buyer_cash - total_cost
);
END;
$$;
GRANT EXECUTE ON FUNCTION purchase_stock_shares(UUID, UUID, INTEGER) TO authenticated;

-- ─── get_stock_owners: fan out the owner-share pool for joint ventures.
-- shares_owned widens from INTEGER to NUMERIC(10,1) to carry fractional
-- splits, so this needs a DROP first (Postgres won't let CREATE OR REPLACE
-- change a function's return-column type). ───
DROP FUNCTION IF EXISTS get_stock_owners(UUID);
CREATE OR REPLACE FUNCTION get_stock_owners(business_id_param UUID) RETURNS TABLE (
    owner_name TEXT,
    shares_owned NUMERIC(10, 1),
    is_business_owner BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN QUERY
-- Single-owner businesses: byte-for-byte the same one-row shape as before.
SELECT up.name AS owner_name,
    bs.shares_owned_by_owner::NUMERIC(10, 1) AS shares_owned,
    true AS is_business_owner
FROM business_stocks bs
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    JOIN user_profiles up ON up.id = bs.business_owner_id
WHERE bs.habit_business_id = business_id_param
    AND bs.shares_owned_by_owner > 0
    AND NOT hb.is_joint_venture
UNION ALL
-- Joint ventures: fan out the owner-share pool to one row per co-owner,
-- each shown owning an equal split (e.g. 13.3 shares for 6 owners).
SELECT up.name AS owner_name,
    ROUND(bs.shares_owned_by_owner::NUMERIC / NULLIF(co_count.n, 0), 1) AS shares_owned,
    true AS is_business_owner
FROM business_stocks bs
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    JOIN business_co_owners bco ON bco.habit_business_id = hb.id
    JOIN user_profiles up ON up.id = bco.user_id
    JOIN (
        SELECT habit_business_id, COUNT(*) AS n FROM business_co_owners GROUP BY habit_business_id
    ) co_count ON co_count.habit_business_id = hb.id
WHERE bs.habit_business_id = business_id_param
    AND hb.is_joint_venture
    AND bs.shares_owned_by_owner > 0
UNION ALL
-- Outside investors: unchanged either way — co-owners can never appear here
-- since purchase_stock_shares() now blocks them from buying their own stock.
SELECT up.name AS owner_name,
    sh.shares_owned::NUMERIC(10, 1) AS shares_owned,
    false AS is_business_owner
FROM stock_holdings sh
    JOIN business_stocks bs ON bs.id = sh.stock_id
    JOIN user_profiles up ON up.id = sh.holder_id
WHERE bs.habit_business_id = business_id_param
    AND sh.shares_owned > 0
ORDER BY shares_owned DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_stock_owners(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
