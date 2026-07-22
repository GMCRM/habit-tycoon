// src/app/services/settings.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

const TAP_TO_COMPLETE_KEY = 'tap-to-complete';

// Shared, reactive store for user preferences that need to update live across
// pages (no reload) and sync to the user's Supabase profile (no per-device drift).
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private tapToCompleteSubject = new BehaviorSubject<boolean>(
    localStorage.getItem(TAP_TO_COMPLETE_KEY) === 'true'
  );
  tapToComplete$ = this.tapToCompleteSubject.asObservable();

  constructor(private authService: AuthService) {}

  get tapToCompleteValue(): boolean {
    return this.tapToCompleteSubject.value;
  }

  // Pull the server-side value down whenever a fresh profile is loaded, so a
  // device that never toggled the setting locally picks up what was set elsewhere.
  syncFromProfile(profile: any) {
    if (!profile || typeof profile.tap_to_complete !== 'boolean') return;
    this.tapToCompleteSubject.next(profile.tap_to_complete);
    localStorage.setItem(TAP_TO_COMPLETE_KEY, String(profile.tap_to_complete));
  }

  async setTapToComplete(value: boolean) {
    this.tapToCompleteSubject.next(value);
    localStorage.setItem(TAP_TO_COMPLETE_KEY, String(value));

    try {
      const { data } = await this.authService.getUser();
      if (data?.user) {
        await this.authService.updateUserProfile(data.user.id, { tap_to_complete: value });
      }
    } catch (error) {
      console.error('❌ Failed to sync tap-to-complete preference:', error);
    }
  }
}
