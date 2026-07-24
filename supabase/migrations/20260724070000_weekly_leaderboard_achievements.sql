-- Weekly leaderboard achievements: "Top Earner" and "Top Performer"
--
-- Two new general (account-wide) achievements, awarded to a user who
-- currently sits in 1st place among their own accepted-friend group on the
-- existing weekly leaderboards (get_users_cash_earned / get_users_habits_completed,
-- see 20260721064716_weekly_calendar_reset_leaderboards.sql), gated on having
-- at least 5 accepted friends (same threshold as social_butterfly).
--
-- Like every other general achievement, this is a point-in-time snapshot,
-- not a continuously-enforced state: once check_general_achievements()
-- observes the condition true, the achievement is permanently recorded
-- (ON CONFLICT DO NOTHING), even if a friend later overtakes the leaderboard.
-- This matches e.g. stocks_got_backers, which stays earned even if the
-- backer later sells.
--
-- No scheduler/cron exists in this project (see the "lazy expiry" comment in
-- 20260724060100_marketplace_functions.sql), so "the week" is computed on
-- the fly here via date_trunc('week', NOW()) — a server-side, UTC-anchored
-- approximation of the client's local-Monday week boundary used to render
-- the actual leaderboard UI (see WeeklyReceiptService.getWeekStart() /
-- social.page.ts's getCurrentWeekStart()). Being off by a few hours around
-- the week boundary is an accepted tradeoff, consistent with how every other
-- general achievement here is a best-effort recompute rather than an exact
-- audit trail.
--
-- check_general_achievements() is re-declared in full (as
-- 20260722235413_professional_achievement_notifications.sql already did)
-- purely to insert these two new blocks. Every achievement that existed
-- there is preserved unchanged.

-- 1. Helper: is p_user_id currently #1 among themselves + their accepted
--    friends on this week's cash-earned or completions leaderboard?
--    Requires 5+ accepted friends (same gate as social_butterfly) and a
--    nonzero total (no awarding "first place" for a group that did nothing).
CREATE OR REPLACE FUNCTION check_weekly_leaderboard_first(p_user_id UUID, p_metric TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_week_start TIMESTAMPTZ := date_trunc('week', NOW());
    v_friend_ids UUID[];
    v_all_ids UUID[];
    v_user_total NUMERIC;
    v_max_other_total NUMERIC;
BEGIN
    SELECT ARRAY(
        SELECT friend_id FROM friendships WHERE user_id = p_user_id AND status = 'accepted'
        UNION
        SELECT user_id FROM friendships WHERE friend_id = p_user_id AND status = 'accepted'
    ) INTO v_friend_ids;

    IF COALESCE(array_length(v_friend_ids, 1), 0) < 5 THEN
        RETURN false;
    END IF;

    v_all_ids := v_friend_ids || p_user_id;

    IF p_metric = 'cash' THEN
        SELECT COALESCE(MAX(total_earned) FILTER (WHERE user_id = p_user_id), 0),
               COALESCE(MAX(total_earned) FILTER (WHERE user_id != p_user_id), 0)
        INTO v_user_total, v_max_other_total
        FROM get_users_cash_earned(v_all_ids, 'weekly', v_week_start);
    ELSE
        SELECT COALESCE(MAX(total_completed) FILTER (WHERE user_id = p_user_id), 0),
               COALESCE(MAX(total_completed) FILTER (WHERE user_id != p_user_id), 0)
        INTO v_user_total, v_max_other_total
        FROM get_users_habits_completed(v_all_ids, v_week_start);
    END IF;

    RETURN v_user_total > 0 AND v_user_total > v_max_other_total;
END;
$$;
GRANT EXECUTE ON FUNCTION check_weekly_leaderboard_first(UUID, TEXT) TO authenticated;

-- 2. Re-declare check_general_achievements to add the two new blocks and
--    bump the Legend threshold (24 -> 26 general achievements, plus one per
--    business type, now that 2 more exist).
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

    -- Weekly leaderboard: 1st place among 5+ accepted friends. Point-in-time
    -- snapshot, same as the rest of this function — see the comment at the
    -- top of 20260724070000_weekly_leaderboard_achievements.sql.
    IF check_weekly_leaderboard_first(p_user_id, 'cash') THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'leaderboard_cash_first', 'leaderboard', '🥇', 'Top Earner')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'leaderboard_cash_first', 'Top Earner', '🥇', 'finished #1 on their friend group''s weekly cash-earned leaderboard (5+ friends)'); END IF;
        END IF;
    END IF;

    IF check_weekly_leaderboard_first(p_user_id, 'completions') THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'leaderboard_completions_first', 'leaderboard', '🏆', 'Top Performer')
        ON CONFLICT (user_id, achievement_key) DO NOTHING
        RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'leaderboard_completions_first', 'Top Performer', '🏆', 'finished #1 on their friend group''s weekly completions leaderboard (5+ friends)'); END IF;
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
    -- computed the same way as prior migrations (kept in sync with the count
    -- of business types so it stays correct as more get added). Bumped from
    -- 24 to 26 for the two new leaderboard achievements added by this
    -- migration.
    v_legend_threshold := 26 + (SELECT COUNT(*) FROM business_types);

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

-- 3. One-time silent re-check: award the new achievements to anyone who
--    already qualifies today, without spamming friend notifications.
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT id FROM user_profiles LOOP
        PERFORM check_general_achievements(r.id, false);
    END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';
