-- get_friend_marketplace_listings() returned marketplace_listings.business_name,
-- which is the seller's own custom name for their habit (e.g. "aa", "Morning Jog
-- Coffee Shop") — set when they created the habit, and copied verbatim onto the
-- listing at create_marketplace_listing() time. Showing a stranger's freeform
-- text as the marketplace card title is confusing and occasionally exposes a
-- name the seller never intended other people to see. Swap it for the
-- canonical business_types.name (e.g. "Coffee Shop"), joined via the
-- business_type_id already stored on the listing — same pattern already used
-- for business_sales.business_type_name in purchase_marketplace_listing().
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
        bt.name,
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
    JOIN business_types bt ON bt.id = ml.business_type_id
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

NOTIFY pgrst, 'reload schema';
