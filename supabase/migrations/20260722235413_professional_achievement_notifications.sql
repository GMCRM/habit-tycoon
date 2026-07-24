-- Professional, descriptive friend-achievement notifications
--
-- Reworks the friend-facing notification text for BOTH achievement systems:
--   - habit_milestone_achievements  (per-habit streak/completions, see
--     habit-milestone-achievements.sql / 021-fix-milestone-achievements-longest-streak.sql)
--   - general_achievements          (account-wide, see 022-general-achievements.sql)
--
-- Two problems with the existing copy:
--
-- 1. Tone/content: messages were terse and generic ("X just hit 🏆 on 🍋
--    Lemonade Stand!" / "X just earned 💰 Millionaire!"). Friends could see
--    that *something* happened but not what it actually took to earn it.
--    This migration adds a short, specific description to every
--    notification (mirroring the copy already shown in-app via
--    achievements.service.ts's MILESTONE_DEFINITIONS / GENERAL_ACHIEVEMENTS),
--    so the message itself explains the accomplishment.
--
-- 2. Privacy leak: notify_friends_of_milestone's message built its business
--    reference as COALESCE(business_type_name, business_name) — business_name
--    is the user's own private, freely-typed label for that specific habit
--    (e.g. "Morning Pages", "Quit Vaping"). If a habit's business_type
--    lookup ever came back empty, the private name would leak straight into
--    a friend's notification feed. business_type_id is NOT NULL and always
--    references a real row in business_types, so that fallback could never
--    actually trigger today — but it's exactly the kind of latent bug that
--    becomes real the moment the data model changes. This migration removes
--    the private-name fallback entirely: only the public business TYPE name
--    (e.g. "Lemonade Stand") and icon are ever referenced, with a generic
--    "a business" fallback if the type lookup somehow comes back empty.
--
-- Run this entire script in your Supabase SQL Editor (after
-- 022-general-achievements.sql).

-- ============================================================
-- 1. General (account-wide) achievements
-- ============================================================

-- Old signature took no description; drop it explicitly before recreating
-- with an extra parameter so there's no ambiguous overload left behind.
DROP FUNCTION IF EXISTS notify_friends_of_general_achievement(UUID, TEXT, TEXT, TEXT);

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
    v_friend_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
    FROM user_profiles up WHERE up.id = p_user_id;

    v_message := v_achiever_name || ' just earned the ' || p_emoji || ' ' || p_label ||
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

    RETURN v_notifications_sent;
END;
$$;
GRANT EXECUTE ON FUNCTION notify_friends_of_general_achievement(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Re-declared in full (same detection/award logic as 022-general-achievements.sql)
-- purely to thread a p_description through to every notify call above. Every
-- achievement category that existed in 022 is preserved here — none dropped.
CREATE OR REPLACE FUNCTION check_general_achievements(p_user_id UUID, p_notify BOOLEAN DEFAULT true)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_net_worth NUMERIC;
    v_total_dividends NUMERIC;
    v_distinct_stocks INTEGER;
    v_friend_count INTEGER;
    v_global_completions INTEGER;
    v_other_general_count INTEGER;
    v_legend_threshold INTEGER;
    v_def RECORD;
    v_biz RECORD;
    v_article TEXT;
    v_inserted_id UUID;
    v_new_count INTEGER := 0;
    v_key TEXT;
BEGIN
    SELECT COALESCE(net_worth, 0) INTO v_net_worth FROM user_profiles WHERE id = p_user_id;

    SELECT COALESCE(SUM(sh.total_dividends_earned), 0) INTO v_total_dividends
    FROM stock_holdings sh WHERE sh.holder_id = p_user_id;

    SELECT COUNT(DISTINCT sh.stock_id) INTO v_distinct_stocks
    FROM stock_holdings sh WHERE sh.holder_id = p_user_id AND sh.shares_owned > 0;

    SELECT COUNT(*) INTO v_friend_count
    FROM (
        SELECT friend_id AS fid FROM friendships WHERE user_id = p_user_id AND status = 'accepted'
        UNION
        SELECT user_id AS fid FROM friendships WHERE friend_id = p_user_id AND status = 'accepted'
    ) f;

    SELECT COUNT(*) INTO v_global_completions
    FROM habit_completions WHERE user_id = p_user_id;

    -- Net worth tiers
    FOR v_def IN
        SELECT * FROM (VALUES
            ('networth_10k', 'net_worth', 10000::NUMERIC, '💵', 'Getting Started', 'reached a net worth of $10,000'),
            ('networth_1m', 'net_worth', 1000000::NUMERIC, '🤑', 'Millionaire', 'reached a net worth of $1,000,000'),
            ('networth_1b', 'net_worth', 1000000000::NUMERIC, '💰', 'Billionaire', 'reached a net worth of $1,000,000,000'),
            ('networth_1t', 'net_worth', 1000000000000::NUMERIC, '👑', 'Trillionaire', 'reached a net worth of $1,000,000,000,000')
        ) AS d(achievement_key, category, threshold, emoji, label, description)
    LOOP
        IF v_net_worth >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji, v_def.description); END IF;
            END IF;
        END IF;
    END LOOP;

    -- Business empire: one achievement per business type ever owned (active).
    -- Only the public business TYPE name/icon (e.g. "Lemonade Stand") is ever
    -- used here — never the user's own private name for their specific habit.
    FOR v_biz IN SELECT id, name, icon FROM business_types ORDER BY id LOOP
        IF EXISTS (
            SELECT 1 FROM habit_businesses hb
            WHERE hb.user_id = p_user_id AND hb.business_type_id = v_biz.id AND hb.is_active = true
        ) THEN
            v_key := 'business_owned_' || v_biz.id;
            v_article := CASE WHEN LEFT(v_biz.name, 1) IN ('A','E','I','O','U') THEN 'an ' ELSE 'a ' END;
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_key, 'business', v_biz.icon, v_biz.name || ' Owner')
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_key, v_biz.name || ' Owner', v_biz.icon, 'now owns ' || v_article || v_biz.name); END IF;
            END IF;
        END IF;
    END LOOP;

    -- Full portfolio: every business type owned at once
    IF (
        SELECT COUNT(DISTINCT hb.business_type_id) FROM habit_businesses hb
        WHERE hb.user_id = p_user_id AND hb.is_active = true
    ) >= (SELECT COUNT(*) FROM business_types) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'business_full_portfolio', 'business', '🏙️', 'Full Portfolio')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_full_portfolio', 'Full Portfolio', '🏙️', 'now owns every business type at once'); END IF;
        END IF;
    END IF;

    -- First upgrade
    IF EXISTS (SELECT 1 FROM business_upgrades WHERE user_id = p_user_id) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'business_first_upgrade', 'business', '⬆️', 'First Upgrade')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_first_upgrade', 'First Upgrade', '⬆️', 'upgraded one of their businesses to a pricier type for the first time'); END IF;
        END IF;
    END IF;

    -- First sale
    IF EXISTS (SELECT 1 FROM business_sales WHERE user_id = p_user_id) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'business_first_sale', 'business', '💸', 'Cashing Out')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_first_sale', 'Cashing Out', '💸', 'sold one of their own businesses for the first time'); END IF;
        END IF;
    END IF;

    -- Dividend ladder (cumulative dividends earned as an investor)
    FOR v_def IN
        SELECT * FROM (VALUES
            ('dividends_10', 'stocks', 10::NUMERIC, '🪙', 'First Dividends', 'earned $10 in cumulative dividends'),
            ('dividends_100', 'stocks', 100::NUMERIC, '💵', 'Dividend Earner', 'earned $100 in cumulative dividends'),
            ('dividends_1000', 'stocks', 1000::NUMERIC, '💰', 'Dividend Investor', 'earned $1,000 in cumulative dividends'),
            ('dividends_10000', 'stocks', 10000::NUMERIC, '🏦', 'Dividend Tycoon', 'earned $10,000 in cumulative dividends')
        ) AS d(achievement_key, category, threshold, emoji, label, description)
    LOOP
        IF v_total_dividends >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji, v_def.description); END IF;
            END IF;
        END IF;
    END LOOP;

    -- First investment (holds shares in any stock)
    IF EXISTS (SELECT 1 FROM stock_holdings WHERE holder_id = p_user_id AND shares_owned > 0) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'stocks_first_investment', 'stocks', '📈', 'First Investment')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_first_investment', 'First Investment', '📈', 'bought stock in a business for the first time'); END IF;
        END IF;
    END IF;

    -- Diversified: holds shares in 3+ distinct businesses
    IF v_distinct_stocks >= 3 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'stocks_diversified', 'stocks', '📊', 'Diversified')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_diversified', 'Diversified', '📊', 'now holds stock in 3 or more different businesses'); END IF;
        END IF;
    END IF;

    -- Got backers: someone else holds shares in your own business
    IF EXISTS (
        SELECT 1 FROM business_stocks bs
        JOIN stock_holdings sh ON sh.stock_id = bs.id
        WHERE bs.business_owner_id = p_user_id
            AND sh.holder_id != p_user_id
            AND sh.shares_owned > 0
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'stocks_got_backers', 'stocks', '🤝', 'Got Backers')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_got_backers', 'Got Backers', '🤝', 'had another investor buy stock in one of their businesses'); END IF;
        END IF;
    END IF;

    -- Social: first friend / social butterfly
    IF v_friend_count >= 1 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'social_first_friend', 'social', '🧑‍🤝‍🧑', 'First Friend')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_first_friend', 'First Friend', '🧑‍🤝‍🧑', 'made their first friend'); END IF;
        END IF;
    END IF;

    IF v_friend_count >= 5 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'social_butterfly', 'social', '🦋', 'Social Butterfly')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_butterfly', 'Social Butterfly', '🦋', 'made 5 friends'); END IF;
        END IF;
    END IF;

    -- First poke/reminder sent (habit poke or stockholder reminder)
    IF EXISTS (
        SELECT 1 FROM social_pokes
        WHERE from_user_id = p_user_id AND type IN ('habit_reminder', 'stockholder_reminder')
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'social_first_poke', 'social', '👋', 'Friendly Reminder')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_first_poke', 'Friendly Reminder', '👋', 'sent a friend a reminder for the first time'); END IF;
        END IF;
    END IF;

    -- NOTE: "first challenge joined" remains omitted — challenge_participants
    -- doesn't exist in the live schema. See 022-general-achievements.sql.

    -- Global habit completions ladder (across ALL habit-businesses combined)
    FOR v_def IN
        SELECT * FROM (VALUES
            ('completions_global_1', 'completions', 1::NUMERIC, '✅', 'First Completion', 'completed a habit for the first time'),
            ('completions_global_50', 'completions', 50::NUMERIC, '⭐', '50 Completions', 'completed habits 50 times in total, across all businesses'),
            ('completions_global_100', 'completions', 100::NUMERIC, '🌟', '100 Completions', 'completed habits 100 times in total, across all businesses'),
            ('completions_global_1000', 'completions', 1000::NUMERIC, '🎖️', '1,000 Completions', 'completed habits 1,000 times in total, across all businesses')
        ) AS d(achievement_key, category, threshold, emoji, label, description)
    LOOP
        IF v_global_completions >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji, v_def.description); END IF;
            END IF;
        END IF;
    END LOOP;

    -- Perfect week / perfect month (whole-account)
    IF check_perfect_period(p_user_id, 7) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'perfect_week', 'perfect', '🗓️', 'Perfect Week')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'perfect_week', 'Perfect Week', '🗓️', 'completed every active habit every day for a full week'); END IF;
        END IF;
    END IF;

    IF check_perfect_period(p_user_id, 30) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'perfect_month', 'perfect', '📆', 'Perfect Month')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'perfect_month', 'Perfect Month', '📆', 'completed every active habit every day for a full month'); END IF;
        END IF;
    END IF;

    -- Meta: Completionist — all 6 per-habit milestone badges on a single habit
    IF EXISTS (
        SELECT habit_business_id FROM habit_milestone_achievements
        WHERE user_id = p_user_id
        GROUP BY habit_business_id
        HAVING COUNT(DISTINCT milestone_key) >= 6
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'meta_completionist', 'meta', '🧩', 'Completionist')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'meta_completionist', 'Completionist', '🧩', 'earned all 6 milestone badges on a single habit'); END IF;
        END IF;
    END IF;

    -- Meta: Legend — every other general achievement earned. Threshold
    -- computed the same way as 022-general-achievements.sql (kept in sync
    -- with the count of business types so it stays correct as more get added).
    v_legend_threshold := 24 + (SELECT COUNT(*) FROM business_types);

    SELECT COUNT(*) INTO v_other_general_count
    FROM general_achievements WHERE user_id = p_user_id AND achievement_key != 'meta_legend';

    IF v_other_general_count >= v_legend_threshold THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'meta_legend', 'meta', '🏅', 'Legend')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'meta_legend', 'Legend', '🏅', 'earned every other general achievement'); END IF;
        END IF;
    END IF;

    RETURN v_new_count;
