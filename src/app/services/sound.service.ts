import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const SOUND_ENABLED_KEY = 'soundEffectsEnabled';

type SoundName = 'complete' | 'undo';

const SOUND_FILES: Record<SoundName, string> = {
  complete: 'assets/sounds/complete.mp3',
  undo: 'assets/sounds/undo.mp3',
};

/**
 * Short UI sound effects (habit completion, undo). Preference is cached in
 * memory after first read/write so playback never blocks on Preferences I/O,
 * and defaults to on for users who haven't set it yet.
 */
@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private enabledCache: boolean | null = null;
  private audioCache = new Map<SoundName, HTMLAudioElement>();

  async isEnabled(): Promise<boolean> {
    if (this.enabledCache !== null) {
      return this.enabledCache;
    }
    const { value } = await Preferences.get({ key: SOUND_ENABLED_KEY });
    this.enabledCache = value === null ? true : value === 'true';
    return this.enabledCache;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabledCache = enabled;
    await Preferences.set({ key: SOUND_ENABLED_KEY, value: String(enabled) });
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
