-- marketplace_listings has no INSERT policy by design (see
-- 20260724060000_marketplace_schema.sql) — every write was meant to go through
-- a SECURITY DEFINER RPC. createMarketplaceListing() in
-- habit-business.service.ts was left doing a raw client insert instead, which
-- RLS rejects ("new row violates row-level security policy for table
-- marketplace_listings") the moment a habit is deleted or upgraded. This adds
-- the missing RPC and the service now calls it instead of inserting directly.

CREATE OR REPLACE FUNCTION create_marketplace_listing(
    p_user_id UUID,
    p_habit_business_id UUID,
    p_reason TEXT
) RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_business habit_businesses%ROWTYPE;
    v_base_sell_value NUMERIC;
    v_listing_price NUMERIC;
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

    INSERT INTO marketplace_listings (
        seller_id, habit_business_id, business_type_id, business_name, business_icon,
        base_cost, earnings_per_completion, base_sell_value, streak_at_listing, listing_price, reason
    ) VALUES (
        p_user_id, v_business.id, v_business.business_type_id, v_business.business_name, v_business.business_icon,
        v_business.cost, v_business.earnings_per_completion, v_base_sell_value, COALESCE(v_business.streak, 0), v_listing_price, p_reason
    );

    RETURN v_listing_price;
END;
$$;
GRANT EXECUTE ON FUNCTION create_marketplace_listing(UUID, UUID, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
