export const environment = {
  production: true,
  supabaseUrl: 'https://xqdzixbmnegeunjnzrla.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM',
  // Set once the RevenueCat project + App Store Connect subscription are
  // configured (see plan doc). Left blank, SubscriptionService.configure()
  // no-ops — this alone does not gate anything; app_config.onboarding_enabled
  // is the real activation switch.
  revenueCatApiKey: '',
  // Apple requires working Terms of Use / Privacy Policy links on any
  // subscription paywall. These point at the /terms-of-service and
  // /privacy-policy routes, served publicly via the GitHub Pages build of
  // this same app (see .github/workflows/deploy.yml).
  termsUrl: 'https://gmcrm.github.io/habit-tycoon/terms-of-service',
  privacyUrl: 'https://gmcrm.github.io/habit-tycoon/privacy-policy'
};
