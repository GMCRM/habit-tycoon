// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  supabaseUrl: 'https://xqdzixbmnegeunjnzrla.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxZHppeGJtbmVnZXVuam56cmxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzM4MzksImV4cCI6MjA3MDYwOTgzOX0.LfDmVEndKhd5iNT5ddg6X3FHyzC119Asp1QResR64DM',
  // Set once the RevenueCat project + App Store Connect subscription are
  // configured (see plan doc). Left blank, SubscriptionService.configure()
  // no-ops — this alone does not gate anything; app_config.onboarding_enabled
  // is the real activation switch. For local testing, use an Xcode StoreKit
  // Configuration file with RevenueCat's sandbox/test mode.
  revenueCatApiKey: '',
  // Apple requires working Terms of Use / Privacy Policy links on any
  // subscription paywall. These point at the /terms-of-service and
  // /privacy-policy routes, served publicly via the GitHub Pages build of
  // this same app (see .github/workflows/deploy.yml).
  termsUrl: 'https://gmcrm.github.io/habit-tycoon/terms-of-service',
  privacyUrl: 'https://gmcrm.github.io/habit-tycoon/privacy-policy'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
