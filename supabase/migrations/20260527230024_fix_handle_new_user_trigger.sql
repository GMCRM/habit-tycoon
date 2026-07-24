-- Fix "Database error saving new user" during sign-up
-- Root cause: set_config('row_security', ...) inside a SECURITY DEFINER trigger
-- is blocked by PostgreSQL in security-restricted operation context.
-- Fix: remove those calls entirely — SECURITY DEFINER functions running as the
-- owner (postgres superuser) already bypass RLS automatically.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use UPSERT on primary key (id) not email, to avoid changing PKs
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name  = COALESCE(EXCLUDED.name, public.user_profiles.name),
        updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but never block the auth signup
    RAISE LOG 'handle_new_user error (non-fatal): % | %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
