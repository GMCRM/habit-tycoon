-- Self-notifications for per-habit milestones should name the actual habit.
--
-- notify_friends_of_milestone (see 20260819000000_self_achievement_notifications.sql)
-- builds its self-addressed message with the same PUBLIC business type name
-- used for friends (e.g. "Lemonade Stand"), because that value was made
-- privacy-safe on purpose for the friend-facing message — see
-- 20260722235413_professional_achievement_notifications.sql, which
-- deliberately stopped referencing hb.business_name (the user's own private,
-- freely-typed label for that specific habit, e.g. "Fun Read") in anything
-- that reaches a friend.
--
-- But the self-notification never reaches a friend — it's inserted with
-- from_user_id = to_user_id = achiever_user_id. There's no privacy reason to
-- use the generic business type name there, and it reads worse: "You just
-- earned the 🔥 7-Day Streak milestone on your 📚 Book Club" instead of the
-- habit the user actually named, e.g. "Fun Read".
--
-- This re-declares notify_friends_of_milestone (same signature) to build the
-- self message from the habit's own private business_name/business_icon,
-- falling back to the business type name/icon only if the habit's own
-- fields are blank. The friend-facing message is untouched and keeps using
-- only the public business type name/icon.

CREATE OR REPLACE FUNCTION notify_friends_of_milestone(
        habit_business_uuid UUID,
        achiever_user_id UUID
    ) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_longest_streak INTEGER;
    v_total_completions INTEGER;
    v_business_name TEXT;
    v_business_icon TEXT;
    v_business_type_name TEXT;
    v_business_type_icon TEXT;
    v_achiever_name TEXT;
    v_milestone RECORD;
    v_message TEXT;
    v_self_message TEXT;
    v_friend_id UUID;
    v_inserted_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    -- 1. Load both the PUBLIC business type name/icon (for the friend-facing
    --    message) and the habit's own PRIVATE business_name/business_icon
    --    (for the self message only — never forwarded to a friend).
    SELECT hb.longest_streak,
        hb.total_completions,
        hb.business_name,
        hb.business_icon,
        bt.name,
        bt.icon INTO v_longest_streak,
        v_total_completions,
        v_business_name,
        v_business_icon,
        v_business_type_name,
        v_business_type_icon
    FROM habit_businesses hb
        LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hb.id = habit_business_uuid
        AND hb.user_id = achiever_user_id;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- Generic, still-non-identifying fallback for the friend-facing message
    -- if the business type lookup ever comes back empty. Deliberately never
    -- falls back to the private per-habit name.
    v_business_type_name := COALESCE(v_business_type_name, 'a business');
    v_business_type_icon := COALESCE(v_business_type_icon, '🏢');

    SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
    FROM user_profiles up
    WHERE up.id = achiever_user_id;

    -- 2. Walk every milestone definition (highest threshold first, purely
    --    cosmetic ordering) and record + notify any newly-crossed one.
    --    ON CONFLICT DO NOTHING makes this idempotent/safe to call
    --    repeatedly; RETURNING id tells us whether it was actually new.
    FOR v_milestone IN
        SELECT * FROM (VALUES
            ('streak_100', 'streak', 100, '💎', '100-Day Streak', 'reached a legendary 100-day streak'),
            ('streak_30', 'streak', 30, '🏆', '30-Day Streak', 'kept the streak alive for a full 30 days'),
            ('streak_7', 'streak', 7, '🔥', '7-Day Streak', 'completed this habit 7 days in a row without missing one'),
            ('completions_100', 'completions', 100, '🎯', '100 Completions', 'hit 100 total completions — a true milestone of consistency'),
            ('completions_50', 'completions', 50, '🌟', '50 Completions', 'racked up 50 total completions on this habit'),
            ('completions_10', 'completions', 10, '⭐', '10 Completions', 'completed this habit 10 times in total')
        ) AS m(milestone_key, milestone_type, threshold, emoji, label, description)
    LOOP
        IF (v_milestone.milestone_type = 'streak' AND v_longest_streak >= v_milestone.threshold)
           OR (v_milestone.milestone_type = 'completions' AND v_total_completions >= v_milestone.threshold)
        THEN
            v_inserted_id := NULL;

            INSERT INTO habit_milestone_achievements (
                    user_id, habit_business_id, milestone_key, milestone_type, threshold, emoji
                )
            VALUES (
                    achiever_user_id, habit_business_uuid, v_milestone.milestone_key,
                    v_milestone.milestone_type, v_milestone.threshold, v_milestone.emoji
                )
            ON CONFLICT (habit_business_id, milestone_key) DO NOTHING
            RETURNING id INTO v_inserted_id;

            -- Only notify the first time this milestone is newly earned
            IF v_inserted_id IS NOT NULL THEN
                v_message := v_achiever_name || ' just earned the ' || v_milestone.emoji || ' ' ||
                    v_milestone.label || ' milestone on their ' || v_business_type_icon || ' ' ||
                    v_business_type_name || ' — ' || v_milestone.description || '.';

                FOR v_friend_id IN
                    SELECT f.friend_id AS friend_id
                    FROM friendships f
                    WHERE f.user_id = achiever_user_id
                        AND f.status = 'accepted'
                    UNION
                    SELECT f.user_id AS friend_id
                    FROM friendships f
                    WHERE f.friend_id = achiever_user_id
                        AND f.status = 'accepted'
                LOOP
                    INSERT INTO social_pokes (
                            from_user_id, to_user_id, message, type, is_read, metadata
                        )
                    VALUES (
                            achiever_user_id, v_friend_id, v_message, 'friend_milestone', false,
                            jsonb_build_object(
                                'habit_business_id', habit_business_uuid::TEXT,
                                'milestone_key', v_milestone.milestone_key,
                                'milestone_emoji', v_milestone.emoji
                            )
                        );
                    v_notifications_sent := v_notifications_sent + 1;
                END LOOP;

                -- Notify the achiever themselves too, using the habit's own
                -- private name/icon (e.g. "Fun Read") rather than the public
                -- business type used above — this message never leaves the
                -- achiever's own notifications feed.
                v_self_message := 'You just earned the ' || v_milestone.emoji || ' ' ||
                    v_milestone.label || ' milestone on your ' ||
                    COALESCE(v_business_icon, v_business_type_icon) || ' ' ||
                    COALESCE(NULLIF(v_business_name, ''), v_business_type_name) || ' — ' ||
                    v_milestone.description || '.';

                INSERT INTO social_pokes (
                        from_user_id, to_user_id, message, type, is_read, metadata
                    )
                VALUES (
                        achiever_user_id, achiever_user_id, v_self_message, 'friend_milestone', false,
                        jsonb_build_object(
                            'habit_business_id', habit_business_uuid::TEXT,
                            'milestone_key', v_milestone.milestone_key,
                            'milestone_emoji', v_milestone.emoji
                        )
                    );
                v_notifications_sent := v_notifications_sent + 1;
            END IF;
        END IF;
    END LOOP;

    RETURN v_notifications_sent;
END;
$$;
GRANT EXECUTE ON FUNCTION notify_friends_of_milestone(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
