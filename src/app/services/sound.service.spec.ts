import { TestBed } from '@angular/core/testing';

import { SoundService } from './sound.service';
import { SupabaseService } from './supabase.service';

// Capacitor's web Preferences implementation just wraps localStorage under
// a "CapacitorStorage." prefix, so exercising the real thing (and clearing
// it between tests) is more reliable than trying to spy on the plugin proxy.
const STORAGE_KEY = 'CapacitorStorage.soundEffectsEnabled';

describe('SoundService', () => {
  let service: SoundService;
  let playSpy: jasmine.Spy;
  let mockSupabaseClient: any;
  let authApi: any;
  let userProfilesQuery: any;

  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);

    playSpy = jasmine.createSpy('play').and.resolveTo();
    spyOn(window, 'Audio').and.returnValue({ play: playSpy, currentTime: 0 } as any);

    // No signed-in user by default -- isEnabled()/setEnabled() should fall
    // straight back to the local Preferences copy without erroring.
    authApi = {
      getUser: jasmine.createSpy('getUser').and.resolveTo({ data: { user: null }, error: null })
    };

    // Built in two steps rather than one self-referencing object literal --
    // `and.returnValue(userProfilesQuery)` inside the literal would capture
    // the previous test's (or undefined) value, since the variable isn't
    // bound to this object until the whole literal finishes evaluating.
    userProfilesQuery = {};
    userProfilesQuery.select = jasmine.createSpy('select').and.returnValue(userProfilesQuery);
    userProfilesQuery.eq = jasmine.createSpy('eq').and.returnValue(userProfilesQuery);
    userProfilesQuery.single = jasmine.createSpy('single').and.resolveTo({ data: null, error: null });
    userProfilesQuery.update = jasmine.createSpy('update').and.returnValue(userProfilesQuery);

    mockSupabaseClient = {
      auth: authApi,
      from: jasmine.createSpy('from').and.returnValue(userProfilesQuery)
    };

    // Provide a fake SupabaseService rather than letting the real one
    // construct a live Supabase client -- that client's background session
    // init (Navigator LockManager, auto-refresh) is otherwise still spun up
    // and races across tests even though SoundService never uses it.
    TestBed.configureTestingModule({
      providers: [
        SoundService,
        { provide: SupabaseService, useValue: { client: mockSupabaseClient } }
      ]
    });
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

  it('persists the enabled preference locally and reflects it back', async () => {
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

  it('syncs the preference to the user_profiles row for a signed-in user', async () => {
    authApi.getUser.and.resolveTo({ data: { user: { id: 'user-1' } }, error: null });

    await service.setEnabled(false);

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
    expect(userProfilesQuery.update).toHaveBeenCalledWith({ sound_effects_enabled: false });
    expect(userProfilesQuery.eq).toHaveBeenCalledWith('id', 'user-1');
  });

  it('reads the preference from the profile for a signed-in user', async () => {
    authApi.getUser.and.resolveTo({ data: { user: { id: 'user-1' } }, error: null });
    userProfilesQuery.single.and.resolveTo({ data: { sound_effects_enabled: false }, error: null });

    expect(await service.isEnabled()).toBeFalse();
  });

  it('falls back to the local value when the profile fetch fails', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'false');
    authApi.getUser.and.resolveTo({ data: { user: { id: 'user-1' } }, error: null });
    userProfilesQuery.single.and.resolveTo({ data: null, error: { message: 'offline' } });

    expect(await service.isEnabled()).toBeFalse();
  });
});
