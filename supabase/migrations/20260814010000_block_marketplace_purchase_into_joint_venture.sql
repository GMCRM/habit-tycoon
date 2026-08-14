-- Fix: buying a business from the Marketplace and merging it into an
-- existing business let the buyer pick one of their joint ventures as the
-- merge target. resolve_marketplace_purchase() only ever checked
-- `hb.user_id = p_buyer_id AND hb.is_active = true` on the target row —
-- never `is_joint_venture` — so a co-owner (whose auth.uid() still equals
-- the JV row's user_id) could instantly overwrite business_type_id/cost/
-- earnings on a shared business, entirely outside the group-payment flow
-- (propose_joint_venture_upgrade / pay_joint_venture_upgrade_share): no
-- consent and no payment from the other co-owner(s).
--
-- This is exactly the hole 20260807030000_joint_venture_core_schema.sql's
-- "Users can update own habit businesses" RLS policy
-- (`auth.uid() = user_id AND NOT is_joint_venture`) was written to close,
-- and exactly what upgradeHabitBusiness()'s own is_joint_venture guard in
-- habit-business.service.ts calls out as needing defense-in-depth for —
-- but resolve_marketplace_purchase() is SECURITY DEFINER, so it bypasses
-- RLS entirely and never carried that same check itself.
--
-- Fix: reject a joint venture as a merge target with the same message the
-- app already uses for the equivalent single-owner guards, before any
-- money or rows change. The "start a new habit" resolution path is
-- unaffected — it never touches an existing business.

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
    v_target_business_type_id INTEGER;
    v_target_bonus_percent SMALLINT;
    v_target_is_joint_venture BOOLEAN;
    v_new_base_value NUMERIC;
    v_new_earnings NUMERIC;
    v_bonus_percent SMALLINT;
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

    -- 70% of the business's tier price (never decays), not 70% of the sale
    -- price (would compound the discount on every resale).
    v_new_base_value := FLOOR(v_purchase.base_cost * 0.7);

    -- Same capped streak-bonus formula as the listing price
    -- (calculateMarketplaceListingPrice() / create_marketplace_listing()) — the
    -- buyer paid for this bonus, so it now becomes their business's base pay.
    v_bonus_percent := LEAST(GREATEST(v_purchase.streak_at_purchase, 0), 100);
    v_new_earnings := ROUND(
        v_purchase.earnings_per_completion * (1 + v_bonus_percent * 0.01),
        2
    );

    IF p_target_habit_business_id IS NOT NULL THEN
        SELECT bt.base_cost, hb.business_type_id, hb.marketplace_bonus_percent, hb.is_joint_venture
        INTO v_target_base_cost, v_target_business_type_id, v_target_bonus_percent, v_target_is_joint_venture
        FROM habit_businesses hb
        JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.id = p_target_habit_business_id
          AND hb.user_id = p_buyer_id
          AND hb.is_active = true;

        IF v_target_base_cost IS NULL THEN
            RAISE EXCEPTION 'Target business not found';
        END IF;
        IF v_target_is_joint_venture THEN
            RAISE EXCEPTION 'This is a joint venture — use the group upgrade flow instead.';
        END IF;
        IF v_target_base_cost > v_purchase.base_cost THEN
            RAISE EXCEPTION 'Target business is a higher level than the purchased business';
        END IF;

        IF v_target_business_type_id = v_purchase.business_type_id THEN
            -- Same business type: a true merge/absorption, not a displacement.
            -- Stack the bonus percents (capped at 100) instead of one
            -- replacing the other, and don't list the old business — it
            -- isn't being displaced, it's being combined into this one.
            v_bonus_percent := LEAST(COALESCE(v_target_bonus_percent, 0) + v_bonus_percent, 100);
            v_new_earnings := ROUND(v_purchase.earnings_per_completion * (1 + v_bonus_percent * 0.01), 2);
        ELSE
            -- Different business type: the old business is being displaced by
            -- a different one ("upgrade"), so list it on the Marketplace
            -- before it's overwritten below — matches upgradeHabitBusiness()
            -- and the joint-venture upgrade RPC's own listing step. Kept
            -- non-fatal: the purchase resolution always proceeds regardless
            -- of whether this listing succeeds.
            BEGIN
                PERFORM create_marketplace_listing(p_buyer_id, p_target_habit_business_id, 'upgrade');
            EXCEPTION WHEN OTHERS THEN
                NULL; -- non-fatal, matches the single-owner upgradeHabitBusiness() flow's own tolerance
            END;
        END IF;

        -- business_name/habit_description are the habit's own identity and are
        -- deliberately left untouched here — only the underlying business
        -- (type/icon/cost/earnings) is being swapped out.
        UPDATE habit_businesses
        SET business_type_id = v_purchase.business_type_id,
            business_icon = v_purchase.business_icon,
            cost = v_purchase.base_cost,
            earnings_per_completion = v_new_earnings,
            marketplace_base_value = v_new_base_value,
            marketplace_bonus_percent = NULLIF(v_bonus_percent, 0),
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
            display_order, user_custom_order, is_active, marketplace_base_value, marketplace_bonus_percent
        ) VALUES (
            p_buyer_id, v_purchase.business_type_id,
            COALESCE(NULLIF(TRIM(p_business_name), ''), v_purchase.business_name),
            v_purchase.business_icon, v_purchase.base_cost,
            p_habit_description, p_recurrence_interval, 'daily',
            CASE WHEN p_recurrence_interval = 'specific_days' THEN COALESCE(p_active_days, ARRAY[]::INTEGER[]) ELSE NULL END,
            p_goal_value,
            0, v_new_earnings, 0, 0, 0,
            v_next_order, v_next_order, true, v_new_base_value, NULLIF(v_bonus_percent, 0)
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
