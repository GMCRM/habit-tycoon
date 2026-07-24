-- General (account-wide) Achievements
--
-- Companion to habit-milestone-achievements.sql / 021-fix-milestone-achievements-longest-streak.sql,
-- which only ever award badges scoped to a single habit-business. This adds a second,
-- account-wide achievement system covering net worth, business ownership, stocks/dividends,
-- social activity, lifetime habit completions across ALL habits, and whole-account
-- "perfect period" streaks — surfaced in the app as the new "General" achievements sub-tab.
--
-- Design mirrors the milestone system exactly: a permanent-record table + a single
-- SECURITY DEFINER function that recomputes current stats, awards anything newly
-- qualified (idempotent via ON CONFLICT DO NOTHING ... RETURNING id), and notifies
-- accepted friends the first time each one is earned.
--
-- Unlike the milestone system (which is only re-checked from the one client code path
-- that calls notify_friends_of_milestone after a habit completion), general achievements
-- span many different kinds of events across the app (net worth changes, friend
-- acceptance, challenges, pokes...). Rather than threading a client-side RPC call through
-- every one of those code paths, this migration hooks check_general_achievements(...) into
-- the actual data-changing events themselves — either via a trigger on the table that
-- records the event, or by extending recalculate_net_worth() (already the single
-- choke point every cash-mutating action funnels through) — so it fires reliably
-- regardless of which client code path (RPC or legacy direct-table-write fallback)
-- caused the change.
--
-- Run this entire script in your Supabase SQL Editor (after 021-fix-milestone-achievements-longest-streak.sql).

-- 1. Table
CREATE TABLE IF NOT EXISTS general_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_key TEXT NOT NULL,
    category TEXT NOT NULL,
    emoji TEXT NOT NULL,
    label TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_general_achievements_user ON general_achievements(user_id);

ALTER TABLE general_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own general achievements" ON general_achievements;
CREATE POLICY "Users can view own general achievements" ON general_achievements FOR
SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policy for regular users — rows are only ever
-- written by the SECURITY DEFINER functions below.

-- 2. Helper: whole-account "perfect period" check.
--    True when every habit-business that has existed for the full trailing
--    p_days-day window (created on/before the window start, still active
--    today) was completed on every single day of that window. A user with
--    zero qualifying habit-businesses never counts as "perfect" (no vacuous
--    truth). Businesses created mid-window, or deleted since, are excluded —
--    a pragmatic whole-account definition rather than trying to reconstruct
--    exactly which businesses were active on each historical day.
CREATE OR REPLACE FUNCTION check_perfect_period(p_user_id UUID, p_days INTEGER)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_window_start DATE := CURRENT_DATE - (p_days - 1);
    v_active_count INTEGER;
    v_missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_active_count
    FROM habit_businesses hb
    WHERE hb.user_id = p_user_id
        AND hb.is_active = true
        AND hb.created_at::DATE <= v_window_start;

    IF v_active_count = 0 THEN
        RETURN false;
    END IF;

    SELECT COUNT(*) INTO v_missing_count
    FROM habit_businesses hb
    CROSS JOIN generate_series(v_window_start, CURRENT_DATE, INTERVAL '1 day') AS d(day)
    WHERE hb.user_id = p_user_id
        AND hb.is_active = true
        AND hb.created_at::DATE <= v_window_start
        AND NOT EXISTS (
            SELECT 1 FROM habit_completions hc
            WHERE hc.habit_business_id = hb.id
                AND hc.completed_at::DATE = d.day::DATE
        );

    RETURN v_missing_count = 0;
END;
$$;
GRANT EXECUTE ON FUNCTION check_perfect_period(UUID, INTEGER) TO authenticated;

