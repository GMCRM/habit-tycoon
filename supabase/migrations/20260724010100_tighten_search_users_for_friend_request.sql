-- Tighten search_users_for_friend_request against user enumeration.
-- Previously: any authenticated user could call this SECURITY DEFINER
-- (RLS-bypassing) function with a 1-character name substring and page
-- through every user's name+email in the system. This adds:
--   1. A minimum search-term length, closing off trivial single-letter sweeps.
--   2. Prefix match instead of substring match on name (less scriptable).
--   3. A per-user rate limit (20 searches / 5 minutes) via a log table.
--   4. Exclusion of the caller's own row (was previously included).

CREATE TABLE IF NOT EXISTS user_search_log (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_search_log_user_time
    ON user_search_log(user_id, searched_at);

ALTER TABLE user_search_log ENABLE ROW LEVEL SECURITY;
-- No policies: only touched via the SECURITY DEFINER function below.

DROP FUNCTION IF EXISTS search_users_for_friend_request(TEXT);

CREATE OR REPLACE FUNCTION search_users_for_friend_request(search_term TEXT)
RETURNS TABLE (id UUID, name TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    recent_search_count INT;
    trimmed_term TEXT := trim(search_term);
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF length(trimmed_term) < 3 THEN
        RAISE EXCEPTION 'Search term must be at least 3 characters';
    END IF;

    SELECT count(*) INTO recent_search_count
    FROM user_search_log
    WHERE user_id = auth.uid()
      AND searched_at > now() - interval '5 minutes';

    IF recent_search_count >= 20 THEN
        RAISE EXCEPTION 'Too many searches — please wait a few minutes and try again';
    END IF;

    INSERT INTO user_search_log (user_id) VALUES (auth.uid());

    -- Don't return sensitive data like cash, net_worth, etc.
    RETURN QUERY
    SELECT up.id,
        up.name,
        up.email
    FROM user_profiles up
    WHERE up.id != auth.uid()
      AND (
        LOWER(up.email) = LOWER(trimmed_term)
        OR up.name ILIKE trimmed_term || '%'
      )
    LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION search_users_for_friend_request(TEXT) TO authenticated;
