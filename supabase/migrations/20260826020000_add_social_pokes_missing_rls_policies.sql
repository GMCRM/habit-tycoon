-- social_pokes only has a tracked DELETE policy (20250827000600). There is
-- no tracked SELECT/INSERT/UPDATE policy anywhere in this project's
-- migration history, even though the table has had RLS enabled since
-- 20260807100000. Every INSERT into social_pokes happens inside SECURITY
-- DEFINER functions (notification fan-out, reminders, achievements, joint
-- venture flows), which bypass RLS entirely, so INSERT never needed a
-- client-facing policy -- but the client does read notifications and call
-- SocialService.markPokeAsRead() (a raw UPDATE) directly. Without a
-- SELECT/UPDATE policy those calls silently return zero rows under RLS
-- (PostgREST doesn't error on a no-op update/select), which would make the
-- notifications list empty and "mark as read" a no-op on any environment
-- that doesn't happen to carry an untracked policy created out-of-band.
--
-- These are additive (CREATE POLICY, not REPLACE) and narrowly scoped, so
-- they're safe to add even if production already has an equivalent
-- policy under a different name -- Postgres unions permissive policies for
-- the same command, and this one can only grant what the app itself
-- already relies on.

DROP POLICY IF EXISTS "Users can view their pokes" ON social_pokes;
CREATE POLICY "Users can view their pokes" ON social_pokes FOR
SELECT USING (
        auth.uid() = to_user_id
        OR auth.uid() = from_user_id
    );

-- Only the recipient may mark a poke read, and only that one column --
-- WITH CHECK re-validates to_user_id post-update so the row can't be
-- reassigned to someone else in the same call.
DROP POLICY IF EXISTS "Users can mark their received pokes read" ON social_pokes;
CREATE POLICY "Users can mark their received pokes read" ON social_pokes FOR
UPDATE USING (auth.uid() = to_user_id)
WITH CHECK (auth.uid() = to_user_id);

CREATE OR REPLACE FUNCTION guard_social_pokes_mutation() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF current_user = 'authenticated' THEN
        IF NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
           OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
           OR NEW.message IS DISTINCT FROM OLD.message
           OR NEW.type IS DISTINCT FROM OLD.type
           OR NEW.metadata IS DISTINCT FROM OLD.metadata THEN
            RAISE EXCEPTION 'Only is_read may be changed on an existing notification';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_social_pokes_mutation_trigger ON social_pokes;
CREATE TRIGGER guard_social_pokes_mutation_trigger
    BEFORE UPDATE ON social_pokes
    FOR EACH ROW EXECUTE FUNCTION guard_social_pokes_mutation();

NOTIFY pgrst, 'reload schema';
