-- Achievement reactions: let friends react with an emoji to a friend's
-- earned achievement notification (general_achievement / friend_milestone),
-- Facebook-style.
--
-- Reactions are stored against the achievement itself (achiever_id +
-- achievement_key, plus habit_business_id for per-habit milestones) rather
-- than against an individual social_pokes row, because
-- notify_friends_of_general_achievement/notify_friends_of_milestone insert
-- one social_pokes row PER FRIEND (plus a self row for the achiever) for the
-- same achievement event — reactions need to aggregate across all of those
-- rows so the achiever sees every friend's reaction in one place, and so a
-- friend's reaction shows up for every other friend too.

CREATE TABLE IF NOT EXISTS achievement_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achiever_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    achievement_type TEXT CHECK (achievement_type IN ('general', 'milestone')) NOT NULL,
    achievement_key TEXT NOT NULL,
    -- NULL for 'general' achievements; set for 'milestone' achievements,
    -- since a milestone_key (e.g. 'streak_7') is only unique per habit, not
    -- per user (see habit_milestone_achievements' UNIQUE(habit_business_id, milestone_key)).
    habit_business_id UUID REFERENCES habit_businesses ON DELETE CASCADE,
    reactor_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    emoji TEXT CHECK (emoji IN ('🎉', '♥️', '🤩', '🤑', '🙌', '👍')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT achievement_reactions_habit_business_id_matches_type CHECK (
        (achievement_type = 'general' AND habit_business_id IS NULL) OR
        (achievement_type = 'milestone' AND habit_business_id IS NOT NULL)
    )
);

-- One reaction per reactor per achievement — reacting again with a
-- different emoji changes it (see react_to_achievement's ON CONFLICT DO
-- UPDATE below) rather than adding a second row. Two partial unique indexes
-- because habit_business_id is NULL for general achievements and Postgres
-- treats NULLs as distinct values in a plain multi-column unique constraint.
CREATE UNIQUE INDEX IF NOT EXISTS achievement_reactions_general_unique_idx
    ON achievement_reactions (achiever_id, achievement_key, reactor_id)
    WHERE achievement_type = 'general';

CREATE UNIQUE INDEX IF NOT EXISTS achievement_reactions_milestone_unique_idx
    ON achievement_reactions (achiever_id, habit_business_id, achievement_key, reactor_id)
    WHERE achievement_type = 'milestone';

CREATE INDEX IF NOT EXISTS achievement_reactions_lookup_idx
    ON achievement_reactions (achiever_id, achievement_type, achievement_key, habit_business_id);

ALTER TABLE achievement_reactions ENABLE ROW LEVEL SECURITY;

-- No table policies at all (RLS enabled, zero policies = all direct access
-- denied) — same convention as general_achievements/habit_milestone_achievements
-- for writes: every read and write goes through the SECURITY DEFINER
-- functions below, which check the caller is either the achiever or an
-- accepted friend of the achiever (the same audience the achievement
-- notification itself reaches).

-- Shared friendship check used by every function below.
CREATE OR REPLACE FUNCTION is_accepted_friend(p_user_a UUID, p_user_b UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
        AND ((user_id = p_user_a AND friend_id = p_user_b) OR (user_id = p_user_b AND friend_id = p_user_a))
    );
$$;
GRANT EXECUTE ON FUNCTION is_accepted_friend(UUID, UUID) TO authenticated;

-- react_to_achievement: upsert the caller's own reaction on a friend's
-- achievement. Only an accepted friend of the achiever may react — not the
-- achiever themselves.
CREATE OR REPLACE FUNCTION react_to_achievement(
    p_achiever_id UUID,
    p_achievement_type TEXT,
    p_achievement_key TEXT,
    p_habit_business_id UUID,
    p_emoji TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF auth.uid() = p_achiever_id THEN
        RAISE EXCEPTION 'Cannot react to your own achievement';
    END IF;

    IF NOT is_accepted_friend(auth.uid(), p_achiever_id) THEN
        RAISE EXCEPTION 'Not friends with this user';
    END IF;

    IF p_emoji IS NULL OR p_emoji NOT IN ('🎉', '♥️', '🤩', '🤑', '🙌', '👍') THEN
        RAISE EXCEPTION 'Invalid emoji';
    END IF;

    IF p_achievement_type NOT IN ('general', 'milestone') THEN
        RAISE EXCEPTION 'Invalid achievement type';
    END IF;

    IF p_achievement_type = 'milestone' AND p_habit_business_id IS NULL THEN
        RAISE EXCEPTION 'habit_business_id required for milestone reactions';
    END IF;

    IF p_achievement_type = 'general' THEN
        INSERT INTO achievement_reactions (achiever_id, achievement_type, achievement_key, habit_business_id, reactor_id, emoji)
        VALUES (p_achiever_id, 'general', p_achievement_key, NULL, auth.uid(), p_emoji)
        ON CONFLICT (achiever_id, achievement_key, reactor_id) WHERE achievement_type = 'general'
        DO UPDATE SET emoji = EXCLUDED.emoji, updated_at = NOW();
    ELSE
        INSERT INTO achievement_reactions (achiever_id, achievement_type, achievement_key, habit_business_id, reactor_id, emoji)
        VALUES (p_achiever_id, 'milestone', p_achievement_key, p_habit_business_id, auth.uid(), p_emoji)
        ON CONFLICT (achiever_id, habit_business_id, achievement_key, reactor_id) WHERE achievement_type = 'milestone'
        DO UPDATE SET emoji = EXCLUDED.emoji, updated_at = NOW();
    END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION react_to_achievement(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- remove_achievement_reaction: caller removes their own reaction (e.g.
-- tapping their current emoji again to un-react).
CREATE OR REPLACE FUNCTION remove_achievement_reaction(
    p_achiever_id UUID,
    p_achievement_type TEXT,
    p_achievement_key TEXT,
    p_habit_business_id UUID
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    DELETE FROM achievement_reactions
    WHERE achiever_id = p_achiever_id
        AND achievement_type = p_achievement_type
        AND achievement_key = p_achievement_key
        AND reactor_id = auth.uid()
        AND habit_business_id IS NOT DISTINCT FROM p_habit_business_id;
END;
$$;
GRANT EXECUTE ON FUNCTION remove_achievement_reaction(UUID, TEXT, TEXT, UUID) TO authenticated;

-- get_achievement_reactions: full reactor list (name + emoji) for the "who
-- reacted" popup. Visible to the achiever and to any of their accepted
-- friends — the same audience the achievement notification itself reaches.
CREATE OR REPLACE FUNCTION get_achievement_reactions(
    p_achiever_id UUID,
    p_achievement_type TEXT,
    p_achievement_key TEXT,
    p_habit_business_id UUID
) RETURNS TABLE (
    reactor_id UUID,
    reactor_name TEXT,
    emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF auth.uid() != p_achiever_id AND NOT is_accepted_friend(auth.uid(), p_achiever_id) THEN
        RAISE EXCEPTION 'Not authorized to view these reactions';
    END IF;

    RETURN QUERY
    SELECT ar.reactor_id, COALESCE(up.name, 'A friend'), ar.emoji, ar.created_at
    FROM achievement_reactions ar
    JOIN user_profiles up ON up.id = ar.reactor_id
    WHERE ar.achiever_id = p_achiever_id
        AND ar.achievement_type = p_achievement_type
        AND ar.achievement_key = p_achievement_key
        AND ar.habit_business_id IS NOT DISTINCT FROM p_habit_business_id
    ORDER BY ar.created_at ASC;
END;
$$;
GRANT EXECUTE ON FUNCTION get_achievement_reactions(UUID, TEXT, TEXT, UUID) TO authenticated;

-- get_user_social_notifications: also return from_user_id so the client can
-- identify the achiever for achievement/milestone notifications — needed to
-- tell whether the viewer IS the achiever (self notification, reactions
-- shown read-only) and, when not, who to react to. Every other column here
-- is unchanged from 20260807100000_joint_venture_notifications.sql.
DROP FUNCTION IF EXISTS get_user_social_notifications(UUID);
CREATE OR REPLACE FUNCTION get_user_social_notifications(user_uuid UUID) RETURNS TABLE (
        poke_id UUID,
        from_user_id UUID,
        from_user_name TEXT,
        from_user_avatar TEXT,
        message TEXT,
        poke_type TEXT,
        is_read BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        business_name TEXT,
        metadata JSONB
    ) LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN RETURN QUERY
SELECT sp.id,
    sp.from_user_id,
    up.name,
    '' as from_user_avatar,
    sp.message,
    sp.type::TEXT,
    sp.is_read,
    sp.created_at,
    CASE
        WHEN sp.metadata ? 'habit_business_id' THEN (
            SELECT bt.name
            FROM habit_businesses hb2
                LEFT JOIN business_types bt ON bt.id = hb2.business_type_id
            WHERE hb2.id = (sp.metadata->>'habit_business_id')::UUID
            LIMIT 1
        )
        ELSE (sp.metadata->>'business_name')::TEXT
    END AS business_name,
    sp.metadata
FROM social_pokes sp
    INNER JOIN user_profiles up ON sp.from_user_id = up.id
WHERE sp.to_user_id = user_uuid
ORDER BY sp.created_at DESC
LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_social_notifications(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
