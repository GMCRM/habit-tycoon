-- Privacy fix: marketplace_purchases.business_name was copied verbatim from
-- marketplace_listings.business_name, which is the seller's own freeform name
-- for their habit (e.g. "test habit name") — never intended for a stranger to
-- see. It then surfaced directly to the buyer in the "Set Up Your Business"
-- modal (header, image alt text, and the prefilled/default new-habit name)
-- and got written onto the buyer's own habit_businesses row on the merge
-- path. This is the same leak already fixed for the browse-listings RPC in
-- 20260725010000_marketplace_listing_type_name.sql — apply the same fix here:
-- store the canonical business_types.name (e.g. "Coffee Shop") on the
-- purchase record instead of the seller's private text.
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

-- Backfill: any purchase still awaiting buyer setup right now was made under
-- the old code path and is still carrying the seller's private name — swap
-- it for the canonical business type name so it's fixed retroactively too.
UPDATE marketplace_purchases mp
SET business_name = bt.name
FROM business_types bt
WHERE bt.id = mp.business_type_id
  AND mp.resolved = false
  AND mp.business_name IS DISTINCT FROM bt.name;

NOTIFY pgrst, 'reload schema';
