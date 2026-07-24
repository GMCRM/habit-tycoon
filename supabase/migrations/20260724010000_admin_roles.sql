-- Move admin authorization server-side. Previously "admin" status was
-- determined purely client-side (admin.guard.ts / admin.service.ts comparing
-- auth.uid()'s email against a hardcoded string), which only gated UI
-- visibility and gave no real protection to any privileged server-side
-- operation. This introduces an authoritative, RLS-protected admin roster
-- and a SECURITY DEFINER function so future privileged RPCs/policies can
-- check admin status without trusting the client.

CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: the table is readable/writable only via
-- SECURITY DEFINER functions (below) or the Supabase dashboard/service role,
-- never directly by authenticated clients.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Seed the current admin by their existing email, preserving prior behavior.
INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'grantmatai@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
