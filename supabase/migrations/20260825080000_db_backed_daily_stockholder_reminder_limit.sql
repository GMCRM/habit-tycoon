-- "Today's Stock Dividends" popup — move the once-per-business-per-day
-- reminder cap from localStorage (TodaysDividendsModalComponent) into the
-- database, so it's enforced server-side and shared across devices instead
-- of being per-browser-storage. social_pokes already has a durable,
-- authoritative row per reminder sent (type = 'stockholder_reminder',
-- from_user_id, to_user_id, metadata->>'habit_business_id', created_at —
-- see send_stockholder_reminder in
-- 20260825070000_stockholder_reminder_uses_habit_name.sql), so no new table
-- is needed.
--
-- The daily window uses the same local-midnight boundary as
-- get_todays_dividend_status's own "completed today" / "active today"
-- columns (p_client_timezone, defaulting to 'UTC' when the client can't
-- supply one) — the requested "resets at midnight every night" behavior
-- falls out of reusing that existing per-day boundary rather than a fixed
-- 24h-from-last-send timer.
--
-- 1. get_todays_dividend_status gains a `reminded_today` column so the
--    modal can render each row's reminder button state straight from the
--    fetch it already does, no extra round trip.
-- 2. send_stockholder_reminder takes p_client_timezone and re-checks the
--    same condition server-side before inserting, so a stale client (a
--    second device, or a modal left open across midnight) can't send a
--    duplicate reminder for the same business on the same day.

CREATE OR REPLACE FUNCTION get_todays_dividend_status(
    user_uuid UUID,
    p_client_timezone TEXT DEFAULT 'UTC'
) RETURNS TABLE (
    holding_id UUID,
    stock_id UUID,
    business_id UUID,
    business_name TEXT,
    business_icon TEXT,
    owner_id UUID,
    owner_name TEXT,
    is_joint_venture BOOLEAN,
    co_owner_count INTEGER,
    shares_owned INTEGER,
    dividend_per_completion NUMERIC,
    completed_today BOOLEAN,
    is_active_today BOOLEAN,
    reminded_today BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_period_start TIMESTAMPTZ := date_trunc('day', NOW() AT TIME ZONE p_client_timezone) AT TIME ZONE p_client_timezone;
    v_dow INTEGER := EXTRACT(DOW FROM NOW() AT TIME ZONE p_client_timezone)::INTEGER;
BEGIN
    RETURN QUERY
    SELECT
        sh.id AS holding_id,
        bs.id AS stock_id,
        hb.id AS business_id,
        bt.name AS business_name,
        bt.icon AS business_icon,
        hb.user_id AS owner_id,
        up.name AS owner_name,
        hb.is_joint_venture,
        COALESCE(co.n, 0)::INTEGER AS co_owner_count,
        sh.shares_owned,
        GREATEST(
            ROUND(
                (
                    (
                        hb.earnings_per_completion + hb.earnings_per_completion * (
                            GREATEST(
                                0,
                                (COALESCE(bs.total_shares_issued, 100) - COALESCE(bs.shares_owned_by_owner, 100)) - COALESCE(bs.shares_available, 0)
                            )::NUMERIC / 100
                        )
                    ) * (
                        1 + CASE WHEN hb.streak > 0 THEN LEAST(hb.streak * 0.1, 1) ELSE 0 END
                    )
                ) * sh.shares_owned::NUMERIC / COALESCE(NULLIF(bs.total_shares_issued, 0), 100)::NUMERIC,
                2
            ),
            0.01
        ) AS dividend_per_completion,
        EXISTS (
            SELECT 1 FROM habit_completions hc
            WHERE hc.habit_business_id = hb.id AND hc.completed_at >= v_period_start
        ) AS completed_today,
        CASE
            WHEN (hb.recurrence_interval IN ('specific_days', '7d') OR hb.frequency = 'weekly')
                THEN (v_dow = ANY(COALESCE(hb.active_days, ARRAY[]::INTEGER[])))
            ELSE true
        END AS is_active_today,
        -- Same reminder cap send_stockholder_reminder enforces server-side —
        -- kept in sync here so the modal's button state (and a page refresh)
        -- always reflects the DB, never a client-only guess.
        EXISTS (
            SELECT 1 FROM social_pokes sp
            WHERE sp.type = 'stockholder_reminder'
                AND sp.from_user_id = user_uuid
                AND sp.to_user_id = hb.user_id
                AND (sp.metadata->>'habit_business_id')::UUID = hb.id
                AND sp.created_at >= v_period_start
        ) AS reminded_today
    FROM stock_holdings sh
        INNER JOIN business_stocks bs ON sh.stock_id = bs.id
        INNER JOIN habit_businesses hb ON bs.habit_business_id = hb.id
        INNER JOIN business_types bt ON hb.business_type_id = bt.id
        INNER JOIN user_profiles up ON hb.user_id = up.id
        LEFT JOIN (
            SELECT habit_business_id, COUNT(*) AS n FROM business_co_owners GROUP BY habit_business_id
        ) co ON co.habit_business_id = hb.id
    WHERE sh.holder_id = user_uuid
        AND sh.shares_owned > 0
        AND hb.is_active = true
    ORDER BY completed_today ASC, bt.name ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_todays_dividend_status(UUID, TEXT) TO authenticated;

-- Adding p_client_timezone changes the argument list, so CREATE OR REPLACE
-- below would create a second overload rather than replace this one — drop
-- the old 4-arg signature first (same reasoning as the DROP FUNCTION in
-- 20260825070000_stockholder_reminder_uses_habit_name.sql).
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, UUID, TEXT);

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
