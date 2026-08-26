/**
 * Starting cash/net-worth for a brand-new user profile. Must match the
 * server-side seed in AuthService (createUserProfile / ensureUserProfileExists)
 * exactly — it also doubles as the last-resort UI fallback used before any
 * profile has ever been fetched/cached (e.g. a first launch while offline),
 * so keeping both in sync here prevents the fallback from visibly "snapping"
 * to a different value once connectivity returns.
 */
export const DEFAULT_STARTING_BALANCE = 99.00;
