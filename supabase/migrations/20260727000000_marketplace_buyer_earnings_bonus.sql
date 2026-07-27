-- Bug fix: the streak bonus shown on a listing (e.g. "+23%", getStreakBonusPercent()
-- in social.page.ts) is baked into the listing_price the buyer pays, but was never
-- applied to the earnings_per_completion the buyer's business ends up with —
-- resolve_marketplace_purchase() copied the seller's earnings_per_completion
-- straight across, so the buyer paid a premium for the streak bonus and got
-- nothing extra for it. The bonus is meant to permanently boost the new owner's
-- base pay by that same percentage.
--
-- streak_at_listing (needed to recompute the percentage) wasn't carried onto
-- marketplace_purchases, only onto marketplace_listings — add it here so
-- resolve_marketplace_purchase() can apply the same capped bonus formula used
-- everywhere else (LEAST(GREATEST(streak,0),100) * 0.01).

ALTER TABLE marketplace_purchases
    ADD COLUMN IF NOT EXISTS streak_at_purchase INTEGER NOT NULL DEFAULT 0;

-- Backfill: purchases still awaiting buyer setup can recover their streak from
-- the still-existing listing row.
UPDATE marketplace_purchases mp
SET streak_at_purchase = ml.streak_at_listing
FROM marketplace_listings ml
WHERE ml.id = mp.listing_id
  AND mp.resolved = false;

-- ─── purchase_marketplace_listing: also stash streak_at_listing onto the purchase ───
DROP FUNCTION IF EXISTS purchase_marketplace_listing(UUID, UUID);
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
        base_cost, earnings_per_completion, purchase_price, streak_at_purchase
    ) VALUES (
        v_listing.id, p_buyer_id, v_listing.business_type_id, v_business_type_name, v_listing.business_icon,
        v_listing.base_cost, v_listing.earnings_per_completion, v_listing.listing_price, v_listing.streak_at_listing
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

-- ─── resolve_marketplace_purchase: apply the streak bonus to the earnings
-- the buyer's business actually gets, same capped formula as the listing price ───
DROP FUNCTION IF EXISTS resolve_marketplace_purchase(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER[], TEXT);
CREATE OR REPLACE FUNCTION resolve_marketplace_purchase(
    p_buyer_id UUID,
    p_purchase_id UUID,
    p_target_habit_business_id UUID DEFAULT NULL,
    p_habit_description TEXT DEFAULT NULL,
    p_recurrence_interval TEXT DEFAULT NULL,
    p_goal_value INTEGER DEFAULT NULL,
    p_active_days INTEGER[] DEFAULT NULL,
    p_business_name TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_purchase marketplace_purchases%ROWTYPE;
    v_target_base_cost NUMERIC;
    v_new_base_value NUMERIC;
    v_new_earnings NUMERIC;
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

    -- Same capped streak-bonus formula as the listing price
    -- (calculateMarketplaceListingPrice() / create_marketplace_listing()) — the
    -- buyer paid for this bonus, so it now becomes their business's base pay.
    v_new_earnings := ROUND(
        v_purchase.earnings_per_completion
            * (1 + LEAST(GREATEST(v_purchase.streak_at_purchase, 0), 100) * 0.01),
        2
    );

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
            earnings_per_completion = v_new_earnings,
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
            p_buyer_id, v_purchase.business_type_id,
            COALESCE(NULLIF(TRIM(p_business_name), ''), v_purchase.business_name),
            v_purchase.business_icon, v_purchase.base_cost,
            p_habit_description, p_recurrence_interval, 'daily',
            CASE WHEN p_recurrence_interval = 'specific_days' THEN COALESCE(p_active_days, ARRAY[]::INTEGER[]) ELSE NULL END,
            p_goal_value,
            0, v_new_earnings, 0, 0, 0,
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
GRANT EXECUTE ON FUNCTION resolve_marketplace_purchase(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER[], TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
