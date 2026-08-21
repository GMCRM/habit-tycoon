-- Verification script: confirms cash/net_worth are blocked from direct client writes.
-- Run this after applying the migration against a test database.

-- 1. Create a test user and profile
INSERT INTO auth.users (id, email, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'authenticated', 'authenticated', '{}', '{}', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (id, name, cash, net_worth)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 100.00, 100.00)
ON CONFLICT (id) DO UPDATE SET cash = 100.00, net_worth = 100.00;

-- 2. As the authenticated role, try to update cash directly
-- This should FAIL with a policy violation error.
SET role = 'authenticated';
SET request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000001"}';

DO $$
BEGIN
    UPDATE user_profiles SET cash = 999999 WHERE id = '00000000-0000-0000-0000-000000000001';
    RAISE EXCEPTION 'TEST FAILED: Direct cash update should have been blocked';
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'TEST PASSED: Direct cash update correctly blocked by RLS WITH CHECK';
END $$;

-- 3. Verify safe columns (name, avatar_url) still work
BEGIN
    UPDATE user_profiles SET name = 'Updated Name' WHERE id = '00000000-0000-0000-0000-000000000001';
    RAISE NOTICE 'TEST PASSED: Name update still works';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'TEST FAILED: Name update should not be blocked: %', SQLERRM;
END;

-- Reset role
RESET role;

-- Cleanup
DELETE FROM user_profiles WHERE id = '00000000-0000-0000-0000-000000000001';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';
