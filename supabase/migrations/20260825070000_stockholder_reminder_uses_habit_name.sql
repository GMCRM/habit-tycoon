-- The client previously passed the business's PUBLIC type name (e.g.
-- "Lemonade Stand") straight through into the reminder message, because
-- that's the only name a stockholder is shown for a friend's business (see
-- the "Owned by X" row in TodaysDividendsModalComponent, and the Send
-- Reminder confirmation dialog, both privacy-scoped to the public type name
-- on purpose — a stockholder never sees the habit's own private name).
--
-- But the message is read by the habit's OWNER, not the stockholder, so it
-- should say the habit's own private business_name (e.g. "Pray") — that's
-- the name the owner actually recognizes among their own habits. Swaps the
-- function to take habit_business_id instead of a client-supplied name
-- string, and looks up hb.business_name (falling back to the business type
-- name only if it's ever empty) server-side. The confirmation dialog and
-- everything else the stockholder sees is unchanged — only the notification
-- text the owner receives changes.
--
-- Old signature (TEXT business_name) is dropped since CREATE OR REPLACE
-- can't change an argument's type in place.

DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        habit_business_id UUID,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_business_name TEXT;
    v_business_type_name TEXT;
BEGIN
    SELECT COALESCE(NULLIF(hb.business_name, ''), bt.name), bt.name
    INTO v_business_name, v_business_type_name
    FROM habit_businesses hb
        LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hb.id = habit_business_id
        AND hb.user_id = to_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Business not found');
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
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, UUID, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
