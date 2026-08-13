-- Tracks explicit user acceptance of the Terms of Service / Privacy Policy,
-- collected as the final step of onboarding (see markTermsAccepted() in
-- AuthService and TermsStepComponent).

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