-- 3. Helper: notify accepted friends of a newly-earned general achievement.
--    Factored out of check_general_achievements below since it's called
--    once per newly-crossed achievement (up to ~35 possible per call).
CREATE OR REPLACE FUNCTION notify_friends_of_general_achievement(
    p_user_id UUID,
    p_achievement_key TEXT,
    p_label TEXT,
    p_emoji TEXT
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_achiever_name TEXT;
    v_message TEXT;
    v_friend_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
    FROM user_profiles up WHERE up.id = p_user_id;

    v_message := v_achiever_name || ' just earned ' || p_emoji || ' ' || p_label || '!';

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
GRANT EXECUTE ON FUNCTION notify_friends_of_general_achievement(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 4. Main entry point: recompute stats and award anything newly qualified.
--    p_notify = false is used only by the one-time backfill at the bottom of
--    this file, so existing users aren't flooded with "just earned" friend
--    notifications for achievements they've actually held for a while
--    (matches how habit-milestone-achievements.sql's backfill is silent too).
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
            ('networth_10k', 'net_worth', 10000::NUMERIC, '💵', 'Getting Started'),
            ('networth_1m', 'net_worth', 1000000::NUMERIC, '🤑', 'Millionaire'),
            ('networth_1b', 'net_worth', 1000000000::NUMERIC, '💰', 'Billionaire'),
            ('networth_1t', 'net_worth', 1000000000000::NUMERIC, '👑', 'Trillionaire')
        ) AS d(achievement_key, category, threshold, emoji, label)
    LOOP
        IF v_net_worth >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji); END IF;
            END IF;
        END IF;
    END LOOP;

    -- Business empire: one achievement per business type ever owned (active)
    FOR v_biz IN SELECT id, name, icon FROM business_types ORDER BY id LOOP
        IF EXISTS (
            SELECT 1 FROM habit_businesses hb
            WHERE hb.user_id = p_user_id AND hb.business_type_id = v_biz.id AND hb.is_active = true
        ) THEN
            v_key := 'business_owned_' || v_biz.id;
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_key, 'business', v_biz.icon, v_biz.name || ' Owner')
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_key, v_biz.name || ' Owner', v_biz.icon); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_full_portfolio', 'Full Portfolio', '🏙️'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_first_upgrade', 'First Upgrade', '⬆️'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'business_first_sale', 'Cashing Out', '💸'); END IF;
        END IF;
    END IF;

    -- Dividend ladder (cumulative dividends earned as an investor)
    FOR v_def IN
        SELECT * FROM (VALUES
            ('dividends_10', 'stocks', 10::NUMERIC, '🪙', 'First Dividends'),
            ('dividends_100', 'stocks', 100::NUMERIC, '💵', 'Dividend Earner'),
            ('dividends_1000', 'stocks', 1000::NUMERIC, '💰', 'Dividend Investor'),
            ('dividends_10000', 'stocks', 10000::NUMERIC, '🏦', 'Dividend Tycoon')
        ) AS d(achievement_key, category, threshold, emoji, label)
    LOOP
        IF v_total_dividends >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_first_investment', 'First Investment', '📈'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_diversified', 'Diversified', '📊'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'stocks_got_backers', 'Got Backers', '🤝'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_first_friend', 'First Friend', '🧑‍🤝‍🧑'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_butterfly', 'Social Butterfly', '🦋'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'social_first_poke', 'Friendly Reminder', '👋'); END IF;
        END IF;
    END IF;

    -- NOTE: a "first challenge joined" achievement was originally planned here,
    -- keyed off challenge_participants — but that table doesn't exist in the
    -- live schema (challenges appear to be unused/undeployed despite being
    -- referenced from social.service.ts), so it's omitted rather than
    -- guessing at a schema that isn't there. Add it back once challenges are
    -- actually backed by a real table.

    -- Global habit completions ladder (across ALL habit-businesses combined)
    FOR v_def IN
        SELECT * FROM (VALUES
            ('completions_global_1', 'completions', 1::NUMERIC, '✅', 'First Completion'),
            ('completions_global_50', 'completions', 50::NUMERIC, '⭐', '50 Completions'),
            ('completions_global_100', 'completions', 100::NUMERIC, '🌟', '100 Completions'),
            ('completions_global_1000', 'completions', 1000::NUMERIC, '🎖️', '1,000 Completions')
        ) AS d(achievement_key, category, threshold, emoji, label)
    LOOP
        IF v_global_completions >= v_def.threshold THEN
            v_inserted_id := NULL;
            INSERT INTO general_achievements (user_id, achievement_key, category, emoji, label)
            VALUES (p_user_id, v_def.achievement_key, v_def.category, v_def.emoji, v_def.label)
            ON CONFLICT (user_id, achievement_key) DO NOTHING
            RETURNING id INTO v_inserted_id;
            IF v_inserted_id IS NOT NULL THEN
                v_new_count := v_new_count + 1;
                IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, v_def.achievement_key, v_def.label, v_def.emoji); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'perfect_week', 'Perfect Week', '🗓️'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'perfect_month', 'Perfect Month', '📆'); END IF;
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'meta_completionist', 'Completionist', '🧩'); END IF;
        END IF;
    END IF;

    -- Meta: Legend — every other general achievement earned. Threshold is
    -- computed rather than hardcoded so it stays correct if more business
    -- types (and therefore more "owned" achievements) are ever added:
    -- 4 net worth + 3 business extras + 4 dividends + 3 stock extras
    -- + 3 social (first friend, social butterfly, first poke) + 4 completions
    -- + 2 perfect + 1 completionist = 24, plus one "owned" achievement per
    -- business type.
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
            IF p_notify THEN PERFORM notify_friends_of_general_achievement(p_user_id, 'meta_legend', 'Legend', '🏅'); END IF;
        END IF;
    END IF;

    RETURN v_new_count;
END;
$$;
GRANT EXECUTE ON FUNCTION check_general_achievements(UUID, BOOLEAN) TO authenticated;

