-- purchase_marketplace_listing() only logged a business_sales row (the
-- ledger the Weekly Receipt reads for "Sold business — X") when the listing's
-- reason was 'habit_deletion'. 'upgrade'-reason listings (the old business
-- left behind after upgrading) pay the seller via adjust_user_cash() same as
-- any other sale, but that cash never got itemized on the receipt. Log both
-- reasons the same way — a successful sale is a successful sale regardless
-- of why the business was listed.

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

    -- Log the seller's proceeds to the Weekly Receipt ledger regardless of why
    -- the business was listed (habit deletion or upgrade) — a successful sale
    -- moves real cash into the seller's account either way.
    INSERT INTO business_sales (user_id, habit_business_id, business_name, business_type_name, sell_value, streak_at_sale)
    SELECT v_listing.seller_id, v_listing.habit_business_id, v_listing.business_name, bt.name, v_listing.listing_price, v_listing.streak_at_listing
    FROM business_types bt WHERE bt.id = v_listing.business_type_id;

    RETURN jsonb_build_object(
        'success', true,
        'purchase_id', v_purchase_id,
        'purchase_price', v_listing.listing_price
    );
END;
$$;
GRANT EXECUTE ON FUNCTION purchase_marketplace_listing(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
