-- Adds first-run onboarding tracking to user_profiles, and a remotely
-- toggleable app_config flag so the onboarding flow (and the paywall it
-- ends on) can ship fully built but dormant until RevenueCat/App Store
-- Connect setup is complete and it's manually flipped on — no app
-- redeploy required to activate.

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS app_config (
    id SMALLINT PRIMARY KEY DEFAULT 1,
    onboarding_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT app_config_singleton CHECK (id = 1)
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read the flag (the onboarding guard needs it
-- before it knows anything else about them). Only the dashboard/service role
-- can change it — no INSERT/UPDATE/DELETE policy is defined, matching the
-- admin_users pattern in 20260724010000_admin_roles.sql.
CREATE POLICY "app_config readable by authenticated users"
    ON app_config FOR SELECT
    TO authenticated
    USING (true);

INSERT INTO app_config (id, onboarding_enabled)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
