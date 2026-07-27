import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

/**
 * Remote, DB-backed feature flags (the `app_config` singleton row) that can
 * be flipped instantly from the Supabase dashboard with no app redeploy —
 * used to keep a feature fully built but dormant until it's ready to ship.
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private supabaseService = inject(SupabaseService);
  private get supabase() {
    return this.supabaseService.client;
  }

  private onboardingEnabledCache: boolean | null = null;

  /**
   * Whether the first-run onboarding flow (and the paywall it ends on) is
   * active. Defaults to `false` on any fetch error or missing row — a
   * network hiccup must never accidentally turn the flow on for users.
   */
  async isOnboardingEnabled(): Promise<boolean> {
    if (this.onboardingEnabledCache !== null) {
      return this.onboardingEnabledCache;
    }

    try {
      const { data, error } = await this.supabase
        .from('app_config')
        .select('onboarding_enabled')
        .eq('id', 1)
        .single();

      if (error || !data) {
        console.error('❌ AppConfigService: failed to fetch onboarding flag, defaulting off:', error);
        return false;
      }

      this.onboardingEnabledCache = !!data.onboarding_enabled;
      return this.onboardingEnabledCache;
    } catch (error) {
      console.error('❌ AppConfigService: onboarding flag fetch threw, defaulting off:', error);
      return false;
    }
  }
}
