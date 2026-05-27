import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

// ============================================================================
// TEST GROUP 1: Auth & Sessions
// "Test that users can log in, stay logged in, and get safely logged out
//  when sessions expire."
// ============================================================================

describe('AuthService', () => {
  let service: AuthService;

  let mockSupabaseClient: any;
  let authApi: any;
  let userProfilesQuery: any;

  beforeEach(() => {
    authApi = {
      signInWithPassword: jasmine.createSpy('signInWithPassword')
        .and.resolveTo({ data: { user: { id: 'u1' } }, error: null }),
      signUp: jasmine.createSpy('signUp')
        .and.resolveTo({ data: { user: { id: 'u1', email: 'test@example.com' } }, error: null }),
      signOut: jasmine.createSpy('signOut')
        .and.resolveTo({ error: null }),
      getSession: jasmine.createSpy('getSession')
        .and.resolveTo({ data: { session: { access_token: 'token', expires_at: 9999999999 } }, error: null }),
      getUser: jasmine.createSpy('getUser')
        .and.resolveTo({ data: { user: { id: 'u1', email: 'test@example.com', user_metadata: { name: 'Tester' } } }, error: null }),
      onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.returnValue({
        data: { subscription: { unsubscribe: jasmine.createSpy('unsubscribe') } }
      }),
      signInWithOAuth: jasmine.createSpy('signInWithOAuth')
        .and.resolveTo({ data: { url: 'https://google.com/auth' }, error: null }),
      resetPasswordForEmail: jasmine.createSpy('resetPasswordForEmail')
        .and.resolveTo({ data: {}, error: null }),
      updateUser: jasmine.createSpy('updateUser')
        .and.resolveTo({ data: { user: { id: 'u1' } }, error: null })
    };

    userProfilesQuery = {
      insert: jasmine.createSpy('insert'),
      select: jasmine.createSpy('select'),
      eq: jasmine.createSpy('eq'),
      single: jasmine.createSpy('single'),
      update: jasmine.createSpy('update'),
      delete: jasmine.createSpy('delete'),
      upsert: jasmine.createSpy('upsert')
    };

    userProfilesQuery.insert.and.returnValue(userProfilesQuery);
    userProfilesQuery.select.and.returnValue(userProfilesQuery);
    userProfilesQuery.eq.and.returnValue(userProfilesQuery);
    userProfilesQuery.update.and.returnValue(userProfilesQuery);
    userProfilesQuery.delete.and.returnValue(userProfilesQuery);
    userProfilesQuery.upsert.and.returnValue(userProfilesQuery);

    mockSupabaseClient = {
      auth: authApi,
      from: jasmine.createSpy('from').and.callFake((table: string) => {
        if (table === 'user_profiles') {
          return userProfilesQuery;
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
      rpc: jasmine.createSpy('rpc').and.resolveTo({ data: { success: true }, error: null })
    };

    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    (service as any).supabase = mockSupabaseClient;
  });

  // --- Signing In ---

  // A valid email/password should authenticate and return user data
  it('should sign in with correct credentials and return user data', async () => {
    const result = await service.signIn('test@example.com', 'secret');

    expect(authApi.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret'
    });
    expect(result as any).toEqual(
      jasmine.objectContaining({
        user: jasmine.objectContaining({ id: 'u1' })
      })
    );
  });

  // Wrong password should throw so the UI can show an error
  it('should throw an error when login credentials are wrong', async () => {
    authApi.signInWithPassword.and.resolveTo({ data: null, error: { message: 'bad credentials' } });

    await expectAsync(service.signIn('test@example.com', 'wrong')).toBeRejected();
  });

  // Google OAuth should initiate redirect flow
  it('should initiate Google OAuth sign-in flow', async () => {
    const result = await service.signUpWithGoogle();

    expect(authApi.signInWithOAuth).toHaveBeenCalledWith(
      jasmine.objectContaining({ provider: 'google' })
    );
    expect(result.error).toBeNull();
  });

  // Google OAuth failure should return error, not throw
  it('should return error object when Google OAuth fails', async () => {
    authApi.signInWithOAuth.and.resolveTo({ data: null, error: { message: 'oauth failed' } });

    const result = await service.signUpWithGoogle();

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  // --- Staying Logged In (Sessions) ---

  // getSession should return a valid session with access token
  it('should return current session with access token', async () => {
    const session = await service.getSession();

    expect(authApi.getSession).toHaveBeenCalled();
    expect((session as any).data.session).toEqual(
      jasmine.objectContaining({ access_token: 'token' })
    );
  });

  // Auth state change listener should fire when session changes
  it('should subscribe to auth state changes and return unsubscribe handle', () => {
    const callback = jasmine.createSpy('callback');
    const result = service.onAuthStateChange(callback);

    expect(authApi.onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(result.data.subscription.unsubscribe).toBeDefined();
  });

  // getUser should return the current authenticated user
  it('should return the current authenticated user', async () => {
    const result = await service.getUser();

    expect(authApi.getUser).toHaveBeenCalled();
    expect((result as any).data.user.id).toBe('u1');
  });

  // --- Signing Out ---

  // signOut should call supabase auth.signOut
  it('should sign out successfully', async () => {
    await service.signOut();

    expect(authApi.signOut).toHaveBeenCalled();
  });

  // If signOut fails (network issue) the error should propagate
  it('should throw when sign out fails due to network error', async () => {
    authApi.signOut.and.resolveTo({ error: { message: 'network issue' } });

    await expectAsync(service.signOut()).toBeRejected();
  });

  // --- Password Reset ---

  // resetPassword should send email via Supabase
  it('should send a password reset email', async () => {
    const result = await service.resetPassword('test@example.com');

    expect(authApi.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      jasmine.objectContaining({ redirectTo: jasmine.any(String) })
    );
    expect(result.error).toBeNull();
  });

  // updatePassword should update the current user's password
  it('should update password for the current user', async () => {
    const result = await service.updatePassword('newPassword123');

    expect(authApi.updateUser).toHaveBeenCalledWith({ password: 'newPassword123' });
    expect(result.error).toBeNull();
  });

  // Failed password update should return error
  it('should return error when password update fails', async () => {
    authApi.updateUser.and.resolveTo({ data: null, error: { message: 'weak password' } });

    // updatePassword catches the error internally and returns it
    const result = await service.updatePassword('123');

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  // --- User Profile Creation ---

  // Signing up should create an auth user and a profile with $100 starting cash
  it('should create a user profile with $100 starting cash', async () => {
    userProfilesQuery.single.and.resolveTo({
      data: { id: 'u1', cash: 100, net_worth: 100 },
      error: null
    });

    const profile = await service.createUserProfile('u1', 'test@example.com', 'Tester');

    expect(userProfilesQuery.insert).toHaveBeenCalledWith([
      jasmine.objectContaining({
        id: 'u1',
        email: 'test@example.com',
        name: 'Tester',
        cash: 100.00,
        net_worth: 100.00
      })
    ]);
    expect(profile.cash).toBe(100);
  });

  // If no display name is given, use the part before @ in the email
  it('should default display name to email prefix when no name given', async () => {
    userProfilesQuery.single.and.resolveTo({ data: { id: 'u1', name: 'player' }, error: null });

    await service.createUserProfile('u1', 'player@gmail.com');

    expect(userProfilesQuery.insert).toHaveBeenCalledWith([
      jasmine.objectContaining({ name: 'player' })
    ]);
  });

  // --- User Profile Lookup ---

  // getUserProfile should return null (not throw) when profile doesn't exist
  it('should return null when user profile does not exist (PGRST116)', async () => {
    userProfilesQuery.single.and.resolveTo({ data: null, error: { code: 'PGRST116', message: 'Not found' } });

    const profile = await service.getUserProfile('missing-user');

    expect(profile).toBeNull();
  });

  // getUserProfile should throw on real database errors
  it('should throw on actual database errors (not just "not found")', async () => {
    userProfilesQuery.single.and.resolveTo({ data: null, error: { code: '42P01', message: 'relation does not exist' } });

    await expectAsync(service.getUserProfile('u1')).toBeRejected();
  });

  // --- Profile Updates ---

  // updateUserProfile should pass updates to Supabase
  it('should update user profile fields', async () => {
    userProfilesQuery.select.and.returnValue(userProfilesQuery);
    userProfilesQuery.single.and.resolveTo({ data: null, error: null });
    // Make update return the chain too
    userProfilesQuery.update.and.returnValue(userProfilesQuery);

    await service.updateUserProfile('u1', { name: 'New Name' });

    expect(userProfilesQuery.update).toHaveBeenCalledWith({ name: 'New Name' });
    expect(userProfilesQuery.eq).toHaveBeenCalledWith('id', 'u1');
  });

  // --- Account Deletion ---

  // deleteAuthUser calls the RPC function to fully delete the account
  it('should call RPC to completely delete user account', async () => {
    const result = await service.deleteAuthUser();

    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('delete_user_completely');
    expect(result.error).toBeNull();
  });

  // deleteUserProfile removes the profile row
  it('should delete the user profile record', async () => {
    userProfilesQuery.delete.and.returnValue(userProfilesQuery);
    userProfilesQuery.eq.and.resolveTo({ data: null, error: null });

    await service.deleteUserProfile('u1');

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
    expect(userProfilesQuery.delete).toHaveBeenCalled();
  });
});
