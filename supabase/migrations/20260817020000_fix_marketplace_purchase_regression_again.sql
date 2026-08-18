-- Fix a second regression of the same bug 20260808000000_fix_marketplace_purchase_regression.sql
-- already fixed once. 20260813000000_friend_visibility_settings.sql redefined
-- purchase_marketplace_listing() to add the friend-visibility check, but its
-- comment ("Byte-for-byte identical to the live version
-- (20260726020000_marketplace_listing_queue.sql) otherwise") pointed at a copy
-- of the function that predates BOTH of the following, silently undoing them
-- a second time:
--
-- 1. streak_at_purchase (restored by 20260808000000) was dropped from the
--    INSERT INTO marketplace_purchases column list again, so every purchase
--    since 20260813000000 fell back to the column's DEFAULT 0.
--    resolve_marketplace_purchase() derives the buyer's streak-bonus % from
--    this column, so every business bought through the Marketplace since then
--    got no "+X%" bonus baked into its earnings or shown as a badge, even
--    though the buyer paid the listing's streak-inflated price for it — this
--    is the bug reported against a shrimp boat purchase showing plain base pay.
--
-- 2. The joint-venture co-owner payout split (added by
--    20260807090000_joint_venture_marketplace_integration.sql) was dropped
--    entirely: a sold JV listing paid 100% of the proceeds to whichever
--    user_id sits in marketplace_listings.seller_id instead of splitting
--    evenly across all co-owners. The guard preventing a co-owner from buying
--    their own joint venture's listing was dropped along with it.
--
-- This migration restores both behaviors on top of the current
-- (friend-visibility-aware) version of the function, and backfills the
-- streak bonus for purchases written while it was broken (mirroring
-- 20260808000000's own backfill). It does not attempt to reconstruct or
-- redistribute any joint-venture payouts that were already paid out wrong
-- while bug #2 was live — that needs a manual accounting pass, not a blind
-- UPDATE, since money already moved to real user balances.

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
    IF v_listing.status <> 'active' OR v_listing.expires_at <= NOW() OR v_listing.listed_at > NOW() THEN
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

-- ─── Backfill 1: recover the lost streak_at_purchase from the still-existing
-- listing row, for purchases that show the regression's telltale 0. A
-- genuinely 0%-bonus purchase also has streak_at_listing = 0, so it's left
-- untouched (the UPDATE is then a no-op for it). ───
UPDATE marketplace_purchases mp
SET streak_at_purchase = ml.streak_at_listing
FROM marketplace_listings ml
WHERE ml.id = mp.listing_id
  AND mp.streak_at_purchase = 0
  AND ml.streak_at_listing <> 0;

-- ─── Backfill 2: for purchases already resolved into a habit_businesses row
-- while the bug was live, the 0%-bonus formula was baked permanently into
-- earnings_per_completion (new_earnings = base_earnings * (1 + 0) =
-- base_earnings exactly) and marketplace_bonus_percent was left NULL instead
-- of the real percentage.
--
-- A habit can have more than one marketplace_purchases row pointing at it
-- (e.g. two same-type purchases merged into the same habit one after the
-- other, stacking their bonuses — exactly the reported case: two Shrimp
-- Boats bought and added to one habit, meant to land around a stacked 50%+
-- bonus but showing plain base pay instead). Recover the correct stacked
-- bonus by walking each habit's purchases newest-first and summing bonus %
-- back through the trailing run of same-business-type purchases — matching
-- resolve_marketplace_purchase()'s own stacking rule, which resets instead of
-- stacking the moment a purchase's business_type_id differs from the one
-- before it. Capped at 100, same as the live formula.
--
-- Only touches rows that still show the exact telltale signature (bonus
-- badge missing and earnings still exactly equal to the latest purchase's
-- raw, un-boosted value) — a business that's since been upgraded/merged
-- again with the fixed function no longer matches and is correctly left
-- alone. Idempotent: re-running this is a no-op once marketplace_bonus_percent
-- is no longer NULL. ───
WITH ordered AS (
    SELECT
        mp.resolved_habit_business_id AS hb_id,
        mp.business_type_id,
        mp.earnings_per_completion,
        LEAST(GREATEST(mp.streak_at_purchase, 0), 100) AS bonus,
        ROW_NUMBER() OVER (PARTITION BY mp.resolved_habit_business_id ORDER BY mp.created_at DESC) AS rn
    FROM marketplace_purchases mp
    WHERE mp.resolved_habit_business_id IS NOT NULL
),
run_flag AS (
    SELECT o.hb_id, o.bonus, o.rn,
        MIN(CASE WHEN o.business_type_id = newest.business_type_id THEN 1 ELSE 0 END)
            OVER (PARTITION BY o.hb_id ORDER BY o.rn ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS still_matching
    FROM ordered o
    JOIN ordered newest ON newest.hb_id = o.hb_id AND newest.rn = 1
),
stacked AS (
    SELECT
        r.hb_id,
        LEAST(SUM(r.bonus) FILTER (WHERE r.still_matching = 1), 100) AS total_bonus,
        MAX(o.earnings_per_completion) FILTER (WHERE o.rn = 1) AS latest_raw_earnings
    FROM run_flag r
    JOIN ordered o ON o.hb_id = r.hb_id AND o.rn = r.rn
    GROUP BY r.hb_id
)
UPDATE habit_businesses hb
SET earnings_per_completion = ROUND(s.latest_raw_earnings * (1 + s.total_bonus * 0.01), 2),
    marketplace_bonus_percent = NULLIF(s.total_bonus, 0),
    updated_at = NOW()
FROM stacked s
WHERE hb.id = s.hb_id
  AND s.total_bonus > 0
  AND hb.marketplace_bonus_percent IS NULL
  AND hb.earnings_per_completion = s.latest_raw_earnings
  AND hb.is_active = true;

NOTIFY pgrst, 'reload schema';
