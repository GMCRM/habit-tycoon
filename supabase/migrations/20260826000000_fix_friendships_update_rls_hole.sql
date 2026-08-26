-- Security fix: friendships UPDATE RLS policy has no WITH CHECK, so its
-- USING clause (auth.uid() = friend_id) only restricts which row can be
-- touched, not which columns can change. The recipient of a friend request
-- (friend_id) is meant to be able to accept/decline it (flip `status`), but
-- as written they could also rewrite `user_id` in the same UPDATE call --
-- forging an "accepted" friendship against a victim who never sent or
-- approved a request. That forged row then passes every downstream
-- friendship check (stock/marketplace friend-visibility, friends
-- leaderboard, etc.).
--
-- Fix: add a BEFORE UPDATE trigger that rejects any UPDATE on friendships
-- that changes `user_id` or `friend_id`. Only `status` (and `updated_at`)
-- may change post-insert; the identity of who requested whom is fixed at
-- creation time, exactly as the app's own accept/decline flow (which only
-- ever writes `status`) already assumes.

CREATE OR REPLACE FUNCTION guard_friendship_mutation() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.friend_id IS DISTINCT FROM OLD.friend_id THEN
        RAISE EXCEPTION 'Cannot change the parties of an existing friendship';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_friendship_mutation_trigger ON friendships;
CREATE TRIGGER guard_friendship_mutation_trigger
    BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION guard_friendship_mutation();
