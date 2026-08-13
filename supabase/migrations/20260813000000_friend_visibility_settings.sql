-- Per-friend stock/marketplace visibility toggles.
--
-- Lets a user hide their own businesses' stocks and/or marketplace listings
-- from a specific friend (e.g. picking one "accountability partner" who's
-- allowed to buy your stock while everyone else can't). Defaults to visible
-- (on) for every friend — a missing row means "show". Joint ventures are
-- exempt: since a JV has multiple co-owners, no single owner's toggle should
-- be able to hide it from a friend, so both filters below skip the check
-- entirely when the business is a joint venture. Marketplace listings have
-- no joint-venture equivalent, so that filter always applies.

CREATE TABLE IF NOT EXISTS friend_visibility_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    show_stocks BOOLEAN NOT NULL DEFAULT true,
    show_marketplace BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(owner_id, friend_id),
    CHECK (owner_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_visibility_settings_owner ON friend_visibility_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_friend_visibility_settings_friend ON friend_visibility_settings(friend_id);

ALTER TABLE friend_visibility_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own visibility settings" ON friend_visibility_settings;
CREATE POLICY "Users can view their own visibility settings"
    ON friend_visibility_settings FOR SELECT
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own visibility settings" ON friend_visibility_settings;
CREATE POLICY "Users can insert their own visibility settings"
    ON friend_visibility_settings FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own visibility settings" ON friend_visibility_settings;
CREATE POLICY "Users can update their own visibility settings"
    ON friend_visibility_settings FOR UPDATE
    USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own visibility settings" ON friend_visibility_settings;
CREATE POLICY "Users can delete their own visibility settings"
    ON friend_visibility_settings FOR DELETE
    USING (auth.uid() = owner_id);

-- ─── get_friend_businesses_for_stocks: add the visibility-toggle filter.
-- Byte-for-byte identical to the live version
-- (20260807060000_joint_venture_stock_exclusion.sql) otherwise. ───
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
    -- Per-friend visibility toggle: skip entirely for joint ventures (no
    -- single co-owner should be able to hide a JV's stock from a friend of
    -- theirs). For single-owner businesses, hide if the owner has turned
    -- "show stocks" off for this specific viewer.
    AND (
        hb.is_joint_venture
        OR NOT EXISTS (
            SELECT 1 FROM friend_visibility_settings fvs
            WHERE fvs.owner_id = hb.user_id
              AND fvs.friend_id = user_uuid
              AND fvs.show_stocks = false
        )
    )
ORDER BY hb.streak DESC,
    hb.business_name;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_businesses_for_stocks(UUID) TO authenticated;

-- ─── purchase_stock_shares: defense in depth, mirroring the co-owner block
-- above it — refuse a purchase the viewer should never have been able to see
-- in the first place. Byte-for-byte identical to the live version
-- (20260807060000_joint_venture_stock_exclusion.sql) otherwise. ───
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
IF EXISTS (
    SELECT 1 FROM business_stocks bs
    JOIN habit_businesses hb ON hb.id = bs.habit_business_id
    JOIN friend_visibility_settings fvs ON fvs.owner_id = hb.user_id AND fvs.friend_id = buyer_id
    WHERE bs.id = stock_uuid AND NOT hb.is_joint_venture AND fvs.show_stocks = false
) THEN
    RETURN jsonb_build_object('success', false, 'error', 'This stock is not available for you to purchase');
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

-- ─── get_friend_marketplace_listings: add the visibility-toggle filter.
-- Byte-for-byte identical to the live version
-- (20260726020000_marketplace_listing_queue.sql) otherwise. ───
CREATE OR REPLACE FUNCTION get_friend_marketplace_listings(p_viewer_id UUID) RETURNS TABLE (
    id UUID,
    seller_id UUID,
    seller_name TEXT,
    business_type_id INTEGER,
    business_name TEXT,
    business_icon TEXT,
    base_cost NUMERIC,
    earnings_per_completion NUMERIC,
    base_sell_value NUMERIC,
    streak_at_listing INTEGER,
    listing_price NUMERIC,
    reason TEXT,
    created_at TIMESTAMPTZ,
    listed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_own BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF p_viewer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    RETURN QUERY
    SELECT
        ml.id,
        ml.seller_id,
        up.name,
        ml.business_type_id,
        bt.name,
        ml.business_icon,
        ml.base_cost,
        ml.earnings_per_completion,
        ml.base_sell_value,
        ml.streak_at_listing,
        ml.listing_price,
        ml.reason,
        ml.created_at,
        ml.listed_at,
        ml.expires_at,
        (ml.seller_id = p_viewer_id)
    FROM marketplace_listings ml
    JOIN user_profiles up ON up.id = ml.seller_id
    JOIN business_types bt ON bt.id = ml.business_type_id
    WHERE ml.status = 'active'
      AND ml.expires_at > NOW()
      AND (
        ml.seller_id = p_viewer_id
        OR (
            ml.listed_at <= NOW()
            AND EXISTS (
                SELECT 1 FROM friendships f
                WHERE f.status = 'accepted'
                  AND (
                    (f.user_id = p_viewer_id AND f.friend_id = ml.seller_id)
                    OR (f.user_id = ml.seller_id AND f.friend_id = p_viewer_id)
                  )
            )
            AND NOT EXISTS (
                SELECT 1 FROM friend_visibility_settings fvs
                WHERE fvs.owner_id = ml.seller_id
                  AND fvs.friend_id = p_viewer_id
                  AND fvs.show_marketplace = false
            )
        )
      )
    ORDER BY ml.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_marketplace_listings(UUID) TO authenticated;

-- ─── purchase_marketplace_listing: defense in depth, mirroring the
-- friendship check above it. Byte-for-byte identical to the live version
-- (20260726020000_marketplace_listing_queue.sql) otherwise. ───
CREATE OR REPLACE FUNCTION purchase_marketplace_listing(
    p_buyer_id UUID,
    p_listing_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_listing marketplace_listings%ROWTYPE;
    v_business_type_name TEXT;
    v_buyer_cash NUMERIC;
    v_is_friend BOOLEAN;
    v_purchase_id UUID;
BEGIN
    IF p_buyer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_listing FROM marketplace_listings WHERE id = p_listing_id FOR UPDATE;

    IF v_listing.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
    END IF;
    IF v_listing.status <> 'active' OR v_listing.expires_at <= NOW() OR v_listing.listed_at > NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Listing is no longer available');
    END IF;
    IF v_listing.seller_id = p_buyer_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You cannot purchase your own listing');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM friendships f
        WHERE f.status = 'accepted'
          AND (
            (f.user_id = p_buyer_id AND f.friend_id = v_listing.seller_id)
            OR (f.user_id = v_listing.seller_id AND f.friend_id = p_buyer_id)
          )
    ) INTO v_is_friend;
    IF NOT v_is_friend THEN
        RETURN jsonb_build_object('success', false, 'error', 'You can only purchase listings from friends');
    END IF;

    IF EXISTS (
        SELECT 1 FROM friend_visibility_settings fvs
        WHERE fvs.owner_id = v_listing.seller_id
          AND fvs.friend_id = p_buyer_id
          AND fvs.show_marketplace = false
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This listing is not available for you to purchase');
    END IF;

    SELECT cash INTO v_buyer_cash FROM user_profiles WHERE id = p_buyer_id;
    IF v_buyer_cash IS NULL OR v_buyer_cash < v_listing.listing_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
    END IF;

    SELECT bt.name INTO v_business_type_name FROM business_types bt WHERE bt.id = v_listing.business_type_id;

    UPDATE marketplace_listings
    SET status = 'sold', buyer_id = p_buyer_id, sold_at = NOW()
    WHERE id = p_listing_id;

    INSERT INTO marketplace_purchases (
        listing_id, buyer_id, business_type_id, business_name, business_icon,
        base_cost, earnings_per_completion, purchase_price
    ) VALUES (
        v_listing.id, p_buyer_id, v_listing.business_type_id, v_business_type_name, v_listing.business_icon,
        v_listing.base_cost, v_listing.earnings_per_completion, v_listing.listing_price
    ) RETURNING id INTO v_purchase_id;

    PERFORM adjust_user_cash(p_buyer_id, -v_listing.listing_price);
    PERFORM adjust_user_cash(v_listing.seller_id, v_listing.listing_price);

    -- The seller's own Weekly Receipt ledger entry still uses their own
    -- freeform business_name here — this is the seller's own private record
    -- of their own sale, not something shown to the buyer.
    IF v_listing.reason = 'habit_deletion' THEN
        INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
        VALUES (v_listing.seller_id, v_listing.habit_business_id, v_listing.business_name, v_business_type_name, v_listing.listing_price, v_listing.streak_at_listing);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'purchase_id', v_purchase_id,
        'purchase_price', v_listing.listing_price
    );
END;
$$;
GRANT EXECUTE ON FUNCTION purchase_marketplace_listing(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
