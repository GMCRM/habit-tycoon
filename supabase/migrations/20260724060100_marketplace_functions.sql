-- Business Marketplace: RPCs
--
-- Modeled directly on purchase_stock_shares() (20260724020000_prevent_stock_pump_and_dump.sql)
-- for the atomic cross-account money+ownership transfer, and on
-- get_stock_owners()/get_weekly_receipt() for friend-scoped SECURITY DEFINER
-- reads. Unlike purchase_stock_shares (which trusts a caller-supplied
-- buyer_id with no auth.uid() check), every function here verifies the
-- caller-supplied "acting user" id against auth.uid() — these RPCs move real
-- cash between two different players' accounts, so a stricter check than the
-- existing precedent is warranted.

-- ─── 1. Browse: a viewer's own listings + their accepted friends' listings ───
DROP FUNCTION IF EXISTS get_friend_marketplace_listings(UUID);
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
        ml.business_name,
        ml.business_icon,
        ml.base_cost,
        ml.earnings_per_completion,
        ml.base_sell_value,
        ml.streak_at_listing,
        ml.listing_price,
        ml.reason,
        ml.created_at,
        ml.expires_at,
        (ml.seller_id = p_viewer_id)
    FROM marketplace_listings ml
    JOIN user_profiles up ON up.id = ml.seller_id
    WHERE ml.status = 'active'
      AND ml.expires_at > NOW()
      AND (
        ml.seller_id = p_viewer_id
        OR EXISTS (
            SELECT 1 FROM friendships f
            WHERE f.status = 'accepted'
              AND (
                (f.user_id = p_viewer_id AND f.friend_id = ml.seller_id)
                OR (f.user_id = ml.seller_id AND f.friend_id = p_viewer_id)
              )
        )
      )
    ORDER BY ml.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_marketplace_listings(UUID) TO authenticated;

-- ─── 2. Purchase: atomic money + listing-closure transfer ───
DROP FUNCTION IF EXISTS purchase_marketplace_listing(UUID, UUID);
CREATE OR REPLACE FUNCTION purchase_marketplace_listing(
    p_buyer_id UUID,
    p_listing_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_listing marketplace_listings%ROWTYPE;
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
    IF v_listing.status <> 'active' OR v_listing.expires_at <= NOW() THEN
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
    PERFORM adjust_user_cash(v_listing.seller_id, v_listing.listing_price);

    -- A "deleting the habit" listing that sells is a real sale of the seller's own
    -- business — log it to the Weekly Receipt ledger, same as the old instant-sale
    -- flow did. An "upgrade" listing selling is not logged here: the seller already
    -- received their upgrade benefit, this is a bonus the receipt doesn't itemize.
    IF v_listing.reason = 'habit_deletion' THEN
        INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
        SELECT v_listing.seller_id, v_listing.habit_business_id, v_listing.business_name, bt.name, v_listing.listing_price, v_listing.streak_at_listing
        FROM business_types bt WHERE bt.id = v_listing.business_type_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'purchase_id', v_purchase_id,
        'purchase_price', v_listing.listing_price
    );
END;
$$;
GRANT EXECUTE ON FUNCTION purchase_marketplace_listing(UUID, UUID) TO authenticated;

