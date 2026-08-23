-- Habit Tycoon (part 3/4): per-habit tier tracking + server-side unlock gate.
--
-- business_tier is snapshotted onto habit_businesses the same way
-- business_icon/business_name/cost already are — so the client (and any
-- resold Marketplace listing) can tell a Tycoon business apart from a tier-1
-- one without joining back to business_types, and so the green "HABIT
-- TYCOON" banner keeps rendering correctly even if business_types is edited
-- later. first_tycoon_purchase_at records when a habit first reached Tycoon
-- status, for the "Speed Baron"/"Tycoon Dynasty" hidden achievements (see
-- the next migration).
--
-- The actual unlock rule — a habit can only reach a tier-2 business type
-- once ALL 6 of its milestone achievements (7/30/100-day streak,
-- 10/50/100 completions) are earned — is enforced here as a BEFORE
-- INSERT OR UPDATE trigger on habit_businesses, not just client-side. Every
-- write path that can change business_type_id (the solo upgrade flow in
-- HabitBusinessService.upgradeHabitBusiness, and the joint-venture group
-- upgrade in pay_joint_venture_upgrade_share) issues a plain UPDATE on this
-- table, so one trigger covers both without touching either RPC.

ALTER TABLE habit_businesses
    ADD COLUMN IF NOT EXISTS business_tier INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS first_tycoon_purchase_at TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION enforce_habit_tycoon_tier_gate() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_new_tier INTEGER;
    v_milestone_count INTEGER;
BEGIN
    -- Cheap skip: nothing to validate unless this write is creating the row
    -- or actually changing which business type it points to. Every habit
    -- completion issues an UPDATE that leaves business_type_id untouched —
    -- this keeps that hot path from paying for a business_types lookup.
    IF TG_OP = 'UPDATE' AND NEW.business_type_id IS NOT DISTINCT FROM OLD.business_type_id THEN
        RETURN NEW;
    END IF;

    SELECT tier INTO v_new_tier FROM business_types WHERE id = NEW.business_type_id;

    IF v_new_tier = 2 THEN
        IF TG_OP = 'INSERT' THEN
            RAISE EXCEPTION 'Habit Tycoon businesses cannot be your first business for a habit — upgrade into one after earning all 6 milestone achievements.';
        END IF;

        SELECT COUNT(DISTINCT milestone_key) INTO v_milestone_count
        FROM habit_milestone_achievements
        WHERE habit_business_id = NEW.id;

        IF v_milestone_count < 6 THEN
            RAISE EXCEPTION 'Habit Tycoon status unlocks only after all 6 milestone achievements (7/30/100-day streak, 10/50/100 completions) are earned for this habit.';
        END IF;

        IF NEW.first_tycoon_purchase_at IS NULL THEN
            NEW.first_tycoon_purchase_at := NOW();
        END IF;
    END IF;

    NEW.business_tier := COALESCE(v_new_tier, 1);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_habit_tycoon_tier_gate ON habit_businesses;
CREATE TRIGGER trg_enforce_habit_tycoon_tier_gate
    BEFORE INSERT OR UPDATE ON habit_businesses
    FOR EACH ROW EXECUTE FUNCTION enforce_habit_tycoon_tier_gate();

NOTIFY pgrst, 'reload schema';
