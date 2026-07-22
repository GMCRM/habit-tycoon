-- Habit Milestone Achievements
-- Run this entire script in your Supabase SQL Editor (after friend-milestone-notifications.sql)
--
-- Problem: the only existing record of a milestone being hit lives in the
-- `social_pokes` notifications sent to friends — which only get inserted if
-- the achiever has at least one accepted friend. Users with no friends had
-- no permanent record of ever hitting a milestone, and `streak` resets to 0
-- on a missed day, so history can't be reconstructed from current state.
--
-- This adds a dedicated table that permanently records each habit's earned
-- milestones the moment they're hit, independent of friends/social_pokes.
-- Once a milestone is earned it stays earned forever, even if the streak
-- later resets.

-- 1. Table
CREATE TABLE IF NOT EXISTS habit_milestone_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    habit_business_id UUID REFERENCES habit_businesses(id) ON DELETE CASCADE NOT NULL,
    milestone_key TEXT NOT NULL,
    milestone_type TEXT NOT NULL CHECK (milestone_type IN ('streak', 'completions')),
    threshold INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE (habit_business_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_habit_milestone_achievements_user ON habit_milestone_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_milestone_achievements_habit ON habit_milestone_achievements(habit_business_id);

ALTER TABLE habit_milestone_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestone achievements" ON habit_milestone_achievements;
CREATE POLICY "Users can view own milestone achievements" ON habit_milestone_achievements FOR
SELECT USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policy for regular users — rows are only ever
-- written by the SECURITY DEFINER function below.

-- 2. Extend notify_friends_of_milestone to permanently record the milestone
--    before doing the (friends-only) social notification. Same detection
--    logic as before; the only addition is the INSERT into the new table.
DROP FUNCTION IF EXISTS notify_friends_of_milestone(UUID, UUID);
CREATE OR REPLACE FUNCTION notify_friends_of_milestone(
        habit_business_uuid UUID,
        achiever_user_id UUID
    ) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_streak INTEGER;
v_total_completions INTEGER;
v_business_name TEXT;
v_business_icon TEXT;
v_business_type_name TEXT;
v_business_type_icon TEXT;
v_achiever_name TEXT;
v_milestone_key TEXT;
v_milestone_emoji TEXT;
v_milestone_type TEXT;
v_threshold INTEGER;
v_message TEXT;
v_friend_id UUID;
v_notifications_sent INTEGER := 0;
friend_cursor REFCURSOR;
BEGIN -- 1. Load the habit business details
SELECT hb.streak,
    hb.total_completions,
    hb.business_name,
    hb.business_icon,
    bt.name,
    bt.icon INTO v_streak,
    v_total_completions,
    v_business_name,
    v_business_icon,
    v_business_type_name,
    v_business_type_icon
FROM habit_businesses hb
    LEFT JOIN business_types bt ON bt.id = hb.business_type_id
WHERE hb.id = habit_business_uuid
    AND hb.user_id = achiever_user_id;
-- If the habit wasn't found or doesn't belong to this user, bail out silently
IF NOT FOUND THEN RETURN 0;
END IF;
-- 2. Determine which single milestone (if any) was just hit
--    Order matters: check the highest-value thresholds first so we don't
--    double-fire when, say, streak = 100 also satisfies the 30 check.
v_milestone_key := NULL;
v_milestone_emoji := NULL;
-- Streak milestones (exact match — only fires on the exact completion)
IF v_streak = 100 THEN v_milestone_key := 'streak_100';
v_milestone_emoji := '💎';
ELSIF v_streak = 30 THEN v_milestone_key := 'streak_30';
v_milestone_emoji := '🏆';
ELSIF v_streak = 7 THEN v_milestone_key := 'streak_7';
v_milestone_emoji := '🔥';
-- Total completion milestones
ELSIF v_total_completions = 100 THEN v_milestone_key := 'completions_100';
v_milestone_emoji := '🎯';
ELSIF v_total_completions = 50 THEN v_milestone_key := 'completions_50';
v_milestone_emoji := '🌟';
ELSIF v_total_completions = 10 THEN v_milestone_key := 'completions_10';
v_milestone_emoji := '⭐';
END IF;
-- No milestone hit — nothing to do
IF v_milestone_key IS NULL THEN RETURN 0;
END IF;
-- 2b. Permanently record this habit's earned milestone. This happens
--     regardless of whether the achiever has any friends, and regardless
--     of whether a friend notification was already sent before (ON
--     CONFLICT DO NOTHING makes this safe to call repeatedly).
v_milestone_type := CASE
    WHEN v_milestone_key LIKE 'streak_%' THEN 'streak'
    ELSE 'completions'
END;
v_threshold := CASE v_milestone_key
    WHEN 'streak_7' THEN 7
    WHEN 'streak_30' THEN 30
    WHEN 'streak_100' THEN 100
    WHEN 'completions_10' THEN 10
    WHEN 'completions_50' THEN 50
    WHEN 'completions_100' THEN 100
END;
INSERT INTO habit_milestone_achievements (
        user_id,
        habit_business_id,
        milestone_key,
        milestone_type,
        threshold,
        emoji
    )
VALUES (
        achiever_user_id,
        habit_business_uuid,
        v_milestone_key,
        v_milestone_type,
        v_threshold,
        v_milestone_emoji
    ) ON CONFLICT (habit_business_id, milestone_key) DO NOTHING;
-- 3. Dedup: if a notification for this exact milestone already exists
--    for this habit, skip (prevents re-sending if the function is called twice)
IF EXISTS (
    SELECT 1
    FROM social_pokes sp
    WHERE sp.from_user_id = achiever_user_id
        AND sp.type = 'friend_milestone'
        AND sp.metadata->>'habit_business_id' = habit_business_uuid::TEXT
        AND sp.metadata->>'milestone_key' = v_milestone_key
) THEN RETURN 0;
END IF;
-- 4. Load the achiever's display name
SELECT COALESCE(up.name, 'A friend') INTO v_achiever_name
FROM user_profiles up
WHERE up.id = achiever_user_id;
-- Build the message
-- Use the public business type name (not the user's private habit name) in friend-facing messages
v_message := v_achiever_name || ' just hit ' || v_milestone_emoji || ' on ' || COALESCE(v_business_type_icon, v_business_icon, '') || ' ' || COALESCE(v_business_type_name, v_business_name) || '!';
-- 5. Insert one notification per accepted friend (both friendship directions)
FOR v_friend_id IN
SELECT f.friend_id AS friend_id
FROM friendships f
WHERE f.user_id = achiever_user_id
    AND f.status = 'accepted'
UNION
SELECT f.user_id AS friend_id
FROM friendships f
WHERE f.friend_id = achiever_user_id
    AND f.status = 'accepted' LOOP
INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
VALUES (
        achiever_user_id,
        v_friend_id,
        v_message,
        'friend_milestone',
        false,
        jsonb_build_object(
            'habit_business_id',
            habit_business_uuid::TEXT,
            'milestone_key',
            v_milestone_key,
            'milestone_emoji',
            v_milestone_emoji
        )
    );
v_notifications_sent := v_notifications_sent + 1;
END LOOP;
RETURN v_notifications_sent;
END;
$$;
-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION notify_friends_of_milestone(UUID, UUID) TO authenticated;

-- 3. Backfill: seed achievements for habits that already qualify today.
--    (Best-effort — earned_at will read as "now" for these rows since the
--    exact historical moment isn't recoverable, so the app doesn't surface
--    earned_at for individual badges.)
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
WHERE (m.milestone_type = 'streak' AND hb.streak >= m.threshold)
   OR (m.milestone_type = 'completions' AND hb.total_completions >= m.threshold)
ON CONFLICT (habit_business_id, milestone_key) DO NOTHING;
