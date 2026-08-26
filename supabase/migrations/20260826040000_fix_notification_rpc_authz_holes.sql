-- Second batch of findings from the same RPC authorization sweep as
-- 20260826030000. Lower severity than that migration (social/notification
-- spoofing and spam, not money), but the same underlying mistake: these
-- RPCs take a caller-identifying id parameter with no check that it's
-- actually the caller, and are directly reachable via `supabase.rpc(...)`
-- since every function in this project is GRANTed EXECUTE TO authenticated
-- as a matter of course - most add the `IS DISTINCT FROM auth.uid()` guard
-- this project already uses everywhere else, a few never needed a client
-- grant in the first place.

-- ─── 1) Internal-only functions mistakenly grantable to authenticated ───
-- check_general_achievements, notify_friends_of_general_achievement,
-- notify_friends_of_milestone and check_weekly_leaderboard_first are only
-- ever invoked via PERFORM/IF from other SECURITY DEFINER functions and
-- triggers (achievement checks, habit completion, friend acceptance, etc.)
-- — no client code calls any of them directly. As written, though, any
-- authenticated client could call e.g.
-- `supabase.rpc('notify_friends_of_general_achievement', {p_user_id: '<any-uuid>', ...})`
-- directly and spam that user's friends with a fabricated achievement
-- notification attributed to them, or force a redundant achievement
-- re-check/re-notify for an arbitrary user. Revoking the client-facing
-- grant is the correct fix (not an auth.uid() check) since these were
-- never meant to be called by clients at all — same reasoning as
-- adjust_user_cash in the previous migration. Nested SECURITY DEFINER
-- calls are unaffected (see that migration's comment for why).
--
-- Guarded with to_regprocedure() rather than a bare REVOKE: this project's
-- live database has drifted from the tracked migration history in both
-- directions before (see 20260807100000's comment on social_pokes), and
-- REVOKE on a function that doesn't exist in this particular database
-- errors out the whole script instead of no-op'ing like GRANT does. If a
-- function below isn't present here, there's simply nothing to revoke.
DO $$ BEGIN
    IF to_regprocedure('check_general_achievements(uuid, boolean)') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION check_general_achievements(UUID, BOOLEAN) FROM authenticated;
    END IF;
END $$;
DO $$ BEGIN
    IF to_regprocedure('notify_friends_of_general_achievement(uuid, text, text, text, text)') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION notify_friends_of_general_achievement(UUID, TEXT, TEXT, TEXT, TEXT) FROM authenticated;
    END IF;
END $$;
DO $$ BEGIN
    IF to_regprocedure('notify_friends_of_milestone(uuid, uuid)') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION notify_friends_of_milestone(UUID, UUID) FROM authenticated;
    END IF;
END $$;
DO $$ BEGIN
    IF to_regprocedure('check_weekly_leaderboard_first(uuid, text)') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION check_weekly_leaderboard_first(UUID, TEXT) FROM authenticated;
    END IF;
END $$;

-- ─── 2) Sender-identity spoofing in the three "send a notification to
-- someone" RPCs actually called from the client ───
-- Every one of these takes a from_user_id/p_from_user_id the client
-- supplies, uses it to look up a display name and stamp it as the
-- notification's sender, but never checks it's actually the caller. The
-- app itself always passes the current user's own id (confirmed at every
-- call site: stocks-content.component.ts, todays-dividends-modal, and
-- jv-participants-modal), so adding the guard changes nothing for
-- legitimate use.

CREATE OR REPLACE FUNCTION send_habit_poke(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE from_user_name TEXT;
BEGIN
    IF from_user_id IS DISTINCT FROM auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    SELECT name INTO from_user_name
    FROM user_profiles
    WHERE id = from_user_id;
    IF from_user_name IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
    END IF;

    INSERT INTO social_pokes (
            from_user_id,
            to_user_id,
            message,
            type,
            is_read,
            metadata
        )
    VALUES (
            from_user_id,
            to_user_id,
            from_user_name || ' is rooting for your ' || business_name || ' habit.',
            'habit_reminder',
            false,
            jsonb_build_object('business_name', business_name)
        );
    RETURN jsonb_build_object(
        'success',
        true,
        'message',
        'Poke sent successfully'
    );
END;
$$;
GRANT EXECUTE ON FUNCTION send_habit_poke(UUID, UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION send_joint_venture_reminder(
        p_from_user_id UUID,
        p_to_user_id UUID,
        p_habit_business_id UUID
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    from_user_name TEXT;
    v_business_name TEXT;
BEGIN
    IF p_from_user_id IS DISTINCT FROM auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    IF p_from_user_id = p_to_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot send a reminder to yourself');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM business_co_owners
        WHERE habit_business_id = p_habit_business_id AND user_id = p_from_user_id
    ) OR NOT EXISTS (
        SELECT 1 FROM business_co_owners
        WHERE habit_business_id = p_habit_business_id AND user_id = p_to_user_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Both users must be co-owners of this joint venture');
    END IF;

    SELECT name INTO from_user_name FROM user_profiles WHERE id = p_from_user_id;
    IF from_user_name IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
    END IF;

    SELECT business_name INTO v_business_name FROM habit_businesses WHERE id = p_habit_business_id;

    INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
    VALUES (
        p_from_user_id,
        p_to_user_id,
        from_user_name || ' nudged you to check in on "' || COALESCE(v_business_name, 'your joint venture') || '" today.',
        'joint_venture_reminder',
        false,
        jsonb_build_object('business_name', v_business_name, 'habit_business_id', p_habit_business_id)
    );

    RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION send_joint_venture_reminder(UUID, UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        habit_business_id UUID,
        from_user_name TEXT,
        p_client_timezone TEXT DEFAULT 'UTC'
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_business_name TEXT;
    v_business_type_name TEXT;
    v_period_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
BEGIN
    IF from_user_id IS DISTINCT FROM auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    SELECT COALESCE(NULLIF(hb.business_name, ''), bt.name), bt.name
    INTO v_business_name, v_business_type_name
    FROM habit_businesses hb
        LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hb.id = habit_business_id
        AND hb.user_id = to_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Business not found');
    END IF;

    IF EXISTS (
        SELECT 1 FROM social_pokes sp
        WHERE sp.type = 'stockholder_reminder'
            AND sp.from_user_id = send_stockholder_reminder.from_user_id
            AND sp.to_user_id = send_stockholder_reminder.to_user_id
            AND (sp.metadata->>'habit_business_id')::UUID = habit_business_id
            AND sp.created_at >= v_period_start
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'You already sent a reminder for this business today. Try again after midnight.');
    END IF;

    INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
    VALUES (
        from_user_id,
        to_user_id,
        from_user_name || ' has sent you a reminder to complete your ' || v_business_name || ' Habit!',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name', v_business_name,
            'business_type_name', v_business_type_name,
            'habit_business_id', habit_business_id::TEXT,
            'investor_name', from_user_name
        )
    );
    RETURN jsonb_build_object(
        'success',
        true,
        'message',
        'Stockholder reminder sent successfully'
    );
END;
$$;
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, UUID, TEXT, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
