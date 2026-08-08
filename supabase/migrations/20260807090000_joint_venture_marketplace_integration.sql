-- Joint Venture — Marketplace integration.
--
-- Three changes, each gated on the underlying business being a joint
-- venture (business_co_owners having rows for it) so every branch is a
-- no-op for every listing that exists today:
--
-- 1. create_marketplace_listing: let ANY co-owner trigger a listing on the
--    venture's behalf (needed because the co-owner who happens to be the
--    LAST one to pay an upgrade share, or the last one to push a deletion
--    vote past the threshold, isn't necessarily the creator) while p_user_id
--    itself stays pinned to the creator, matching the row's user_id and the
--    existing per-seller listing-throttle logic.
-- 2. purchase_marketplace_listing: no co-owner may buy back their own
--    venture's old-tier/deleted listing (same rule as stock exclusion), and
--    proceeds split evenly across all co-owners instead of paying one seller.
-- 3. resolve_expired_marketplace_listings: the same split-payout treatment
--    for the habit_deletion guaranteed-payout-on-expiry branch.

-- ─── 1. create_marketplace_listing: relax the caller check ───
CREATE OR REPLACE FUNCTION create_marketplace_listing(
    p_user_id UUID,
    p_habit_business_id UUID,
    p_reason TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_business habit_businesses%ROWTYPE;
    v_base_sell_value NUMERIC;
    v_listing_price NUMERIC;
    v_prev_listed_at TIMESTAMPTZ;
    v_listed_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
BEGIN
    IF p_reason NOT IN ('upgrade', 'habit_deletion') THEN
        RAISE EXCEPTION 'Invalid reason';
    END IF;

    SELECT * INTO v_business FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = p_user_id;

    IF v_business.id IS NULL THEN
        RAISE EXCEPTION 'Habit business not found or not owned by user';
    END IF;

    IF NOT (
        p_user_id = auth.uid()
        OR (
            v_business.is_joint_venture AND EXISTS (
                SELECT 1 FROM business_co_owners bco
                WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = auth.uid()
            )
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Mirrors getBaseSellValue()/calculateMarketplaceListingPrice() in
    -- habit-business.service.ts — kept in sync manually, same as that
    -- service's own getMarketplaceListingPrice() preview method.
    v_base_sell_value := COALESCE(v_business.marketplace_base_value, FLOOR(v_business.cost * 0.7));
    v_listing_price := ROUND(v_base_sell_value * (1 + LEAST(GREATEST(COALESCE(v_business.streak, 0), 0), 100) * 0.01), 2);

    -- Stagger against this seller's own most recently *scheduled* listing
    -- (whatever its current status) — see the queueing migration's own
    -- header for the chain logic.
    SELECT MAX(listed_at) INTO v_prev_listed_at
    FROM marketplace_listings WHERE seller_id = p_user_id;

    IF v_prev_listed_at IS NULL THEN
        v_listed_at := NOW();
    ELSE
        v_listed_at := GREATEST(NOW(), v_prev_listed_at + INTERVAL '12 hours');
    END IF;
    v_expires_at := v_listed_at + INTERVAL '24 hours';

    INSERT INTO marketplace_listings (
        seller_id, habit_business_id, business_type_id, business_name, business_icon,
        base_cost, earnings_per_completion, base_sell_value, streak_at_listing, listing_price, reason,
        listed_at, expires_at
    ) VALUES (
        p_user_id, v_business.id, v_business.business_type_id, v_business.business_name, v_business.business_icon,
        v_business.cost, v_business.earnings_per_completion, v_base_sell_value, COALESCE(v_business.streak, 0), v_listing_price, p_reason,
        v_listed_at, v_expires_at
    );

    RETURN jsonb_build_object(
        'listing_price', v_listing_price,
        'listed_at', v_listed_at
    );
END;
$$;
GRANT EXECUTE ON FUNCTION create_marketplace_listing(UUID, UUID, TEXT) TO authenticated;

-- ─── 2. purchase_marketplace_listing: co-owner buyback exclusion + split
-- proceeds. Behaviorally identical to the live version for every non-JV
-- listing (v_co_owner_count = 1 in that case, so the "split" degenerates to
-- exactly the original single-seller payout). ───
CREATE OR REPLACE FUNCTION purchase_marketplace_listing(
    p_buyer_id UUID,
    p_listing_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_listing marketplace_listings%ROWTYPE;
    v_buyer_cash NUMERIC;
    v_is_friend BOOLEAN;
    v_purchase_id UUID;
    v_business_type_name TEXT;
    v_co_owner_count INTEGER;
    v_per_owner_cut NUMERIC;
    v_remainder_cents INTEGER;
    v_owner_index INTEGER := 0;
    v_cut NUMERIC;
    v_co_owner_id UUID;
BEGIN
    IF p_buyer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_listing FROM marketplace_listings WHERE id = p_listing_id FOR UPDATE;

    IF v_listing.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
    END IF;
    IF v_listing.status <> 'active' OR v_listing.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Listing is no longer available');
    END IF;
    IF v_listing.seller_id = p_buyer_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'You cannot purchase your own listing');
    END IF;
    IF EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = v_listing.habit_business_id AND bco.user_id = p_buyer_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You cannot purchase your own joint venture''s listing');
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

    SELECT cash INTO v_buyer_cash FROM user_profiles WHERE id = p_buyer_id;
    IF v_buyer_cash IS NULL OR v_buyer_cash < v_listing.listing_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
    END IF;

    UPDATE marketplace_listings
    SET status = 'sold', buyer_id = p_buyer_id, sold_at = NOW()
    WHERE id = p_listing_id;

    INSERT INTO marketplace_purchases (
        listing_id, buyer_id, business_type_id, business_name, business_icon,
        base_cost, earnings_per_completion, purchase_price
    ) VALUES (
        v_listing.id, p_buyer_id, v_listing.business_type_id, v_listing.business_name, v_listing.business_icon,
        v_listing.base_cost, v_listing.earnings_per_completion, v_listing.listing_price
    ) RETURNING id INTO v_purchase_id;

    PERFORM adjust_user_cash(p_buyer_id, -v_listing.listing_price);

    SELECT COUNT(*) INTO v_co_owner_count FROM business_co_owners WHERE habit_business_id = v_listing.habit_business_id;
    SELECT bt.name INTO v_business_type_name FROM business_types bt WHERE bt.id = v_listing.business_type_id;

    IF v_co_owner_count > 0 THEN
        -- Joint venture: split evenly, rounded down to the cent per owner,
        -- with the leftover pennies (always < co-owner count many) handed
        -- out one at a time in a stable order so the total paid out always
        -- equals listing_price exactly.
        v_per_owner_cut := FLOOR(v_listing.listing_price / v_co_owner_count * 100) / 100;
        v_remainder_cents := ROUND((v_listing.listing_price - v_per_owner_cut * v_co_owner_count) * 100);

        FOR v_co_owner_id IN SELECT user_id FROM business_co_owners WHERE habit_business_id = v_listing.habit_business_id ORDER BY user_id ASC LOOP
            v_owner_index := v_owner_index + 1;
            v_cut := v_per_owner_cut + (CASE WHEN v_owner_index <= v_remainder_cents THEN 0.01 ELSE 0 END);
            PERFORM adjust_user_cash(v_co_owner_id, v_cut);
            INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
            VALUES (v_co_owner_id, v_listing.habit_business_id, v_listing.business_name, v_business_type_name, v_cut, v_listing.streak_at_listing);
        END LOOP;
    ELSE
        -- Single-owner: unchanged from the live behavior.
        PERFORM adjust_user_cash(v_listing.seller_id, v_listing.listing_price);
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

-- ─── 3. resolve_expired_marketplace_listings: same split-payout treatment
-- for the habit_deletion guaranteed-payout branch. Behaviorally identical to
-- the live version for every non-JV listing. ───
CREATE OR REPLACE FUNCTION resolve_expired_marketplace_listings(p_user_id UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_listing RECORD;
    v_settled_count INTEGER := 0;
    v_business_type_name TEXT;
    v_co_owner_count INTEGER;
    v_per_owner_cut NUMERIC;
    v_remainder_cents INTEGER;
    v_owner_index INTEGER;
    v_cut NUMERIC;
    v_co_owner_id UUID;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Deleted-habit listings guarantee payout even if nobody bought them
    FOR v_listing IN
        SELECT id, listing_price, habit_business_id, business_name, business_type_id, streak_at_listing
        FROM marketplace_listings
        WHERE seller_id = p_user_id
          AND status = 'active'
          AND expires_at <= NOW()
          AND reason = 'habit_deletion'
        FOR UPDATE
    LOOP
        UPDATE marketplace_listings
        SET status = 'sold', payout_settled = true, sold_at = NOW()
        WHERE id = v_listing.id;

        SELECT bt.name INTO v_business_type_name FROM business_types bt WHERE bt.id = v_listing.business_type_id;
        SELECT COUNT(*) INTO v_co_owner_count FROM business_co_owners WHERE habit_business_id = v_listing.habit_business_id;

        IF v_co_owner_count > 0 THEN
            v_per_owner_cut := FLOOR(v_listing.listing_price / v_co_owner_count * 100) / 100;
            v_remainder_cents := ROUND((v_listing.listing_price - v_per_owner_cut * v_co_owner_count) * 100);
            v_owner_index := 0;
            FOR v_co_owner_id IN SELECT user_id FROM business_co_owners WHERE habit_business_id = v_listing.habit_business_id ORDER BY user_id ASC LOOP
                v_owner_index := v_owner_index + 1;
                v_cut := v_per_owner_cut + (CASE WHEN v_owner_index <= v_remainder_cents THEN 0.01 ELSE 0 END);
                PERFORM adjust_user_cash(v_co_owner_id, v_cut);
                INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
                VALUES (v_co_owner_id, v_listing.habit_business_id, v_listing.business_name, v_business_type_name, v_cut, v_listing.streak_at_listing);
            END LOOP;
        ELSE
            PERFORM adjust_user_cash(p_user_id, v_listing.listing_price);
            INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
            VALUES (p_user_id, v_listing.habit_business_id, v_listing.business_name, v_business_type_name, v_listing.listing_price, v_listing.streak_at_listing);
        END IF;

        v_settled_count := v_settled_count + 1;
    END LOOP;

    -- Upgrade listings just vanish — the player(s) already got the immediate upgrade
    UPDATE marketplace_listings
    SET status = 'expired'
    WHERE seller_id = p_user_id
      AND status = 'active'
      AND expires_at <= NOW()
      AND reason = 'upgrade';

    RETURN v_settled_count;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_expired_marketplace_listings(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
