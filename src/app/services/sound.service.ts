import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

const SOUND_ENABLED_KEY = 'soundEffectsEnabled';

type SoundName = 'complete' | 'undo';

const SOUND_FILES: Record<SoundName, string> = {
  complete: 'assets/sounds/complete.mp3',
  undo: 'assets/sounds/undo.mp3',
};

/**
 * Short UI sound effects (habit completion, undo). The on/off preference is
 * the `sound_effects_enabled` column on the user's `user_profiles` row, so
 * it's the same across devices; a local Preferences copy is kept in sync as
 * a fallback for when there's no session or no network. Cached in memory
 * after first read/write so playback never blocks on I/O, and defaults to
 * on for users who haven't set it yet.
 */
@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private supabase: SupabaseClient;
  private enabledCache: boolean | null = null;
  private audioCache = new Map<SoundName, HTMLAudioElement>();

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService.client;
  }

  async isEnabled(): Promise<boolean> {
    if (this.enabledCache !== null) {
      return this.enabledCache;
    }

    const { value: localValue } = await Preferences.get({ key: SOUND_ENABLED_KEY });

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        const { data, error } = await this.supabase
          .from('user_profiles')
          .select('sound_effects_enabled')
          .eq('id', user.id)
          .single();
        if (!error && data?.sound_effects_enabled !== null && data?.sound_effects_enabled !== undefined) {
          const remoteValue: boolean = data.sound_effects_enabled;
          this.enabledCache = remoteValue;
          await Preferences.set({ key: SOUND_ENABLED_KEY, value: String(remoteValue) });
          return remoteValue;
        }
      }
    } catch (error) {
      // No network / no session / row not found yet -- fall back to the
      // last-known local value below rather than failing playback.
      console.warn('SoundService: failed to fetch sound preference from profile, using local cache', error);
    }

    this.enabledCache = localValue === null ? true : localValue === 'true';
    return this.enabledCache;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabledCache = enabled;
    await Preferences.set({ key: SOUND_ENABLED_KEY, value: String(enabled) });

    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        const { error } = await this.supabase
          .from('user_profiles')
          .update({ sound_effects_enabled: enabled })
          .eq('id', user.id);
        if (error) throw error;
      }
    } catch (error) {
      // Cross-device sync is best-effort -- the local Preferences copy above
      // already makes the toggle take effect immediately on this device.
      console.warn('SoundService: failed to sync sound preference to profile', error);
    }
  }

  async playComplete(): Promise<void> {
    await this.play('complete');
  }

  async playUndo(): Promise<void> {
    await this.play('undo');
  }

  private async play(name: SoundName): Promise<void> {
    if (!(await this.isEnabled())) {
      return;
    }
    try {
      let audio = this.audioCache.get(name);
      if (!audio) {
        audio = new Audio(SOUND_FILES[name]);
        this.audioCache.set(name, audio);
      }
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      // Playback can fail silently (e.g. autoplay restrictions, unsupported
      // format) — a missed sound effect must never break the underlying action.
      console.warn(`SoundService: failed to play "${name}" sound`, error);
    }
  }
}
