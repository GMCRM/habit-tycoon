-- Atomic single-owner business-upgrade RPC.
--
-- upgradeHabitBusiness() in habit-business.service.ts currently orchestrates
-- an upgrade as 6 sequential, non-atomic client calls (auth check, read new
-- business type, read old business, read cash, insert Marketplace listing,
-- update the business row, update cash). A failure on the final cash-deduct
-- call leaves the business upgraded for free — the client code's own comment
-- admitted this ("In a production app, you'd want to use a database
-- transaction"). It also never recalculated net_worth afterward (unlike the
-- create/delete flows), and blindly deducted whatever cost the client
-- passed rather than the new tier's actual price.
--
-- This consolidates the whole flow into one transaction, the same way
-- complete_habit_business already did for habit completion, and mirrors
-- pay_joint_venture_upgrade_share's own upgrade-application block (snapshot
-- old business to Marketplace, non-fatal on failure, then mutate the row) —
-- the multi-owner version of this exact operation was already atomic.
--
-- Two BEFORE UPDATE triggers already fire on any UPDATE habit_businesses
-- regardless of caller, so this function doesn't reimplement them — their
-- exceptions simply propagate and roll back the whole transaction:
--   guard_habit_business_mutation_trigger — 24h upgrade cooldown, sets last_upgraded_at
--   trg_enforce_habit_tycoon_tier_gate — Habit Tycoon (tier 2) unlock gate
CREATE OR REPLACE FUNCTION upgrade_habit_business(
    p_user_id UUID,
    p_habit_business_id UUID,
    p_new_business_type_id INTEGER
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_habit habit_businesses%ROWTYPE;
    v_new_type business_types%ROWTYPE;
    v_cash NUMERIC;
    v_listing JSONB;
    v_listed_at TIMESTAMPTZ := NULL;
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Lock the row: serializes a double-tap / racing upgrade attempt, same
    -- reasoning as complete_habit_business's FOR UPDATE.
    SELECT * INTO v_habit FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found or you do not have permission to upgrade it';
    END IF;
    IF v_habit.is_joint_venture THEN
        -- Joint ventures upgrade via propose_joint_venture_upgrade() /
        -- pay_joint_venture_upgrade_share() — a group-payment flow, not this
        -- single-owner in-place mutation. Defense-in-depth (the RLS UPDATE
        -- policy already blocks the write below for a JV row).
        RAISE EXCEPTION 'This is a joint venture — use the group upgrade flow instead.';
    END IF;

    SELECT * INTO v_new_type FROM business_types WHERE id = p_new_business_type_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid new business type';
    END IF;
    IF v_new_type.base_cost <= v_habit.cost THEN
        RAISE EXCEPTION 'New business type must be a higher tier than the current one';
    END IF;

    -- Cost is derived from the tier's real price, not trusted from the
    -- caller — closes a hole the old client code had (it deducted whatever
    -- upgradeCost value was passed in without validating it against the
    -- actual tier price).
    SELECT cash INTO v_cash FROM user_profiles WHERE id = p_user_id;
    IF v_cash IS NULL OR v_cash < v_new_type.base_cost THEN
        RAISE EXCEPTION 'Insufficient funds. Need $%, but you only have $%', v_new_type.base_cost, COALESCE(v_cash, 0);
    END IF;

    -- Snapshot the old business onto the Marketplace before it's overwritten
    -- below. Non-fatal: the upgrade proceeds even if this insert fails,
    -- matching the existing (and the JV) upgrade flow's own tolerance.
    BEGIN
        SELECT create_marketplace_listing(p_user_id, p_habit_business_id, 'upgrade') INTO v_listing;
        v_listed_at := (v_listing->>'listed_at')::TIMESTAMPTZ;
    EXCEPTION WHEN OTHERS THEN
        v_listed_at := NULL;
    END;

    -- guard_habit_business_mutation_trigger enforces the 24h cooldown here
    -- (and sets last_upgraded_at); trg_enforce_habit_tycoon_tier_gate
    -- enforces the tier-2 unlock gate here. Either exception aborts the
    -- whole transaction, rolling back the listing insert above too — this is
    -- the actual bug fix: previously a rejected update after a successful
    -- listing insert left the listing orphaned with nothing to roll it back.
    UPDATE habit_businesses
    SET business_type_id = v_new_type.id,
        business_icon = v_new_type.icon,
        cost = v_new_type.base_cost,
        earnings_per_completion = v_new_type.base_pay, -- goal_value is always 1 for an upgrade, same as the joint-venture flow
        marketplace_bonus_percent = NULL, -- earnings are fully recalculated by this upgrade, so any prior Marketplace bonus badge no longer applies
        updated_at = NOW()
    WHERE id = p_habit_business_id AND user_id = p_user_id;

    PERFORM adjust_user_cash(p_user_id, -v_new_type.base_cost);
    PERFORM recalculate_net_worth(p_user_id);

    RETURN jsonb_build_object('listed_at', v_listed_at, 'new_cost', v_new_type.base_cost);
END;
$$;
GRANT EXECUTE ON FUNCTION upgrade_habit_business(UUID, UUID, INTEGER) TO authenticated;

NOTIFY pgrst, 'reload schema';
