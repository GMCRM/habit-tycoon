-- Lock down username updates to a dedicated, validated RPC.
--
-- Previously the Settings page updated the username via a generic
-- `user_profiles.update(...)` call. The RLS policy on that table only
-- checks row ownership (`auth.uid() = id`) with no WITH CHECK / column
-- restriction, so any authenticated client could call the same table
-- update directly (e.g. via devtools) and rewrite their own cash,
-- net_worth, or email -- not just their name. There was also no
-- server-side length/content validation; the client's maxlength=30 and
-- empty-string check are trivially bypassed by calling the API directly.
--
-- This function is now the only supported way to change a username: it
-- runs as SECURITY DEFINER, validates and sanitizes the new name, and
-- updates only the `name` column for the caller's own row.

CREATE OR REPLACE FUNCTION update_username(new_name TEXT)
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cleaned_name TEXT;
    updated_row user_profiles;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Strip control characters (U+0000-U+001F, U+007F) and zero-width /
    -- invisible characters (U+200B-U+200D, U+FEFF) using chr() rather than
    -- embedding the literal invisible codepoints in this file -- these could
    -- otherwise be used to spoof or visually hide an impersonation of
    -- another user's name. Then trim ordinary whitespace.
    cleaned_name := regexp_replace(
        new_name,
        '[' || chr(0) || '-' || chr(31) || chr(127)
             || chr(8203) || '-' || chr(8205) || chr(65279) || ']',
        '',
        'g'
    );
    cleaned_name := trim(cleaned_name);

    IF cleaned_name IS NULL OR length(cleaned_name) = 0 THEN
        RAISE EXCEPTION 'Username cannot be empty';
    END IF;

    IF length(cleaned_name) > 30 THEN
        RAISE EXCEPTION 'Username cannot exceed 30 characters';
    END IF;

    UPDATE user_profiles
    SET name = cleaned_name,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = auth.uid()
    RETURNING * INTO updated_row;

    IF updated_row IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;

    RETURN updated_row;
END;
$$;

-- Least privilege: only signed-in users may call this, never anon/PUBLIC.
REVOKE ALL ON FUNCTION update_username(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_username(TEXT) TO authenticated;
