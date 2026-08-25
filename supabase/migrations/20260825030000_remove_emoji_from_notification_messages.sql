-- Drop emoji from every notification's message TEXT itself, and lightly
-- clean up the wording (fewer exclamation points, plainer phrasing). The
-- client already renders its own icon per notification type/outcome (see
-- social.page.ts's getNotificationIcon() and
-- joint-venture-notification-card.component.ts's outcomeIcon), so the
-- emoji glyphs baked into the message body were pure duplication.
--
-- Re-declares each function below with the exact same signature/body as its
-- current live version, changing only the literal message text. In
-- particular:
--   * notify_friends_of_milestone / notify_friends_of_general_achievement:
--     current versions are 20260822000000_self_milestone_notification_uses_habit_name.sql
--     and 20260819000000_self_achievement_notifications.sql. The
--     privacy-critical distinction between the friend-facing message (built
--     from the PUBLIC business type name only) and the self message (built
--     from the habit's own PRIVATE business_name, falling back to the
--     business type name) is preserved exactly as-is.
--   * accept_joint_venture_invite / pay_joint_venture_upgrade_share /
--     execute_joint_venture_deletion: current versions are
--     20260814000000_hide_resolved_joint_venture_invites.sql and
--     20260825020000_hide_resolved_joint_venture_upgrade_and_deletion_notifications.sql.
--     Only their one emoji-bearing outcome message each changes — every
--     other message in those files was already emoji-free and is left
--     untouched (not redeclared here).
--   * send_habit_poke / send_stockholder_reminder / send_joint_venture_reminder:
--     current versions are 20250827002400_stocks_system_functions.sql,
--     20260721062501_fix_send_stockholder_reminder.sql, and
--     20260814020000_joint_venture_reminder.sql.
--
-- milestone_emoji / achievement_emoji / business_icon are still stored in
-- `metadata` and on general_achievements/habit_milestone_achievements —
-- only the message text changes.

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
                v_message := v_achiever_name || ' just reached the ' ||
                    v_milestone.label || ' milestone on their ' ||
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
                -- private name (e.g. "Fun Read") rather than the public
                -- business type used above — this message never leaves the
                -- achiever's own notifications feed.
                v_self_message := 'You just reached the ' ||
                    v_milestone.label || ' milestone on your ' ||
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

CREATE OR REPLACE FUNCTION notify_friends_of_general_achievement(
    p_user_id UUID,
    p_achievement_key TEXT,
    p_label TEXT,
    p_emoji TEXT,
    p_description TEXT
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_achiever_name TEXT;
    v_message TEXT;
    v_self_message TEXT;
    v_friend_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
    FROM user_profiles up WHERE up.id = p_user_id;

    v_message := v_achiever_name || ' just earned the ' || p_label ||
        ' achievement' || COALESCE(' — ' || NULLIF(p_description, ''), '') || '.';

    FOR v_friend_id IN
        SELECT f.friend_id AS friend_id
        FROM friendships f
        WHERE f.user_id = p_user_id AND f.status = 'accepted'
        UNION
        SELECT f.user_id AS friend_id
        FROM friendships f
        WHERE f.friend_id = p_user_id AND f.status = 'accepted'
    LOOP
        INSERT INTO social_pokes (
            from_user_id, to_user_id, message, type, is_read, metadata
        )
        VALUES (
            p_user_id, v_friend_id, v_message, 'general_achievement', false,
            jsonb_build_object('achievement_key', p_achievement_key, 'achievement_emoji', p_emoji)
        );
        v_notifications_sent := v_notifications_sent + 1;
    END LOOP;

    -- Notify the achiever themselves too.
    v_self_message := 'You just earned the ' || p_label ||
        ' achievement' || COALESCE(' — ' || NULLIF(p_description, ''), '') || '.';

    INSERT INTO social_pokes (
        from_user_id, to_user_id, message, type, is_read, metadata
    )
    VALUES (
        p_user_id, p_user_id, v_self_message, 'general_achievement', false,
        jsonb_build_object('achievement_key', p_achievement_key, 'achievement_emoji', p_emoji)
    );
    v_notifications_sent := v_notifications_sent + 1;

    RETURN v_notifications_sent;
END;
$$;
GRANT EXECUTE ON FUNCTION notify_friends_of_general_achievement(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ─── Habit poke / stockholder reminder / joint-venture reminder — each
-- ended its message with an exclamation mark plus an emoji; only the
-- emoji is dropped, wording otherwise unchanged. ───

CREATE OR REPLACE FUNCTION send_habit_poke(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE from_user_name TEXT;
BEGIN
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

CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
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
        from_user_name || ' sent you a friendly reminder to do "' || business_name || '" because they own stocks in your business.',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name',
            business_name,
            'investor_name',
            from_user_name
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
GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION send_joint_venture_reminder(
        p_from_user_id UUID,
        p_to_user_id UUID,
        p_habit_business_id UUID
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    from_user_name TEXT;
    v_business_name TEXT;
BEGIN
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

-- ─── Joint venture outcome pokes — only the funded/upgraded/deleted
-- messages carried an emoji; declined/expired/vote_failed/vote_expired in
-- these same files were already emoji-free and are left as-is (not
-- redeclared here). Every other line below is unchanged from the current
-- live version of each function. ───

CREATE OR REPLACE FUNCTION accept_joint_venture_invite(
    p_user_id UUID,
    p_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_proposals%ROWTYPE;
    v_participant joint_venture_participants%ROWTYPE;
    v_cash NUMERIC;
    v_accepted_count INTEGER;
    v_total_count INTEGER;
    v_business_type business_types%ROWTYPE;
    v_habit_business_id UUID;
    v_next_order INTEGER;
    v_earnings_per_completion NUMERIC;
    v_participant_row RECORD;
    v_waiting_on TEXT[];
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_proposals WHERE id = p_proposal_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invite not found');
    END IF;
    IF v_proposal.status <> 'pending' OR v_proposal.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This invite is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_participants
    WHERE proposal_id = p_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this invite');
    END IF;

    SELECT cash INTO v_cash FROM user_profiles WHERE id = p_user_id;
    IF v_cash IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    IF v_cash < v_participant.share_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_participant.share_amount || ')');
    END IF;

    PERFORM adjust_user_cash(p_user_id, -v_participant.share_amount);
    UPDATE joint_venture_participants
    SET status = 'accepted', paid = true, paid_at = NOW(), responded_at = NOW()
    WHERE id = v_participant.id;

    -- This participant has responded — their own invite card is resolved
    -- regardless of whether the set is fully funded yet.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_invite'
      AND to_user_id = p_user_id
      AND (metadata->>'proposal_id')::UUID = p_proposal_id;

    SELECT COUNT(*) FILTER (WHERE status = 'accepted' AND paid), COUNT(*)
    INTO v_accepted_count, v_total_count
    FROM joint_venture_participants WHERE proposal_id = p_proposal_id;

    IF v_accepted_count < v_total_count THEN
        SELECT ARRAY(
            SELECT COALESCE(up.name, 'A friend')
            FROM joint_venture_participants p
            JOIN user_profiles up ON up.id = p.user_id
            WHERE p.proposal_id = p_proposal_id AND p.status = 'invited'
        ) INTO v_waiting_on;
        RETURN jsonb_build_object(
            'success', true, 'fully_funded', false,
            'accepted_count', v_accepted_count, 'total_count', v_total_count,
            'waiting_on', to_jsonb(v_waiting_on)
        );
    END IF;

    -- This acceptance is the one that completes the set — materialize the
    -- real business now.
    SELECT * INTO v_business_type FROM business_types WHERE id = v_proposal.business_type_id;
    -- goal_value is always 1 for a joint venture (see the v1 habit-shape
    -- CHECK constraint), so this mirrors calculateReasonableEarnings(base_pay, 1)
    -- client-side: base_pay / 1, already within its own clamp bounds.
    v_earnings_per_completion := v_business_type.base_pay;

    SELECT COALESCE(COUNT(*), 0) + 1 INTO v_next_order
    FROM habit_businesses WHERE user_id = v_proposal.creator_id AND is_active = true;

    INSERT INTO habit_businesses (
        user_id, business_type_id, business_name, business_icon, cost, habit_description,
        recurrence_interval, goal_value, current_progress, earnings_per_completion,
        streak, total_completions, total_earnings, is_active, display_order, user_custom_order,
        is_joint_venture, joint_venture_timezone
    ) VALUES (
        v_proposal.creator_id, v_proposal.business_type_id, v_proposal.business_name, v_proposal.business_icon,
        v_proposal.total_cost, v_proposal.habit_description,
        '24h', 1, 0, v_earnings_per_completion,
        0, 0, 0, true, v_next_order, v_next_order,
        true, v_proposal.creator_timezone
    ) RETURNING id INTO v_habit_business_id;
    -- create_stock_on_business_creation fires unchanged and creates the
    -- matching business_stocks row (business_owner_id = creator, kept only
    -- as the anchor row the existing stock machinery expects — actual
    -- exclusion of every co-owner from buying/holding stock is enforced in
    -- joint_venture_stock_exclusion.sql).

    FOR v_participant_row IN SELECT user_id, is_creator FROM joint_venture_participants WHERE proposal_id = p_proposal_id LOOP
        INSERT INTO business_co_owners (habit_business_id, user_id, is_creator)
        VALUES (v_habit_business_id, v_participant_row.user_id, v_participant_row.is_creator);
    END LOOP;

    UPDATE joint_venture_proposals
    SET status = 'funded', resulting_habit_business_id = v_habit_business_id, updated_at = NOW()
    WHERE id = p_proposal_id;

    -- Every remaining participant has now had this proposal resolved out
    -- from under them too — clear any invite cards still on their feed
    -- (a still-'invited' participant can't happen here since v_accepted_count
    -- = v_total_count just proved everyone paid, but this also mops up the
    -- creator's own copy of the notification stream if one ever exists).
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_invite'
      AND (metadata->>'proposal_id')::UUID = p_proposal_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        '"' || v_proposal.business_name || '" is fully funded and live on everyone''s home page.',
        'joint_venture_resolved', false,
        jsonb_build_object(
            'outcome', 'funded',
            'proposal_id', p_proposal_id,
            'habit_business_id', v_habit_business_id,
            'business_name', v_proposal.business_name,
            'business_icon', v_proposal.business_icon
        )
    FROM joint_venture_participants p WHERE p.proposal_id = p_proposal_id;

    RETURN jsonb_build_object('success', true, 'fully_funded', true, 'habit_business_id', v_habit_business_id);
END;
$$;
GRANT EXECUTE ON FUNCTION accept_joint_venture_invite(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION pay_joint_venture_upgrade_share(
    p_user_id UUID,
    p_upgrade_proposal_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_proposal joint_venture_upgrade_proposals%ROWTYPE;
    v_participant joint_venture_upgrade_participants%ROWTYPE;
    v_cash NUMERIC;
    v_paid_count INTEGER;
    v_total_count INTEGER;
    v_habit habit_businesses%ROWTYPE;
    v_new_type business_types%ROWTYPE;
    v_waiting_on TEXT[];
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT * INTO v_proposal FROM joint_venture_upgrade_proposals WHERE id = p_upgrade_proposal_id FOR UPDATE;
    IF NOT FOUND OR v_proposal.status <> 'pending' OR v_proposal.expires_at <= NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This upgrade request is no longer available');
    END IF;

    SELECT * INTO v_participant FROM joint_venture_upgrade_participants
    WHERE upgrade_proposal_id = p_upgrade_proposal_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND OR v_participant.status <> 'invited' THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already responded to this upgrade request');
    END IF;

    SELECT cash INTO v_cash FROM user_profiles WHERE id = p_user_id;
    IF v_cash < v_participant.share_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds for your share ($' || v_participant.share_amount || ')');
    END IF;

    PERFORM adjust_user_cash(p_user_id, -v_participant.share_amount);
    UPDATE joint_venture_upgrade_participants
    SET status = 'accepted', paid = true, paid_at = NOW(), responded_at = NOW()
    WHERE id = v_participant.id;

    -- This participant has responded — their own request card is resolved
    -- regardless of whether the set is fully funded yet.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_upgrade_request'
      AND to_user_id = p_user_id
      AND (metadata->>'upgrade_proposal_id')::UUID = p_upgrade_proposal_id;

    SELECT COUNT(*) FILTER (WHERE status = 'accepted' AND paid), COUNT(*)
    INTO v_paid_count, v_total_count
    FROM joint_venture_upgrade_participants WHERE upgrade_proposal_id = p_upgrade_proposal_id;

    IF v_paid_count < v_total_count THEN
        SELECT ARRAY(
            SELECT COALESCE(up.name, 'A friend')
            FROM joint_venture_upgrade_participants p
            JOIN user_profiles up ON up.id = p.user_id
            WHERE p.upgrade_proposal_id = p_upgrade_proposal_id AND p.status = 'invited'
        ) INTO v_waiting_on;
        RETURN jsonb_build_object(
            'success', true, 'fully_funded', false,
            'paid_count', v_paid_count, 'total_count', v_total_count,
            'waiting_on', to_jsonb(v_waiting_on)
        );
    END IF;

    -- This payment completes the set — every remaining request card for
    -- this proposal is now stale too.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_upgrade_request'
      AND (metadata->>'upgrade_proposal_id')::UUID = p_upgrade_proposal_id;

    -- This payment completes the set — apply the upgrade now.
    SELECT * INTO v_habit FROM habit_businesses WHERE id = v_proposal.habit_business_id FOR UPDATE;
    IF NOT FOUND OR NOT v_habit.is_active THEN
        RETURN jsonb_build_object('success', false, 'error', 'This business is no longer active');
    END IF;
    SELECT * INTO v_new_type FROM business_types WHERE id = v_proposal.new_business_type_id;

    BEGIN
        PERFORM create_marketplace_listing(v_habit.user_id, v_habit.id, 'upgrade');
    EXCEPTION WHEN OTHERS THEN
        NULL; -- non-fatal, matches the single-owner upgradeHabitBusiness() flow's own tolerance
    END;

    UPDATE habit_businesses
    SET business_type_id = v_new_type.id,
        business_icon = v_new_type.icon,
        cost = v_new_type.base_cost,
        earnings_per_completion = v_new_type.base_pay, -- goal_value is always 1 for a joint venture
        marketplace_bonus_percent = NULL,
        updated_at = NOW()
    WHERE id = v_habit.id;

    UPDATE joint_venture_upgrade_proposals SET status = 'applied', updated_at = NOW() WHERE id = p_upgrade_proposal_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        p_user_id, p.user_id,
        '"' || v_habit.business_name || '" was upgraded to ' || v_new_type.name || '. The old version is now on the Marketplace for a friend to buy.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'upgraded', 'habit_business_id', v_habit.id, 'business_name', v_habit.business_name, 'business_icon', v_new_type.icon)
    FROM joint_venture_upgrade_participants p WHERE p.upgrade_proposal_id = p_upgrade_proposal_id;

    RETURN jsonb_build_object('success', true, 'fully_funded', true, 'habit_business_id', v_habit.id);
END;
$$;
GRANT EXECUTE ON FUNCTION pay_joint_venture_upgrade_share(UUID, UUID) TO authenticated;

-- Not GRANTed to authenticated (called internally by
-- cast_joint_venture_deletion_ballot / defensively by
-- initiate_joint_venture_deletion) — matches its current live declaration.
CREATE OR REPLACE FUNCTION execute_joint_venture_deletion(p_vote_id UUID) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_vote joint_venture_deletion_votes%ROWTYPE;
    v_habit habit_businesses%ROWTYPE;
BEGIN
    SELECT * INTO v_vote FROM joint_venture_deletion_votes WHERE id = p_vote_id;
    SELECT * INTO v_habit FROM habit_businesses WHERE id = v_vote.habit_business_id FOR UPDATE;
    IF NOT FOUND OR NOT v_habit.is_active THEN
        RETURN;
    END IF;

    BEGIN
        PERFORM create_marketplace_listing(v_habit.user_id, v_habit.id, 'habit_deletion');
    EXCEPTION WHEN OTHERS THEN
        NULL; -- non-fatal, matches the single-owner deleteHabitBusiness() flow's own tolerance
    END;

    UPDATE habit_businesses SET is_active = false, updated_at = NOW() WHERE id = v_habit.id;
    -- business_deletion_stock_refund_trigger fires unchanged and refunds any
    -- friend-investors' stock — co-owners never hold stock in their own
    -- venture (see joint_venture_stock_exclusion.sql), so there's nothing on
    -- their side to refund.

    UPDATE joint_venture_deletion_votes SET status = 'executed', updated_at = NOW() WHERE id = p_vote_id;

    -- The vote is decided by this execution — every co-owner's vote-request
    -- card for it is now stale.
    DELETE FROM social_pokes
    WHERE type = 'joint_venture_deletion_vote'
      AND (metadata->>'vote_id')::UUID = p_vote_id;

    INSERT INTO social_pokes (from_user_id, to_user_id, message, type, is_read, metadata)
    SELECT
        v_vote.initiator_id, bco.user_id,
        '"' || v_habit.business_name || '" was deleted. It''s now on the Marketplace, and proceeds will split evenly among all of you.',
        'joint_venture_resolved', false,
        jsonb_build_object('outcome', 'deleted', 'habit_business_id', v_habit.id, 'business_name', v_habit.business_name, 'business_icon', v_habit.business_icon)
    FROM business_co_owners bco WHERE bco.habit_business_id = v_habit.id;
END;
$$;

NOTIFY pgrst, 'reload schema';
