-- Joint venture check-in undo — a short grace window so an accidental tap
-- while scrolling through habits doesn't lock in a completion (and its cash
-- payout) for the rest of the day. Mirrors undo_habit_business_completion's
-- reversal shape, but only covers the common case: a same-day,
-- not-yet-finalized check-in, still inside 60 seconds of when it was made.
--
-- If full attendance was already reached today (the group streak just got
-- finalized by complete_joint_venture_checkin), we decline instead of
-- undoing: safely unwinding that would mean reversing every co-owner's
-- streak bonus, cash and the stock-price update too, and that's an edge
-- case rare enough (every co-owner checking in inside the same 60-second
-- window) that it isn't worth the correctness risk.

CREATE OR REPLACE FUNCTION undo_joint_venture_checkin(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit habit_businesses%ROWTYPE;
    v_today DATE;
    v_checkin RECORD;
    v_completion RECORD;
    v_total_co_owners INTEGER;
    v_checked_in_today INTEGER;
    v_new_last_completed_at TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Lock the shared row, same as complete_joint_venture_checkin, so an
    -- undo can't race a concurrent check-in from another co-owner.
    SELECT * INTO v_habit FROM habit_businesses WHERE id = p_habit_business_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found';
    END IF;
    IF NOT v_habit.is_joint_venture THEN
        RAISE EXCEPTION 'This business is not a joint venture';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM business_co_owners bco WHERE bco.habit_business_id = p_habit_business_id AND bco.user_id = v_user_id) THEN
        RAISE EXCEPTION 'You are not a co-owner of this business';
    END IF;

    v_today := (p_occurred_at AT TIME ZONE COALESCE(v_habit.joint_venture_timezone, 'UTC'))::date;

    SELECT * INTO v_checkin
    FROM joint_venture_checkins
    WHERE habit_business_id = p_habit_business_id AND co_owner_id = v_user_id AND check_in_date = v_today;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'No check-in found for today to undo');
    END IF;

    IF p_occurred_at - v_checkin.checked_in_at > INTERVAL '60 seconds' THEN
        RETURN jsonb_build_object('success', false, 'error', 'The undo window has passed — today''s check-in is locked in');
    END IF;

    SELECT COUNT(*) INTO v_total_co_owners FROM business_co_owners WHERE habit_business_id = p_habit_business_id;
    SELECT COUNT(*) INTO v_checked_in_today FROM joint_venture_checkins WHERE habit_business_id = p_habit_business_id AND check_in_date = v_today;

    IF v_checked_in_today >= v_total_co_owners THEN
        RETURN jsonb_build_object('success', false, 'error', 'Everyone already checked in today — this check-in can no longer be undone');
    END IF;

    SELECT * INTO v_completion
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND (completed_at AT TIME ZONE COALESCE(v_habit.joint_venture_timezone, 'UTC'))::date = v_today
    ORDER BY completed_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Could not find today''s completion record';
    END IF;

    -- last_completed_at is a shared field on the business row (whichever
    -- co-owner completed most recently) — restore it to whatever the most
    -- recent remaining completion is, NULL if none.
    SELECT MAX(completed_at) INTO v_new_last_completed_at
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id AND id != v_completion.id;

    UPDATE habit_businesses
    SET total_earnings = GREATEST(0, COALESCE(total_earnings, 0) - v_completion.earnings),
        last_completed_at = v_new_last_completed_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    -- Not clamped to 0 -- intentional, matching undo_habit_business_completion:
    -- if the earnings were already spent, undo must still remove the full
    -- amount so purchases made with them aren't left unpaid for.
    PERFORM adjust_user_cash(v_user_id, -v_completion.earnings);

    DELETE FROM habit_completions WHERE id = v_completion.id;
    DELETE FROM joint_venture_checkins WHERE id = v_checkin.id;

    RETURN jsonb_build_object('success', true, 'earnings', v_completion.earnings);
END;
$$;
GRANT EXECUTE ON FUNCTION undo_joint_venture_checkin(UUID, TIMESTAMPTZ) TO authenticated;

-- ─── get_joint_venture_status now also returns checked_in_at, so the
-- client can compute a live "undo window" countdown that survives a page
-- reload instead of only tracking it in local component state. ───
DROP FUNCTION IF EXISTS get_joint_venture_status(UUID[]);
CREATE OR REPLACE FUNCTION get_joint_venture_status(p_habit_business_ids UUID[]) RETURNS TABLE (
    habit_business_id UUID,
    co_owner_id UUID,
    co_owner_name TEXT,
    is_creator BOOLEAN,
    checked_in_today BOOLEAN,
    checked_in_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    RETURN QUERY
    SELECT
        bco.habit_business_id,
        bco.user_id,
        COALESCE(up.name, 'A friend'),
        bco.is_creator,
        EXISTS (
            SELECT 1 FROM joint_venture_checkins jvc
            WHERE jvc.habit_business_id = bco.habit_business_id
              AND jvc.co_owner_id = bco.user_id
              AND jvc.check_in_date = (NOW() AT TIME ZONE COALESCE(hb.joint_venture_timezone, 'UTC'))::date
        ),
        (
            SELECT jvc.checked_in_at FROM joint_venture_checkins jvc
            WHERE jvc.habit_business_id = bco.habit_business_id
              AND jvc.co_owner_id = bco.user_id
              AND jvc.check_in_date = (NOW() AT TIME ZONE COALESCE(hb.joint_venture_timezone, 'UTC'))::date
        )
    FROM business_co_owners bco
    JOIN habit_businesses hb ON hb.id = bco.habit_business_id
    JOIN user_profiles up ON up.id = bco.user_id
    WHERE bco.habit_business_id = ANY(p_habit_business_ids)
      -- Only ever return rows for businesses the caller actually co-owns —
      -- defense in depth against passing in an arbitrary id.
      AND EXISTS (SELECT 1 FROM business_co_owners self WHERE self.habit_business_id = bco.habit_business_id AND self.user_id = v_user_id);
END;
$$;
GRANT EXECUTE ON FUNCTION get_joint_venture_status(UUID[]) TO authenticated;

NOTIFY pgrst, 'reload schema';
