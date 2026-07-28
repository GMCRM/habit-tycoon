-- Activates the first-run onboarding flow (guided tour) for genuinely
-- first-time users. The app-side guards additionally require the user to
-- have zero habits, so this does not re-trigger onboarding for existing
-- accounts created while the flow was dormant.

UPDATE app_config SET onboarding_enabled = true, updated_at = now() WHERE id = 1;
