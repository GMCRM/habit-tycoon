-- Bug fix: replacing an existing habit's business via the marketplace ("merge"
-- mode in resolve_marketplace_purchase(), p_target_habit_business_id IS NOT NULL)
-- was overwriting the habit's business_name with the purchased listing's
-- business-type name (e.g. "Lemonade Stand"), clobbering whatever custom name
-- the user had given that habit. habit_description was already left untouched
-- by this branch — only business_name needs to stop being overwritten so the
-- habit keeps its existing name and description across the business swap.

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

        -- business_name/habit_description are the habit's own identity and are
        -- deliberately left untouched here — only the underlying business
        -- (type/icon/cost/earnings) is being swapped out.
        UPDATE habit_businesses
        SET business_type_id = v_purchase.business_type_id,
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