-- 5. Extend recalculate_net_worth() to also check general achievements. This
--    is the single choke point every cash-mutating action already funnels
--    through (habit completion, business create/delete/upgrade, stock
--    buy/sell, dividend payouts, business-deletion refunds) — see
--    017-fix-net-worth-calculation.sql — so hooking in here covers net
--    worth, business-ownership, dividend, and stock-diversification
--    achievements automatically with no client-side changes required.
DROP FUNCTION IF EXISTS recalculate_net_worth(UUID);
CREATE OR REPLACE FUNCTION recalculate_net_worth(p_user_id UUID) RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_net_worth NUMERIC;
BEGIN
    SELECT COALESCE(up.cash, 0)
        + COALESCE((
            SELECT SUM(COALESCE(hb.cost, bt.base_cost, 0) * 0.7)
            FROM habit_businesses hb
                JOIN business_types bt ON hb.business_type_id = bt.id
            WHERE hb.user_id = p_user_id
                AND hb.is_active = true
        ), 0)
        + COALESCE((
            SELECT SUM(sh.shares_owned * bs.current_stock_price)
            FROM stock_holdings sh
                JOIN business_stocks bs ON sh.stock_id = bs.id
                JOIN habit_businesses hb2 ON bs.habit_business_id = hb2.id
            WHERE sh.holder_id = p_user_id
                AND sh.shares_owned > 0
                AND hb2.is_active = true
        ), 0)
    INTO v_net_worth
    FROM user_profiles up
    WHERE up.id = p_user_id;

    UPDATE user_profiles
    SET net_worth = COALESCE(v_net_worth, 0),
        updated_at = NOW()
    WHERE id = p_user_id;

    PERFORM check_general_achievements(p_user_id);

    RETURN COALESCE(v_net_worth, 0);
END;
$$;
GRANT EXECUTE ON FUNCTION recalculate_net_worth(UUID) TO authenticated;

-- 6. Event triggers for achievements not driven by a cash change.

-- Global completions + perfect week/month: fires on every completion,
-- regardless of which client code path inserted the row.
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_completion() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    PERFORM check_general_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_habit_completions_general_achievements ON habit_completions;
CREATE TRIGGER trg_habit_completions_general_achievements
    AFTER INSERT ON habit_completions
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_completion();

-- First sale: dedicated trigger rather than relying on recalculate_net_worth's
-- call ordering relative to the business_sales insert in deleteHabitBusiness().
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_sale() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    PERFORM check_general_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_sales_general_achievements ON business_sales;
CREATE TRIGGER trg_business_sales_general_achievements
    AFTER INSERT ON business_sales
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_sale();

-- First upgrade
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_upgrade() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    PERFORM check_general_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_upgrades_general_achievements ON business_upgrades;
CREATE TRIGGER trg_business_upgrades_general_achievements
    AFTER INSERT ON business_upgrades
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_upgrade();

-- Got backers: fires whenever anyone's stock holding changes; cheap no-op
-- when the holder is the business owner themself.
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_stock_holding() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_owner_id UUID;
BEGIN
    SELECT bs.business_owner_id INTO v_owner_id
    FROM business_stocks bs WHERE bs.id = NEW.stock_id;

    IF v_owner_id IS NOT NULL AND v_owner_id != NEW.holder_id THEN
        PERFORM check_general_achievements(v_owner_id);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_holdings_general_achievements ON stock_holdings;
CREATE TRIGGER trg_stock_holdings_general_achievements
    AFTER INSERT OR UPDATE OF shares_owned ON stock_holdings
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_stock_holding();

-- First friend / social butterfly: fires when a pending friendship flips to accepted.
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_friend_accept() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
        PERFORM check_general_achievements(NEW.user_id);
        PERFORM check_general_achievements(NEW.friend_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_friendships_general_achievements ON friendships;
CREATE TRIGGER trg_friendships_general_achievements
    AFTER UPDATE OF status ON friendships
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_friend_accept();

-- First poke/reminder sent. Scoped to habit_reminder/stockholder_reminder
-- only so this can't recurse into the friend_milestone / general_achievement
-- notification rows this migration's own functions insert.
CREATE OR REPLACE FUNCTION trg_check_general_achievements_on_poke() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.type IN ('habit_reminder', 'stockholder_reminder') THEN
        PERFORM check_general_achievements(NEW.from_user_id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_social_pokes_general_achievements ON social_pokes;
CREATE TRIGGER trg_social_pokes_general_achievements
    AFTER INSERT ON social_pokes
    FOR EACH ROW EXECUTE FUNCTION trg_check_general_achievements_on_poke();

-- NOTE: a trigger on challenge_participants (for a "first challenge joined"
-- achievement) was originally planned here, but that table doesn't exist in
-- the live schema — see the note above the "Global habit completions ladder"
-- section in check_general_achievements(). Omitted rather than guessing at
-- a schema that isn't there.

-- 7. One-time silent backfill: award anything existing users already
--    qualify for today, without spamming friend notifications.
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT id FROM user_profiles LOOP
        PERFORM check_general_achievements(r.id, false);
    END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';
