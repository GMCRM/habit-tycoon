import { TestBed } from '@angular/core/testing';

import { SoundService } from './sound.service';

// Capacitor's web Preferences implementation just wraps localStorage under
// a "CapacitorStorage." prefix, so exercising the real thing (and clearing
// it between tests) is more reliable than trying to spy on the plugin proxy.
const STORAGE_KEY = 'CapacitorStorage.soundEffectsEnabled';

describe('SoundService', () => {
  let service: SoundService;
  let playSpy: jasmine.Spy;

  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);

    playSpy = jasmine.createSpy('play').and.resolveTo();
    spyOn(window, 'Audio').and.returnValue({ play: playSpy, currentTime: 0 } as any);

    TestBed.configureTestingModule({ providers: [SoundService] });
    service = TestBed.inject(SoundService);
  });

  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('defaults sound effects to enabled when no preference is stored', async () => {
    expect(await service.isEnabled()).toBeTrue();
  });

  it('persists the enabled preference and reflects it back', async () => {
    await service.setEnabled(false);
    expect(await service.isEnabled()).toBeFalse();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('plays the complete sound when enabled', async () => {
    await service.playComplete();
    expect(window.Audio).toHaveBeenCalledWith('assets/sounds/complete.mp3');
    expect(playSpy).toHaveBeenCalled();
  });

  it('plays the undo sound when enabled', async () => {
    await service.playUndo();
    expect(window.Audio).toHaveBeenCalledWith('assets/sounds/undo.mp3');
    expect(playSpy).toHaveBeenCalled();
  });

  it('does not play sounds when disabled', async () => {
    await service.setEnabled(false);
    await service.playComplete();
    expect(window.Audio).not.toHaveBeenCalled();
  });
});
