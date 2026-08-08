-- Fix a regression introduced by 20260807020000_marketplace_upgrade_sale_receipt.sql
-- (and carried forward by 20260807090000_joint_venture_marketplace_integration.sql),
-- which redefined purchase_marketplace_listing() from an older copy of the
-- function and silently undid two earlier fixes:
--
-- 1. streak_at_purchase (added by 20260727000000_marketplace_buyer_earnings_bonus.sql)
--    was dropped from the INSERT INTO marketplace_purchases column list, so
--    every new purchase fell back to the column's DEFAULT 0. resolve_marketplace_purchase()
--    derives the buyer's streak-bonus % from this column, so every new
--    purchase since that regression baked in a 0% bonus regardless of the
--    listing's actual streak — the business got no boost even though the
--    buyer paid the listing's streak-inflated price for it.
--
-- 2. marketplace_purchases.business_name was set back to v_listing.business_name
--    (the seller's own private freeform habit name, e.g. "test habit name")
--    instead of the canonical business_types.name (e.g. "Lemonade Stand"),
--    undoing 20260726010000_fix_marketplace_purchase_seller_name_leak.sql.
--    The Weekly Receipt's "Bought — {business_name}" line therefore went
--    back to leaking the seller's old habit name instead of showing the
--    business type.
--
-- This migration restores both behaviors on the current (Joint-Venture-aware)
-- version of the function and backfills the rows written while it was broken.

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

    SELECT COUNT(*) INTO v_co_owner_count FROM business_co_owners WHERE habit_business_id = v_listing.habit_business_id;

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

-- ─── Backfill 1: restore the canonical business-type name on purchase rows
-- written while the regression was live, for both still-pending purchases
-- (buyer hasn't finished "Set Up Your Business" yet) and already-resolved
-- ones (so their Weekly Receipt line item shows correctly). ───
UPDATE marketplace_purchases mp
SET business_name = bt.name
FROM business_types bt
WHERE bt.id = mp.business_type_id
  AND mp.business_name IS DISTINCT FROM bt.name;

-- ─── Backfill 2: recover the lost streak_at_purchase from the still-existing
-- listing row, for purchases that show the regression's telltale 0. A
-- genuinely 0%-bonus purchase also has streak_at_listing = 0, so it's left
-- untouched (the UPDATE is then a no-op for it). ───
UPDATE marketplace_purchases mp
SET streak_at_purchase = ml.streak_at_listing
FROM marketplace_listings ml
WHERE ml.id = mp.listing_id
  AND mp.streak_at_purchase = 0
  AND ml.streak_at_listing <> 0;

-- ─── Backfill 3: for purchases already resolved into a habit_businesses row
-- while the bug was live, the 0%-bonus formula was baked permanently into
-- earnings_per_completion (new_earnings = base_earnings * (1 + 0) =
-- base_earnings exactly) and marketplace_bonus_percent was left NULL instead
-- of the real percentage. Recompute and correct both, but only for rows that
-- still show that exact telltale signature — a business that's since been
-- upgraded/merged again no longer matches and is correctly left alone. ───
UPDATE habit_businesses hb
SET earnings_per_completion = ROUND(mp.earnings_per_completion * (1 + LEAST(GREATEST(mp.streak_at_purchase, 0), 100) * 0.01), 2),
    marketplace_bonus_percent = NULLIF(LEAST(GREATEST(mp.streak_at_purchase, 0), 100), 0),
    updated_at = NOW()
FROM marketplace_purchases mp
WHERE mp.resolved_habit_business_id = hb.id
  AND mp.streak_at_purchase > 0
  AND hb.marketplace_bonus_percent IS NULL
  AND hb.earnings_per_completion = mp.earnings_per_completion
  AND hb.is_active = true;

NOTIFY pgrst, 'reload schema';
