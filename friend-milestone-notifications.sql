-- Friend Habit Milestone Notifications
-- Run this entire script in your Supabase SQL Editor
--
-- Creates a function that, when called after a habit goal completion,
-- checks if a streak or total-completion milestone was just hit and,
-- if so, inserts one social_pokes notification for each accepted friend.
--
-- Milestones (each fires at most ONCE per habit, ever):
--   Streak:       7 (🔥)  | 30 (🏆)  | 100 (💎)
--   Completions: 10 (⭐)  | 50 (🌟)  | 100 (🎯)

DROP FUNCTION IF EXISTS notify_friends_of_milestone(UUID, UUID);

CREATE OR REPLACE FUNCTION notify_friends_of_milestone(
  habit_business_uuid UUID,
  achiever_user_id    UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak            INTEGER;
  v_total_completions INTEGER;
  v_business_name     TEXT;
  v_business_icon     TEXT;
  v_achiever_name     TEXT;
  v_milestone_key     TEXT;
  v_milestone_emoji   TEXT;
  v_message           TEXT;
  v_friend_id         UUID;
  v_notifications_sent INTEGER := 0;
  friend_cursor       REFCURSOR;
BEGIN
  -- 1. Load the habit business details
  SELECT
    hb.streak,
    hb.total_completions,
    hb.business_name,
    hb.business_icon
  INTO
    v_streak,
    v_total_completions,
    v_business_name,
    v_business_icon
  FROM habit_businesses hb
  WHERE hb.id = habit_business_uuid
    AND hb.user_id = achiever_user_id;

  -- If the habit wasn't found or doesn't belong to this user, bail out silently
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- 2. Determine which single milestone (if any) was just hit
  --    Order matters: check the highest-value thresholds first so we don't
  --    double-fire when, say, streak = 100 also satisfies the 30 check.
  v_milestone_key   := NULL;
  v_milestone_emoji := NULL;

  -- Streak milestones (exact match — only fires on the exact completion)
  IF v_streak = 100 THEN
    v_milestone_key   := 'streak_100';
    v_milestone_emoji := '💎';
  ELSIF v_streak = 30 THEN
    v_milestone_key   := 'streak_30';
    v_milestone_emoji := '🏆';
  ELSIF v_streak = 7 THEN
    v_milestone_key   := 'streak_7';
    v_milestone_emoji := '🔥';
  -- Total completion milestones
  ELSIF v_total_completions = 100 THEN
    v_milestone_key   := 'completions_100';
    v_milestone_emoji := '🎯';
  ELSIF v_total_completions = 50 THEN
    v_milestone_key   := 'completions_50';
    v_milestone_emoji := '🌟';
  ELSIF v_total_completions = 10 THEN
    v_milestone_key   := 'completions_10';
    v_milestone_emoji := '⭐';
  END IF;

  -- No milestone hit — nothing to do
  IF v_milestone_key IS NULL THEN
    RETURN 0;
  END IF;

  -- 3. Dedup: if a notification for this exact milestone already exists
  --    for this habit, skip (prevents re-sending if the function is called twice)
  IF EXISTS (
    SELECT 1
    FROM social_pokes sp
    WHERE sp.from_user_id = achiever_user_id
      AND sp.type = 'friend_milestone'
      AND sp.metadata->>'habit_business_id' = habit_business_uuid::TEXT
      AND sp.metadata->>'milestone_key'     = v_milestone_key
  ) THEN
    RETURN 0;
  END IF;

  -- 4. Load the achiever's display name
  SELECT COALESCE(up.name, 'A friend')
  INTO v_achiever_name
  FROM user_profiles up
  WHERE up.id = achiever_user_id;

  -- Build the message
  v_message := v_achiever_name || ' just hit ' || v_milestone_emoji
             || ' on ' || v_business_icon || ' ' || v_business_name || '!';

  -- 5. Insert one notification per accepted friend (both friendship directions)
  FOR v_friend_id IN
    SELECT f.friend_id AS friend_id
    FROM friendships f
    WHERE f.user_id = achiever_user_id
      AND f.status  = 'accepted'

    UNION

    SELECT f.user_id AS friend_id
    FROM friendships f
    WHERE f.friend_id = achiever_user_id
      AND f.status    = 'accepted'
  LOOP
    INSERT INTO social_pokes (
      from_user_id,
      to_user_id,
      message,
      type,
      is_read,
      metadata
    ) VALUES (
      achiever_user_id,
      v_friend_id,
      v_message,
      'friend_milestone',
      false,
      jsonb_build_object(
        'habit_business_id', habit_business_uuid::TEXT,
        'milestone_key',     v_milestone_key,
        'milestone_emoji',   v_milestone_emoji
      )
    );

    v_notifications_sent := v_notifications_sent + 1;
  END LOOP;

  RETURN v_notifications_sent;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION notify_friends_of_milestone(UUID, UUID) TO authenticated;