END;
$$;
GRANT EXECUTE ON FUNCTION check_general_achievements(UUID, BOOLEAN) TO authenticated;

-- ============================================================
-- 2. Per-habit milestone achievements
-- ============================================================

-- Redefine to: (a) build a professional, descriptive message that names the
-- specific milestone and what it took to earn it, and (b) drop the
-- COALESCE(...,  v_business_name) fallback so the user's own private habit
-- name can never appear in a friend-facing message — only the public
-- business TYPE name/icon (e.g. "Lemonade Stand" / 🍋), same as the general
-- achievements above.
DROP FUNCTION IF EXISTS notify_friends_of_milestone(UUID, UUID);
CREATE OR REPLACE FUNCTION notify_friends_of_milestone(
        habit_business_uuid UUID,
        achiever_user_id UUID
    ) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_longest_streak INTEGER;
    v_total_completions INTEGER;
    v_business_type_name TEXT;
    v_business_type_icon TEXT;
    v_achiever_name TEXT;
    v_milestone RECORD;
    v_message TEXT;
    v_friend_id UUID;
    v_inserted_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    -- 1. Load only the PUBLIC business type name/icon for this habit — never
    --    hb.business_name/hb.business_icon, which are the user's own private
    --    label for this specific habit and must never reach a friend.
    SELECT hb.longest_streak,
        hb.total_completions,
        bt.name,
        bt.icon INTO v_longest_streak,
        v_total_completions,
        v_business_type_name,
        v_business_type_icon
    FROM habit_businesses hb
        LEFT JOIN business_types bt ON bt.id = hb.business_type_id
    WHERE hb.id = habit_business_uuid
        AND hb.user_id = achiever_user_id;

    IF NOT FOUND THEN RETURN 0; END IF;

    -- Generic, still-non-identifying fallback if the business type lookup
    -- ever comes back empty. Deliberately never falls back to the private
    -- per-habit name.
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

            -- Only notify friends the first time this milestone is newly earned
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
            END IF;
        END IF;
    END LOOP;

    RETURN v_notifications_sent;
END;
$$;
GRANT EXECUTE ON FUNCTION notify_friends_of_milestone(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
