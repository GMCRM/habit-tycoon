-- Anti-flip queueing: without this, a player could buy a friend's business
-- then immediately delete/upgrade it to relist it (or churn their own
-- businesses back-to-back) for a fast, low-effort chain of guaranteed
-- payouts. This staggers a single seller's *new* listings so at most two of
-- their listings are ever live on the Marketplace at once, at least 12h
-- apart:
--
--   1st deletion/upgrade → listed immediately
--   2nd (queued right after) → listed 12h after the 1st's listed_at
--   3rd (queued right after) → listed 12h after the 2nd's listed_at (24h after the 1st)
--   ...and so on. Each listing still runs for a full 24h once it actually
--   lands on the market — that window is now anchored to listed_at, not to
--   whenever the listing row was inserted (created_at).
--
-- The chain isn't a stored counter — it's derived by taking the seller's
-- most recent listed_at (regardless of that listing's current status) and
-- adding 12h, floored at "now". Once real time catches up past that point
-- (i.e. the player hasn't deleted/upgraded anything in a while), the chain
-- naturally collapses back to "list immediately" with no explicit reset step.

ALTER TABLE marketplace_listings
    ADD COLUMN IF NOT EXISTS listed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW());

-- Backfill: existing rows were listed the moment they were created.
UPDATE marketplace_listings SET listed_at = created_at WHERE listed_at IS DISTINCT FROM created_at;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_listed_at ON marketplace_listings(seller_id, listed_at DESC);

-- ─── create_marketplace_listing: now schedules listed_at/expires_at instead
-- of always listing immediately, and returns both so the client can tell the
-- seller when their listing will actually appear. ───
DROP FUNCTION IF EXISTS create_marketplace_listing(UUID, UUID, TEXT);
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
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;
    IF p_reason NOT IN ('upgrade', 'habit_deletion') THEN
        RAISE EXCEPTION 'Invalid reason';
    END IF;

    SELECT * INTO v_business FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = p_user_id;

    IF v_business.id IS NULL THEN
        RAISE EXCEPTION 'Habit business not found or not owned by user';
    END IF;

    -- Mirrors getBaseSellValue()/calculateMarketplaceListingPrice() in
    -- habit-business.service.ts — kept in sync manually, same as that
    -- service's own getMarketplaceListingPrice() preview method.
    v_base_sell_value := COALESCE(v_business.marketplace_base_value, FLOOR(v_business.cost * 0.7));
    v_listing_price := ROUND(v_base_sell_value * (1 + LEAST(GREATEST(COALESCE(v_business.streak, 0), 0), 100) * 0.01), 2);

    -- Stagger against this seller's own most recently *scheduled* listing
    -- (whatever its current status) — see file header for the chain logic.
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

-- ─── get_friend_marketplace_listings: friends must never see a listing
-- before its scheduled listed_at, but the seller can see (and the client can
-- render as "queued") their own not-yet-live listings. ───
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
        )
      )
    ORDER BY ml.created_at DESC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_friend_marketplace_listings(UUID) TO authenticated;

-- ─── purchase_marketplace_listing: defense in depth — a listing's UUID is
-- unguessable and browse already hides not-yet-live rows from friends, but
-- the RPC itself should still refuse to sell something that hasn't listed yet. ───
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
