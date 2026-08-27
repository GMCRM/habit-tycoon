-- Fix: undoing a habit completion (or a joint-venture check-in) reverses the
-- *owner's* cash and stats, but never reverses the dividends that were just
-- paid out to that business's stockholders for the same completion. Since
-- process_habit_completion_dividends() credits stockholder cash directly
-- (user_profiles.cash) at completion time, and undo_habit_business_completion
-- / undo_joint_venture_checkin only ever call adjust_user_cash() for the
-- completer, repeating complete -> undo -> complete -> undo lets a business
-- with a stockholder mint free, uncapped cash for that stockholder on every
-- cycle, while the completer's own earnings net to zero each time. (Reported
-- as "infinite money glitch #3": stockholder dividends "continue to populate
-- ... over and over without taking that money back".)
--
-- dividend_payments.habit_completion_id -> habit_completions(id) is
-- ON DELETE CASCADE (20250827000300_business_stocks_schema.sql), so the
-- DELETE FROM habit_completions in both undo RPCs already silently wipes the
-- dividend_payments/stock_dividend_distributions audit rows for that
-- completion -- it just never undoes the cash those rows represent. Fix:
-- before deleting the completion, walk its dividend_payments row (if any,
-- looked up by habit_completion_id, which is UNIQUE for a real completion)
-- and its stock_dividend_distributions, and claw back exactly what each
-- stockholder was paid -- symmetric with process_habit_completion_dividends'
-- payout loop. This runs un-swallowed (no EXCEPTION WHEN OTHERS), same as the
-- DELETE itself: either the whole undo succeeds, including the dividend
-- clawback, or none of it does, rather than resurrecting the bug via a
-- silently-failed reversal.
CREATE OR REPLACE FUNCTION reverse_habit_completion_dividends(completion_uuid UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_payment RECORD;
    v_dist RECORD;
BEGIN
    FOR v_payment IN
        SELECT id, stock_id FROM dividend_payments WHERE habit_completion_id = completion_uuid
    LOOP
        FOR v_dist IN
            SELECT stockholder_id, total_dividend
            FROM stock_dividend_distributions
            WHERE dividend_payment_id = v_payment.id
        LOOP
            UPDATE user_profiles
            SET cash = cash - v_dist.total_dividend,
                updated_at = NOW()
            WHERE id = v_dist.stockholder_id;

            UPDATE stock_holdings
            SET total_dividends_earned = GREATEST(0, total_dividends_earned - v_dist.total_dividend),
                updated_at = NOW()
            WHERE holder_id = v_dist.stockholder_id
                AND stock_id = v_payment.stock_id;

            PERFORM recalculate_net_worth(v_dist.stockholder_id);
        END LOOP;
    END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION reverse_habit_completion_dividends(UUID) TO authenticated;

-- undo_habit_business_completion, byte-for-byte identical to the live version
-- (20260814050000_fix_undo_streak_progress_period.sql) except for the added
-- dividend-clawback call right before the completion row is deleted.
CREATE OR REPLACE FUNCTION undo_habit_business_completion(
    p_habit_business_id UUID,
    p_occurred_at TIMESTAMPTZ DEFAULT NOW(),
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_habit RECORD;
    v_now_local TIMESTAMP;
    v_today_local TIMESTAMP;
    v_today_start TIMESTAMPTZ;
    v_today_end TIMESTAMPTZ;
    v_completion RECORD;
    v_previous_completed_at TIMESTAMPTZ;
    v_goal_value INTEGER;
    v_was_goal_completing_tap BOOLEAN;
    v_previous_streak INTEGER;
    v_new_current_progress INTEGER;
    v_progress_period_start TIMESTAMPTZ;
    v_progress_period_end TIMESTAMPTZ;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    SELECT * INTO v_habit
    FROM habit_businesses
    WHERE id = p_habit_business_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit-business not found';
    END IF;

    -- The UI never sends joint-venture rows through this path (the undo
    -- button is hidden for JV cards — home.page.html) but re-validate here
    -- anyway, matching complete_habit_business's own defense-in-depth style.
    IF v_habit.is_joint_venture THEN
        RAISE EXCEPTION 'Use the joint-venture check-in undo flow for this business';
    END IF;

    v_now_local := p_occurred_at AT TIME ZONE p_client_timezone;
    v_today_local := date_trunc('day', v_now_local);
    v_today_start := v_today_local AT TIME ZONE p_client_timezone;
    v_today_end := (v_today_local + INTERVAL '1 day') AT TIME ZONE p_client_timezone;

    IF v_habit.last_completed_at IS NULL
       OR v_habit.last_completed_at < v_today_start
       OR v_habit.last_completed_at >= v_today_end THEN
        RAISE EXCEPTION 'No completion found for today to undo';
    END IF;

    SELECT * INTO v_completion
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND completed_at >= v_today_start
      AND completed_at < v_today_end
    ORDER BY completed_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Could not find today''s completion record';
    END IF;

    -- Only decrement the streak if today's completion was the one that
    -- actually reached goal_value — undoing an earlier, partial-progress tap
    -- on a multi-completion habit must leave the streak untouched.
    v_goal_value := COALESCE(v_habit.goal_value, 1);
    v_was_goal_completing_tap := COALESCE(v_habit.current_progress, 0) >= v_goal_value;
    v_previous_streak := CASE WHEN v_was_goal_completing_tap
        THEN GREATEST(0, COALESCE(v_habit.streak, 0) - 1)
        ELSE v_habit.streak END;

    -- Find the previous completion to set as the new last_completed_at (NULL
    -- if this was the only completion ever).
    SELECT completed_at INTO v_previous_completed_at
    FROM habit_completions
    WHERE habit_business_id = p_habit_business_id
      AND user_id = v_user_id
      AND id != v_completion.id
    ORDER BY completed_at DESC
    LIMIT 1;

    -- current_progress must reflect the tally for whichever period
    -- v_previous_completed_at now falls in — which may be an earlier day than
    -- today if this was the only completion today. Recompute it from the
    -- actual remaining rows in that period rather than assuming it's still
    -- today's (now decremented) progress.
    IF v_previous_completed_at IS NULL THEN
        v_new_current_progress := 0;
    ELSE
        v_progress_period_start := date_trunc('day', v_previous_completed_at AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
        v_progress_period_end := v_progress_period_start + INTERVAL '1 day';

        SELECT COUNT(*) INTO v_new_current_progress
        FROM habit_completions
        WHERE habit_business_id = p_habit_business_id
          AND user_id = v_user_id
          AND id != v_completion.id
          AND completed_at >= v_progress_period_start
          AND completed_at < v_progress_period_end;
    END IF;

    UPDATE habit_businesses
    SET streak = v_previous_streak,
        current_progress = v_new_current_progress,
        total_completions = GREATEST(0, COALESCE(total_completions, 0) - 1),
        total_earnings = GREATEST(0, COALESCE(total_earnings, 0) - v_completion.earnings),
        last_completed_at = v_previous_completed_at,
        updated_at = NOW()
    WHERE id = p_habit_business_id;

    -- Not clamped to 0 -- intentional: if the earnings were already spent,
    -- undo must still remove the full amount (even negative) so purchases
    -- made with them aren't left unpaid for.
    PERFORM adjust_user_cash(v_user_id, -v_completion.earnings);

    -- Claw back whatever stockholders were paid for this completion — see
    -- the fix note above this function. Must run before the DELETE below,
    -- since that DELETE cascades away the dividend_payments/
    -- stock_dividend_distributions rows this reads.
    PERFORM reverse_habit_completion_dividends(v_completion.id);

    -- Unlike the old JS (which swallowed a delete failure here because, by
    -- this point in the old non-atomic flow, cash/stats had already been
    -- irrevocably committed as separate prior statements), a failure here
    -- now rolls back the entire transaction — either the full undo succeeds,
    -- or none of it does, instead of leaving a stale completion row behind
    -- while cash/stats were already reversed.
    DELETE FROM habit_completions WHERE id = v_completion.id;

    RETURN jsonb_build_object('earnings', v_completion.earnings);
END;
$$;
GRANT EXECUTE ON FUNCTION undo_habit_business_completion(UUID, TIMESTAMPTZ, TEXT) TO authenticated;

-- undo_joint_venture_checkin, byte-for-byte identical to the live version
-- (20260814030000_joint_venture_checkin_undo.sql) except for the same
-- dividend-clawback call added right before the completion row is deleted.
-- (This RPC already declines to undo once full attendance was reached for
-- the day — see the comment at its top — so it never has to unwind the
-- group streak-bonus dividend, only the per-check-in one.)
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

    -- Claw back whatever stockholders were paid for this check-in's dividend
    -- event — see the fix note above reverse_habit_completion_dividends.
    PERFORM reverse_habit_completion_dividends(v_completion.id);

    DELETE FROM habit_completions WHERE id = v_completion.id;
    DELETE FROM joint_venture_checkins WHERE id = v_checkin.id;

    RETURN jsonb_build_object('success', true, 'earnings', v_completion.earnings);
END;
$$;
GRANT EXECUTE ON FUNCTION undo_joint_venture_checkin(UUID, TIMESTAMPTZ) TO authenticated;

NOTIFY pgrst, 'reload schema';
