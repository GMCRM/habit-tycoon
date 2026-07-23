import { Preferences } from '@capacitor/preferences';
import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Supabase-compatible storage adapter backed by @capacitor/preferences,
 * used to persist the auth session instead of the default localStorage.
 *
 * On native iOS/Android, @capacitor/preferences reads/writes native
 * UserDefaults/SharedPreferences, which the OS treats as app data — more
 * durable than the WebView's localStorage, which can be cleared by the OS
 * under storage pressure independently of the rest of the app's data. On
 * web, @capacitor/preferences itself falls back to localStorage, so this is
 * safe to use unconditionally across both platforms.
 */
export class CapacitorPreferencesStorage implements SupportedStorage {
  async getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async setItem(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async removeItem(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
