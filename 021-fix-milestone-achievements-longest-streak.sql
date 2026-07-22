-- Fix: milestone achievements were checked against the CURRENT streak
-- (habit_businesses.streak), which resets to 0/1 on a missed day. A habit
-- that peaked at a 13-day streak and has since dropped to 3 would never
-- get credit for its 7-day streak achievement, because:
--   1. notify_friends_of_milestone only fired on an *exact* streak match
--      (v_streak = 7), and only at the live moment a completion happened —
--      it never ran retroactively for streaks earned before this feature
--      existed.
--   2. The one-time backfill in habit-milestone-achievements.sql compared
--      hb.streak (current, e.g. 3) >= threshold, which also misses any
--      habit whose streak has since reset below a threshold it once beat.
--
-- Fix: track a proper best-ever `longest_streak` on habit_businesses (kept
-- up to date automatically via trigger whenever `streak` increases), and
-- check/backfill milestones against that instead of the current streak.
--
-- Run this entire script in your Supabase SQL Editor (after
-- habit-milestone-achievements.sql).

-- 1. Add the column and backfill it from existing data.
--    A completion's `streak_count` records what the streak was on that
--    day, so MAX(streak_count) recovers the true historical peak even
--    though the current `streak` has since reset.
ALTER TABLE habit_businesses ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

UPDATE habit_businesses hb
SET longest_streak = GREATEST(
    hb.streak,
    COALESCE((SELECT MAX(hc.streak_count) FROM habit_completions hc WHERE hc.habit_business_id = hb.id), 0)
)
WHERE longest_streak < GREATEST(
    hb.streak,
    COALESCE((SELECT MAX(hc.streak_count) FROM habit_completions hc WHERE hc.habit_business_id = hb.id), 0)
);

-- 2. Trigger: keep longest_streak in sync automatically, regardless of
--    which code path updates `streak` (completion, undo, daily reset, etc).
CREATE OR REPLACE FUNCTION update_habit_business_longest_streak()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.streak > COALESCE(NEW.longest_streak, 0) THEN
        NEW.longest_streak := NEW.streak;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_habit_business_longest_streak ON habit_businesses;
CREATE TRIGGER trg_update_habit_business_longest_streak
    BEFORE INSERT OR UPDATE OF streak ON habit_businesses
    FOR EACH ROW EXECUTE FUNCTION update_habit_business_longest_streak();

-- 3. Redefine notify_friends_of_milestone to:
--    - compare against longest_streak (not current streak)
--    - use >= threshold instead of exact equality, so no crossing is missed
--    - walk every milestone definition instead of stopping at the first
--      match, so a habit that jumps past several thresholds at once
--      (e.g. a backfilled import) still gets credit for all of them
DROP FUNCTION IF EXISTS notify_friends_of_milestone(UUID, UUID);
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
    v_friend_id UUID;
    v_inserted_id UUID;
    v_notifications_sent INTEGER := 0;
BEGIN
    -- 1. Load the habit business details
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

    SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
    FROM user_profiles up
    WHERE up.id = achiever_user_id;

    -- 2. Walk every milestone definition (highest threshold first, purely
    --    cosmetic ordering) and record + notify any newly-crossed one.
    --    ON CONFLICT DO NOTHING makes this idempotent/safe to call
    --    repeatedly; RETURNING id tells us whether it was actually new.
    FOR v_milestone IN
        SELECT * FROM (VALUES
            ('streak_100', 'streak', 100, '💎'),
            ('streak_30', 'streak', 30, '🏆'),
            ('streak_7', 'streak', 7, '🔥'),
            ('completions_100', 'completions', 100, '🎯'),
            ('completions_50', 'completions', 50, '🌟'),
            ('completions_10', 'completions', 10, '⭐')
        ) AS m(milestone_key, milestone_type, threshold, emoji)
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
                v_message := v_achiever_name || ' just hit ' || v_milestone.emoji || ' on ' ||
                    COALESCE(v_business_type_icon, v_business_icon, '') || ' ' ||
                    COALESCE(v_business_type_name, v_business_name) || '!';

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

-- 4. Re-run the backfill against longest_streak so already-qualifying
--    habits (like one that peaked at 13 but is now at a 3-day streak)
--    get their achievements seeded correctly. Safe to re-run —
--    ON CONFLICT DO NOTHING skips anything already recorded.
INSERT INTO habit_milestone_achievements (user_id, habit_business_id, milestone_key, milestone_type, threshold, emoji)
SELECT hb.user_id, hb.id, m.milestone_key, m.milestone_type, m.threshold, m.emoji
FROM habit_businesses hb
CROSS JOIN (
    VALUES
        ('streak_7', 'streak', 7, '🔥'),
        ('streak_30', 'streak', 30, '🏆'),
        ('streak_100', 'streak', 100, '💎'),
        ('completions_10', 'completions', 10, '⭐'),
        ('completions_50', 'completions', 50, '🌟'),
        ('completions_100', 'completions', 100, '🎯')
) AS m(milestone_key, milestone_type, threshold, emoji)
WHERE (m.milestone_type = 'streak' AND hb.longest_streak >= m.threshold)
   OR (m.milestone_type = 'completions' AND hb.total_completions >= m.threshold)
ON CONFLICT (habit_business_id, milestone_key) DO NOTHING;
