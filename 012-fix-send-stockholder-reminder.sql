-- Fix: "Could not find the function public.send_stockholder_reminder(...) in the schema cache"
--
-- ROOT CAUSE: send_stockholder_reminder has been redefined with different
-- signatures across several one-off fix files in this repo:
--   - (UUID, UUID, TEXT)       returns BOOLEAN   (fix-reminder-columns.sql, fix-reminder-message.sql)
--   - (UUID, UUID, TEXT, TEXT) returns JSONB      (stockholder-reminder-function.sql, complete-reminder-fix.sql, stocks-system-functions.sql)
-- Since these differ in argument count, CREATE OR REPLACE didn't overwrite
-- the old one, it created a second overload. Whichever version actually
-- landed in the live database, PostgREST's schema cache can only resolve
-- an RPC call when the argument names/types match exactly. The app
-- (social.service.ts) calls with 4 named args: from_user_id, to_user_id,
-- business_name, from_user_name.
--
-- FIX: drop every known overload, recreate only the 4-arg JSONB version,
-- and force PostgREST to reload its schema cache.
--
-- Run this in Supabase SQL Editor.

DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS send_stockholder_reminder(UUID, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION send_stockholder_reminder(
        from_user_id UUID,
        to_user_id UUID,
        business_name TEXT,
        from_user_name TEXT
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO social_pokes (
        from_user_id,
        to_user_id,
        message,
        type,
        is_read,
        metadata
    )
    VALUES (
        from_user_id,
        to_user_id,
        from_user_name || ' sent you a friendly reminder to do "' || business_name || '" because they own stocks in your business! 📈💰',
        'stockholder_reminder',
        false,
        jsonb_build_object(
            'business_name',
            business_name,
            'investor_name',
            from_user_name
        )
    );
    RETURN jsonb_build_object(
        'success',
        true,
        'message',
        'Stockholder reminder sent successfully'
    );
END;
$$;

GRANT EXECUTE ON FUNCTION send_stockholder_reminder(UUID, UUID, TEXT, TEXT) TO authenticated;

-- Verify only the one correct overload remains
SELECT proname AS function_name,
    pg_get_function_result(oid) AS return_type,
    pg_get_function_arguments(oid) AS arguments
FROM pg_proc
WHERE proname = 'send_stockholder_reminder';

-- Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
