-- Bug: 20260822040000_habit_tycoon_achievements.sql redefined
-- check_general_achievements() but accidentally reverted every
-- notify_friends_of_general_achievement(...) call inside it back to the
-- old 4-argument form (p_user_id, key, label, emoji). The live function
-- only has the 5-argument overload (...,  p_description), added in
-- 20260722235413_professional_achievement_notifications.sql and confirmed
-- current in 20260819000000_self_achievement_notifications.sql — the
-- 4-arg overload was explicitly DROPPED back then.
--
-- Since check_general_achievements() runs (via
-- trg_check_general_achievements_on_completion) on every habit completion,
-- this broke habit completion entirely for any account, with:
--   "Failed to complete habit: function
--    notify_friends_of_general_achievement(uuid, text, text, text)
--    does not exist"
--
-- Fix: re-declare check_general_achievements() (same as
-- 20260822040000_habit_tycoon_achievements.sql) with every notify call
-- passing a p_description as the 5th argument, matching the live
-- notify_friends_of_general_achievement signature.

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
    v_tycoon_active_count INTEGER;
    v_tycoon_distinct_active_types INTEGER;
    v_tycoon_type_count INTEGER;
    v_tycoon_min_cost NUMERIC;
    v_tycoon_max_cost NUMERIC;
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

    SELECT COUNT(*) INTO v_tycoon_active_count
    FROM habit_businesses hb
    WHERE hb.user_id = p_user_id AND hb.is_active = true AND hb.business_tier = 2;

    SELECT COUNT(DISTINCT hb.business_type_id) INTO v_tycoon_distinct_active_types
    FROM habit_businesses hb
    WHERE hb.user_id = p_user_id AND hb.is_active = true AND hb.business_tier = 2;

    SELECT COUNT(*) INTO v_tycoon_type_count FROM business_types WHERE tier = 2;
    SELECT MIN(base_cost), MAX(base_cost) INTO v_tycoon_min_cost, v_tycoon_max_cost FROM business_types WHERE tier = 2;

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
    -- Scoped to tier 1 only — the Habit Tycoon tier (business_types.tier = 2)
    -- gets its own dedicated achievements below instead of doubling up
    -- identically-labelled "X Owner" badges.
    FOR v_biz IN SELECT id, name, icon FROM business_types WHERE tier = 1 ORDER BY id LOOP
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

    -- Full portfolio: every TIER-1 business type owned at once (unchanged
    -- meaning from before the Tycoon tier existed — "Full Tycoon Portfolio"
    -- below is the tier-2 equivalent).
    IF (
        SELECT COUNT(DISTINCT hb.business_type_id) FROM habit_businesses hb
        WHERE hb.user_id = p_user_id AND hb.is_active = true AND hb.business_tier = 1
    ) >= (SELECT COUNT(*) FROM business_types WHERE tier = 1) THEN
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

    -- ─── Habit Tycoon achievements (20, all category = 'tycoon', all hidden
    -- client-side until earned — see achievements.service.ts) ───

    -- 1. Tycoon Debut: first-ever Habit Tycoon purchase on any habit
    IF EXISTS (SELECT 1 FROM habit_businesses WHERE user_id = p_user_id AND first_tycoon_purchase_at IS NOT NULL) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_debut', 'tycoon', '🏆', 'Tycoon Debut')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_debut', 'Tycoon Debut', '🏆', 'made their first-ever purchase in the Habit Tycoon tier'); END IF;
        END IF;
    END IF;

    -- 2. Second Wind: upgraded past the first Tycoon business at least once
    IF EXISTS (
        SELECT 1 FROM habit_businesses hb JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.user_id = p_user_id AND bt.tier = 2 AND bt.base_cost > v_tycoon_min_cost
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_second_wind', 'tycoon', '📈', 'Second Wind')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_second_wind', 'Second Wind', '📈', 'upgraded past their first Habit Tycoon business'); END IF;
        END IF;
    END IF;

    -- 3. Oil Baron II: reached the top Habit Tycoon business type
    IF EXISTS (
        SELECT 1 FROM habit_businesses hb JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.user_id = p_user_id AND bt.tier = 2 AND bt.base_cost = v_tycoon_max_cost
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_oil_baron_ii', 'tycoon', '🛢️', 'Oil Baron II')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_oil_baron_ii', 'Oil Baron II', '🛢️', 'reached the top Habit Tycoon business type'); END IF;
        END IF;
    END IF;

    -- 4. Speed Baron: first Tycoon purchase to the top Tycoon business, same habit, within 7 days
    IF EXISTS (
        SELECT 1 FROM habit_businesses hb JOIN business_types bt ON bt.id = hb.business_type_id
        WHERE hb.user_id = p_user_id AND bt.tier = 2 AND bt.base_cost = v_tycoon_max_cost
            AND hb.first_tycoon_purchase_at IS NOT NULL
            AND hb.updated_at - hb.first_tycoon_purchase_at <= INTERVAL '7 days'
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_speed_baron', 'tycoon', '⚡', 'Speed Baron')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_speed_baron', 'Speed Baron', '⚡', 'went from their first Habit Tycoon purchase to the top Habit Tycoon business on the same habit within 7 days'); END IF;
        END IF;
    END IF;

    -- 5. Tycoon Dynasty: Tycoon status held continuously for 30+ days
    IF EXISTS (
        SELECT 1 FROM habit_businesses
        WHERE user_id = p_user_id AND is_active = true AND business_tier = 2
            AND first_tycoon_purchase_at <= NOW() - INTERVAL '30 days'
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_dynasty', 'tycoon', '👑', 'Tycoon Dynasty')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_dynasty', 'Tycoon Dynasty', '👑', 'held Habit Tycoon status on a business for 30 straight days'); END IF;
        END IF;
    END IF;

    -- 6. Tycoon Trio: 3 habits with active Tycoon status at once
    IF v_tycoon_active_count >= 3 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_trio', 'tycoon', '🎩', 'Tycoon Trio')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_trio', 'Tycoon Trio', '🎩', 'had 3 habits with active Habit Tycoon status at once'); END IF;
        END IF;
    END IF;

    -- 7. Tycoon Empire: 5 habits with active Tycoon status at once
    IF v_tycoon_active_count >= 5 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_empire', 'tycoon', '🏙️', 'Tycoon Empire')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_empire', 'Tycoon Empire', '🏙️', 'had 5 habits with active Habit Tycoon status at once'); END IF;
        END IF;
    END IF;

    -- 8. Full Tycoon Portfolio: all 10 Habit Tycoon business types owned at once
    IF v_tycoon_distinct_active_types >= v_tycoon_type_count THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_full_portfolio', 'tycoon', '🗂️', 'Full Tycoon Portfolio')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_full_portfolio', 'Full Tycoon Portfolio', '🗂️', 'now owns every Habit Tycoon business type at once'); END IF;
        END IF;
    END IF;

    -- 9-12. Net worth ladder above Trillionaire
    IF v_net_worth >= 1000000000000000::NUMERIC THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_quadrillionaire', 'tycoon', '💎', 'Quadrillionaire')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_quadrillionaire', 'Quadrillionaire', '💎', 'reached a net worth of $1,000,000,000,000,000'); END IF;
        END IF;
    END IF;

    IF v_net_worth >= 1000000000000000000::NUMERIC THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_quintillion_club', 'tycoon', '🌌', 'Quintillion Club')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_quintillion_club', 'Quintillion Club', '🌌', 'reached a net worth of $1,000,000,000,000,000,000'); END IF;
        END IF;
    END IF;

    IF v_net_worth >= 1000000000000000000000000::NUMERIC THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_septillion_status', 'tycoon', '✨', 'Septillion Status')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_septillion_status', 'Septillion Status', '✨', 'reached a net worth of $1,000,000,000,000,000,000,000,000'); END IF;
        END IF;
    END IF;

    IF v_net_worth >= 10000000000000000000000000000::NUMERIC THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_octillion_overlord', 'tycoon', '🪐', 'Octillion Overlord')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_octillion_overlord', 'Octillion Overlord', '🪐', 'reached a net worth of $10,000,000,000,000,000,000,000,000,000'); END IF;
        END IF;
    END IF;

    -- 13. Tycoon Streak: 100+ day streak on a Tycoon-status habit
    IF EXISTS (SELECT 1 FROM habit_businesses WHERE user_id = p_user_id AND business_tier = 2 AND longest_streak >= 100) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_streak', 'tycoon', '🔥', 'Tycoon Streak')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_streak', 'Tycoon Streak', '🔥', 'reached a 100-day streak on a Habit Tycoon-status habit'); END IF;
        END IF;
    END IF;

    -- 14. Double Century: 200+ day streak on a Tycoon-status habit
    IF EXISTS (SELECT 1 FROM habit_businesses WHERE user_id = p_user_id AND business_tier = 2 AND longest_streak >= 200) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_double_century', 'tycoon', '💯', 'Double Century')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_double_century', 'Double Century', '💯', 'reached a 200-day streak on a Habit Tycoon-status habit'); END IF;
        END IF;
    END IF;

    -- 15. Triple Threat: 3 separate habits each with all 6 milestones earned
    IF (
        SELECT COUNT(*) FROM (
            SELECT habit_business_id FROM habit_milestone_achievements
            WHERE user_id = p_user_id
            GROUP BY habit_business_id
            HAVING COUNT(DISTINCT milestone_key) >= 6
        ) sub
    ) >= 3 THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_triple_threat', 'tycoon', '🎯', 'Triple Threat')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_triple_threat', 'Triple Threat', '🎯', 'earned all 6 milestone badges on 3 separate habits'); END IF;
        END IF;
    END IF;

    -- 16. Tycoon Trader: sold a Habit Tycoon business on the Marketplace
    IF EXISTS (
        SELECT 1 FROM marketplace_listings ml JOIN business_types bt ON bt.id = ml.business_type_id
        WHERE ml.seller_id = p_user_id AND bt.tier = 2 AND ml.status = 'sold'
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_trader', 'tycoon', '💼', 'Tycoon Trader')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_trader', 'Tycoon Trader', '💼', 'sold a Habit Tycoon business on the Marketplace'); END IF;
        END IF;
    END IF;

    -- 17. Hostile Takeover: bought a Habit Tycoon business from another player on the Marketplace
    IF EXISTS (
        SELECT 1 FROM marketplace_purchases mp JOIN business_types bt ON bt.id = mp.business_type_id
        WHERE mp.buyer_id = p_user_id AND bt.tier = 2
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_hostile_takeover', 'tycoon', '🤝', 'Hostile Takeover')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_hostile_takeover', 'Hostile Takeover', '🤝', 'bought a Habit Tycoon business from another player on the Marketplace'); END IF;
        END IF;
    END IF;

    -- 18. Joint Tycoon: co-own a Habit Tycoon business via a Joint Venture
    IF EXISTS (
        SELECT 1 FROM business_co_owners bco JOIN habit_businesses hb ON hb.id = bco.habit_business_id
        WHERE bco.user_id = p_user_id AND hb.business_tier = 2
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_joint_tycoon', 'tycoon', '🧑‍🤝‍🧑', 'Joint Tycoon')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_joint_tycoon', 'Joint Tycoon', '🧑‍🤝‍🧑', 'co-owns a Habit Tycoon business through a Joint Venture'); END IF;
        END IF;
    END IF;

    -- 19. Tycoon Shareholder: own stock in a Habit Tycoon business
    IF EXISTS (
        SELECT 1 FROM stock_holdings sh
        JOIN business_stocks bs ON bs.id = sh.stock_id
        JOIN habit_businesses hb ON hb.id = bs.habit_business_id
        WHERE sh.holder_id = p_user_id AND sh.shares_owned > 0 AND hb.business_tier = 2
    ) THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_shareholder', 'tycoon', '📊', 'Tycoon Shareholder')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_shareholder', 'Tycoon Shareholder', '📊', 'owns stock in a Habit Tycoon business'); END IF;
        END IF;
    END IF;

    -- 20. Old Money: hold Full Portfolio (all 10 tier-1 types) and Habit Tycoon status at once
    IF EXISTS (SELECT 1 FROM general_achievements WHERE user_id = p_user_id AND achievement_key = 'business_full_portfolio')
        AND EXISTS (SELECT 1 FROM habit_businesses WHERE user_id = p_user_id AND is_active = true AND business_tier = 2)
    THEN
        v_inserted_id := NULL;
        INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
        VALUES (p_user_id, 'tycoon_old_money', 'tycoon', '🕰️', 'Old Money')
        ON CONFLICT (user_id, achievement_key) DO NOTHING RETURNING id INTO v_inserted_id;
        IF v_inserted_id IS NOT NULL THEN
            v_new_count := v_new_count + 1;
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'tycoon_old_money', 'Old Money', '🕰️', 'holds a Full Portfolio and Habit Tycoon status at the same time'); END IF;
        END IF;
    END IF;

    -- Meta: Legend — every other general achievement earned, EXCLUDING the
    -- 'tycoon' category so existing/aspiring Legend holders aren't
    -- retroactively required to clear late-game Tycoon content. Threshold is
    -- computed rather than hardcoded so it stays correct if more tier-1
    -- business types are ever added:
    -- 4 net worth + 3 business extras + 4 dividends + 3 stock extras
    -- + 3 social (first friend, social butterfly, first poke) + 4 completions
    -- + 2 perfect + 1 completionist = 24, plus one "owned" achievement per
    -- tier-1 business type.
    v_legend_threshold := 24 + (SELECT COUNT(*) FROM business_types WHERE tier = 1);

    SELECT COUNT(*) INTO v_other_general_count
    FROM general_achievements WHERE user_id = p_user_id AND achievement_key != 'meta_legend' AND category != 'tycoon';

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

NOTIFY pgrst, 'reload schema';
