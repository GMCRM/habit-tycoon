-- Joint Venture — notifications.
--
-- social_pokes has no tracked CREATE TABLE anywhere in this project's
-- migration history (confirmed again while building this feature — every
-- existing migration that touches it assumes it already exists); it's real
-- in the live/shared project, created directly via the SQL editor at some
-- point, based on every other migration's own comments about it. This
-- defensive create+backfill is a no-op there (IF NOT EXISTS / ADD COLUMN IF
-- NOT EXISTS throughout) and only matters for environments replaying the
-- full migration history from scratch.
CREATE TABLE IF NOT EXISTS social_pokes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE social_pokes
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE social_pokes ENABLE ROW LEVEL SECURITY;

-- New notification types used by the joint-venture flows:
--   joint_venture_invite            — creation invite, needs Accept & Pay / Decline
--   joint_venture_upgrade_request   — upgrade payment request, needs Pay Now / Decline
--   joint_venture_deletion_vote     — deletion vote request, needs Affirm / Decline
--   joint_venture_resolved          — generic outcome (funded/expired/declined/
--                                     upgraded/deleted/vote-failed/vote-expired/
--                                     upgrade_expired/upgrade_declined), no actions
-- No CHECK constraint on social_pokes.type exists anywhere in the tracked
-- schema (confirmed: every existing type string — friend_milestone,
-- general_achievement, habit_reminder, stockholder_reminder — is inserted
-- freely with no prior ALTER TABLE ... ADD CONSTRAINT), so no constraint
-- change is needed to introduce these.

-- ─── get_user_social_notifications: pass through raw metadata so the client
-- can render the new joint-venture notification card (icon, business name,
-- share amount, expiry, proposal/vote id, etc.) without teaching this
-- function bespoke per-type resolution logic — every existing per-type
-- column this function already computes (business_name's habit_business_id
-- privacy resolution in particular) is untouched. ───
DROP FUNCTION IF EXISTS get_user_social_notifications(UUID);
CREATE OR REPLACE FUNCTION get_user_social_notifications(user_uuid UUID) RETURNS TABLE (
        poke_id UUID,
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
    up.name,
    '' as from_user_avatar,
    sp.message,
    sp.type::TEXT,
    sp.is_read,
    sp.created_at,
    -- If the poke references a private habit_business_id, prefer the public business type name
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