-- ─── 3. Resolve a purchase: merge into an existing business, or spin up a new habit ───
DROP FUNCTION IF EXISTS resolve_marketplace_purchase(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER[]);
CREATE OR REPLACE FUNCTION resolve_marketplace_purchase(
    p_buyer_id UUID,
    p_purchase_id UUID,
    p_target_habit_business_id UUID DEFAULT NULL,
    p_habit_description TEXT DEFAULT NULL,
    p_recurrence_interval TEXT DEFAULT NULL,
    p_goal_value INTEGER DEFAULT NULL,
    p_active_days INTEGER[] DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_purchase marketplace_purchases%ROWTYPE;
    v_target_base_cost NUMERIC;
    v_new_base_value NUMERIC;
    v_next_order INTEGER;
    v_result_id UUID;
BEGIN
    IF p_buyer_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_purchase FROM marketplace_purchases
    WHERE id = p_purchase_id AND buyer_id = p_buyer_id AND resolved = false
    FOR UPDATE;

    IF v_purchase.id IS NULL THEN
        RAISE EXCEPTION 'Purchase not found or already resolved';
    END IF;

    v_new_base_value := ROUND(v_purchase.purchase_price * 0.7, 2);

    IF p_target_habit_business_id IS NOT NULL THEN
        SELECT bt.base_cost INTO v_target_base_cost
        FROM habit_businesses hb
        JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.id = p_target_habit_business_id
          AND hb.user_id = p_buyer_id
          AND hb.is_active = true;

        IF v_target_base_cost IS NULL THEN
            RAISE EXCEPTION 'Target business not found';
        END IF;
        IF v_target_base_cost > v_purchase.base_cost THEN
            RAISE EXCEPTION 'Target business is a higher level than the purchased business';
        END IF;

        UPDATE habit_businesses
        SET business_type_id = v_purchase.business_type_id,
            business_name = v_purchase.business_name,
            business_icon = v_purchase.business_icon,
            cost = v_purchase.base_cost,
            earnings_per_completion = v_purchase.earnings_per_completion,
            marketplace_base_value = v_new_base_value,
            updated_at = NOW()
        WHERE id = p_target_habit_business_id;

        v_result_id := p_target_habit_business_id;
    ELSE
        IF p_habit_description IS NULL OR p_recurrence_interval IS NULL OR p_goal_value IS NULL THEN
            RAISE EXCEPTION 'habit_description, recurrence_interval, and goal_value are required to start a new habit';
        END IF;
        IF p_goal_value < 1 OR p_goal_value > 20 THEN
            RAISE EXCEPTION 'Goal value must be between 1 and 20';
        END IF;

        SELECT COALESCE(COUNT(*), 0) + 1 INTO v_next_order
        FROM habit_businesses WHERE user_id = p_buyer_id AND is_active = true;

        INSERT INTO habit_businesses (
            user_id, business_type_id, business_name, business_icon, cost,
            habit_description, recurrence_interval, frequency, active_days, goal_value,
            current_progress, earnings_per_completion, streak, total_completions, total_earnings,
            display_order, user_custom_order, is_active, marketplace_base_value
        ) VALUES (
            p_buyer_id, v_purchase.business_type_id, v_purchase.business_name, v_purchase.business_icon, v_purchase.base_cost,
            p_habit_description, p_recurrence_interval, 'daily',
            CASE WHEN p_recurrence_interval = 'specific_days' THEN COALESCE(p_active_days, ARRAY[]::INTEGER[]) ELSE NULL END,
            p_goal_value,
            0, v_purchase.earnings_per_completion, 0, 0, 0,
            v_next_order, v_next_order, true, v_new_base_value
        ) RETURNING id INTO v_result_id;
    END IF;

    UPDATE marketplace_purchases
    SET resolved = true, resolved_habit_business_id = v_result_id
    WHERE id = p_purchase_id;

    PERFORM recalculate_net_worth(p_buyer_id);

    RETURN v_result_id;
END;
$$;
GRANT EXECUTE ON FUNCTION resolve_marketplace_purchase(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER[]) TO authenticated;

-- ─── 4. Lazy expiry settlement — no scheduler exists in this project, so this
-- runs on demand whenever the calling user's own Marketplace tab loads ───
DROP FUNCTION IF EXISTS resolve_expired_marketplace_listings(UUID);
CREATE OR REPLACE FUNCTION resolve_expired_marketplace_listings(p_user_id UUID) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_listing RECORD;
    v_settled_count INTEGER := 0;
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

        PERFORM adjust_user_cash(p_user_id, v_listing.listing_price);

        INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
        SELECT p_user_id, v_listing.habit_business_id, v_listing.business_name, bt.name, v_listing.listing_price, v_listing.streak_at_listing
        FROM business_types bt WHERE bt.id = v_listing.business_type_id;

        v_settled_count := v_settled_count + 1;
    END LOOP;

    -- Upgrade listings just vanish — the player already got the immediate upgrade
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
