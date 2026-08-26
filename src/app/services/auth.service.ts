// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { SupabaseService } from './supabase.service';
import { HabitCacheService } from './habit-cache.service';
import { OfflineQueueService } from './offline-queue.service';
import { DEFAULT_STARTING_BALANCE } from '../shared/default-profile.util';

const LAST_SIGNED_IN_USER_KEY = 'last_signed_in_user_id';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private habitCache: HabitCacheService,
    private offlineQueue: OfflineQueueService
  ) {
    this.supabase = supabaseService.client;
  }

  // Google OAuth sign up
  async signUpWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.getRedirectUrl(),
          // Force Google's account chooser on every explicit sign-in click.
          // Without this, Google silently reuses its own browser-side session
          // (which our signOut() never touches) and skips straight back to the
          // last account instead of letting the user pick a different one.
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        console.error('❌ Google OAuth failed:', error);
        throw error;
      }

      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Google signup failed:', error);
      return { data: null, error };
    }
  }

  // Get platform-specific redirect URL
  private getRedirectUrl(): string {
    // Check if running on mobile (Capacitor)
    if (this.isMobile()) {
      // Must match capacitor.config.ts's appId and the CFBundleURLSchemes /
      // intent-filter registered natively (Info.plist, AndroidManifest.xml) —
      // otherwise iOS/Android has nothing to hand the redirect back to and
      // the OAuth flow dead-ends in the browser instead of returning to the app.
      return `com.grantcross.habittycoon://auth/callback`;
    } else {
      // For PKCE flow, the redirect URL must NOT contain a hash fragment.
      // Supabase appends ?code= as a query param; if the redirect URL already
      // has a hash (#/home), the code lands before the hash and Angular's hash
      // router can't see it cleanly, causing a race where the auth guard fires
      // before the code is exchanged.  Use the plain base path and let the
      // SIGNED_IN event drive navigation to /home.
      const isGitHubPages = window.location.hostname === 'gmcrm.github.io';
      if (isGitHubPages) {
        return `${window.location.origin}/habit-tycoon/`; // GitHub Pages base URL (no hash)
      } else {
        return `${window.location.origin}/`; // Local/other web base URL (no hash)
      }
    }
  }

  // Check if running on mobile platform (native iOS/Android via Capacitor).
  // NOTE: was previously `window.location.protocol === 'capacitor:'`, which
  // only holds on iOS — Android's default androidScheme serves the WebView
  // over https://localhost, so that check silently returned false on Android
  // and sent users to the web OAuth redirect instead of the app's custom
  // URL scheme. Capacitor.isNativePlatform() is correct on both platforms
  // regardless of androidScheme configuration.
  private isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Google OAuth sign in (same as sign up)
  async signInWithGoogle() {
    return this.signUpWithGoogle(); // OAuth handles both signup and signin
  }

  async signUp(email: string, password: string, displayName?: string) {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: displayName || email.split('@')[0]
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup failed:', authError);
        throw authError;
      }

      // Step 2: Check if profile was created by trigger
      if (authData.user) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for trigger

          // getUserProfile() returns null (rather than throwing) when the row
          // doesn't exist yet, so a missing trigger must be detected here —
          // relying on a thrown exception would leave this fallback dead code.
          const profile = await this.getUserProfile(authData.user.id);

          if (profile) {
            console.log('✅ Profile found via trigger:', profile);
          } else {
            console.warn('⚠️ Profile not created by trigger, creating manually...');

            // Step 3: Manually create profile if trigger failed
            try {
              const manualProfile = await this.createUserProfile(
                authData.user.id,
                email,
                displayName || email.split('@')[0]
              );
              console.log('✅ Profile created manually:', manualProfile);
            } catch (manualError) {
              console.error('❌ Manual profile creation failed:', manualError);

              // Don't throw here - auth user is created, profile can be created later
              console.warn('⚠️ Profile creation failed, but auth user exists. User can still log in.');
            }
          }
        } catch (profileError) {
          console.error('❌ Profile check failed unexpectedly:', profileError);
        }
      }

      return { data: authData, error: null };
      
    } catch (error) {
      console.error('❌ Complete signup failed:', error);
      
      // Return detailed error information
      if (error instanceof Error) {
        return { 
          data: null, 
          error: {
            message: error.message,
            details: error
          }
        };
      }
      
      return { 
        data: null, 
        error: {
          message: 'Unknown signup error',
          details: error
        }
      };
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // Password Reset
  async resetPassword(email: string) {
    try {
      // Get the correct redirect URL for password reset with hash routing
      const isGitHubPages = window.location.hostname === 'gmcrm.github.io';
      const resetUrl = isGitHubPages 
        ? `${window.location.origin}/habit-tycoon/#/reset-password`
        : `${window.location.origin}/#/reset-password`;
      
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl
      });

      if (error) {
        console.error('❌ Password reset failed:', error);
        throw error;
      }

      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return { data: null, error };
    }
  }

  // Update password (called from reset password page)
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update failed:', error);
        throw error;
      }

      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Password update failed:', error);
      return { data: null, error };
    }
  }

  /**
   * supabase.auth.getUser() revalidates the JWT with a network round-trip
   * every time — offline, that fails and would otherwise look identical to
   * "not logged in" to every caller (home.page.ts's loadCurrentUser() would
   * redirect straight to /login). Fall back to getSession() below, which
   * carries its own offline fallback.
   */
  async getUser() {
    const result = await this.supabase.auth.getUser();
    if (!result.error && result.data.user) {
      void this.rememberSignedInUser(result.data.user.id);
      return result;
    }

    const { data: { session } } = await this.getSession();
    if (session?.user) {
      return { data: { user: session.user }, error: null };
    }
    return result;
  }

  /**
   * getSession() is NOT a pure local read once the access token is stale
   * (~1hr TTL): gotrue-js tries to silently refresh it over the network
   * first, and offline that refresh fails, so this reports `session: null`
   * — indistinguishable from "signed out" to every caller (auth.guard.ts,
   * the app-startup check, home.page.ts's loadCurrentUser) — even though
   * the refresh token itself is left untouched in storage and no SIGNED_OUT
   * event fires. That's a real bug: a user offline for more than about an
   * hour gets bounced to a login screen they have no way to use, on every
   * app reopen, despite having a perfectly valid session sitting in storage.
   *
   * Fix: remember the user id from the last live check that actually
   * succeeded (see rememberSignedInUser/forgetSignedInUser), and when the
   * live call comes back empty while offline, fall back to that id instead
   * of reporting "no session". This only ever activates while offline, so
   * it can never mask a real sign-out — a genuine SIGNED_OUT event (this
   * device signing out, or an actually-invalid refresh token once back
   * online) still clears the remembered id via forgetSignedInUser().
   */
  async getSession() {
    const result = await this.supabase.auth.getSession();
    if (result.data.session?.user) {
      void this.rememberSignedInUser(result.data.session.user.id);
      return result;
    }

    if (this.offlineQueue.isOffline()) {
      const rememberedUserId = await this.getRememberedUserId();
      if (rememberedUserId) {
        return { data: { session: { user: { id: rememberedUserId } } as any }, error: null };
      }
    }
    return result;
  }

  private async rememberSignedInUser(userId: string): Promise<void> {
    await Preferences.set({ key: LAST_SIGNED_IN_USER_KEY, value: userId });
  }

  private async getRememberedUserId(): Promise<string | null> {
    const { value } = await Preferences.get({ key: LAST_SIGNED_IN_USER_KEY });
    return value;
  }

  /**
   * Clears the id remembered by getSession()'s offline fallback above. Must
   * run on sign-out (see the SIGNED_OUT handler in app.component.ts) so a
   * second account signing in on a shared device never inherits the first
   * account's offline-fallback identity.
   */
  async forgetSignedInUser(): Promise<void> {
    await Preferences.remove({ key: LAST_SIGNED_IN_USER_KEY });
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // User Profile Management
  // Method to manually create user profile
  async createUserProfile(userId: string, email: string, name?: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: email,
            name: name || email.split('@')[0],
            cash: DEFAULT_STARTING_BALANCE,
            net_worth: DEFAULT_STARTING_BALANCE
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Profile creation failed with exception:', error);
      throw error;
    }
  }

  // Marks the current user as having finished the first-run onboarding flow,
  // so the onboarding guard never routes them back into it again.
  async markOnboardingComplete(userId: string) {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('❌ Failed to mark onboarding complete:', error);
      throw error;
    }
  }

  // Marks the current user as having explicitly accepted the Terms of
  // Service / Privacy Policy, collected as the final step of onboarding.
  async markTermsAccepted(userId: string) {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('❌ Failed to mark terms accepted:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If the profile doesn't exist (PGRST116), return null instead of throwing
      if (error.code === 'PGRST116') {
        console.log('ℹ️ Profile not found for user:', userId);
        return null;
      }
      console.error('❌ Profile fetch error:', error);
      throw error;
    }
    // Keep the offline cache warm on every successful fetch, not just after an
    // offline-queue drain — otherwise a user who goes offline before ever
    // queuing an action has no cached snapshot and falls back to a fresh
    // fresh DEFAULT_STARTING_BALANCE instead of their real cash/net worth.
    await this.habitCache.setProfile({ cash: data.cash, net_worth: data.net_worth, name: data.name });
    return data;
  }

  // Ensure user profile exists with proper cash initialization
  // This method is specifically designed to handle Safari/iPad issues with retries
  async ensureUserProfileExists(user?: any): Promise<any> {
    try {
      // Get user if not provided
      if (!user) {
        const { data: { user: currentUser } } = await this.supabase.auth.getUser();
        user = currentUser;
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Skip the live fetch attempt (and the 3x1s retry loop below) entirely
      // when already known to be offline — every caller of this method
      // already catches and falls back to the cached profile / default
      // balance, so attempting the network here only adds 3+ seconds of
      // guaranteed-to-fail stall before that fallback kicks in.
      if (this.offlineQueue.isOffline()) {
        throw new Error('Offline — skipping profile network lookup, caller will fall back to the cached profile.');
      }

      // First, try to get existing profile
      let profile;
      try {
        profile = await this.getUserProfile(user.id);
        if (profile && profile.cash !== undefined && profile.cash !== null) {
          return profile;
        }
      } catch (error) {
        console.log('ℹ️ Profile does not exist yet, will create:', error instanceof Error ? error.message : error);
      }

      // Profile doesn't exist or missing cash, create/update it

      // Use upsert to handle both creation and updates, with retry logic for Safari/iPad
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second
      
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await this.supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.['full_name'] || user.user_metadata?.['name'] || user.email!.split('@')[0],
              cash: DEFAULT_STARTING_BALANCE,
              net_worth: DEFAULT_STARTING_BALANCE
            }, {
              onConflict: 'id'
            })
            .select()
            .single();

          if (error) {
            console.error(`❌ Profile creation attempt ${retryCount + 1} failed:`, error);
            if (retryCount === maxRetries - 1) {
              throw error;
            }
          } else {
            console.log('✅ Profile created/updated successfully:', data);
            await this.habitCache.setProfile({ cash: data.cash, net_worth: data.net_worth, name: data.name });
            return data;
          }
        } catch (error) {
          console.error(`❌ Profile creation attempt ${retryCount + 1} exception:`, error);
          if (retryCount === maxRetries - 1) {
            throw error;
          }
        }

        retryCount++;
        console.log(`⏳ Retrying profile creation in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
    } catch (error) {
      console.error('❌ Failed to ensure profile exists:', error);
      throw error;
    }
  }

  // Force create profile for current authenticated user
  async forceCreateCurrentUserProfile() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Use UPSERT to create or update the profile
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.['full_name'] || user.user_metadata?.['name'] || user.email!.split('@')[0],
          cash: DEFAULT_STARTING_BALANCE,
          net_worth: DEFAULT_STARTING_BALANCE
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Force profile creation failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Force profile creation exception:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  }

  // Username changes go through this RPC rather than updateUserProfile()
  // above: the update_username() function runs server-side (SECURITY
  // DEFINER), validates/sanitizes the new name, and only ever touches the
  // `name` column for the caller's own row -- a generic table update from
  // the client could otherwise be pointed at cash/net_worth/email since the
  // user_profiles RLS policy only checks row ownership, not which columns
  // changed.
  async updateUsername(newName: string) {
    const { data, error } = await this.supabase.rpc('update_username', {
      new_name: newName
    });

    if (error) throw error;
    return data;
  }

  async deleteUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  }

  // Delete the actual auth user account using SQL function
  async deleteAuthUser() {
    try {
      // Call our custom SQL function that can delete auth users
      const { data, error } = await this.supabase.rpc('delete_user_completely');
      
      if (error) {
        console.error('SQL function delete failed:', error);
        return { error };
      }

      if (data && data.success) {
        return { error: null };
      } else {
        return { error: new Error(data?.message || 'Deletion failed') };
      }
    } catch (error) {
      console.error('Auth user deletion failed:', error);
      return { error };
    }
  }

  // Reset account progress while preserving friendships and auth identity
  async resetAccountProgressKeepFriends() {
    const {
      data: { user },
      error: userError
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const nowIso = new Date().toISOString();

    const runDelete = async (table: string, filters: Array<{ column: string; value: string }>) => {
      let query: any = this.supabase.from(table).delete();
      for (const filter of filters) {
        query = query.eq(filter.column, filter.value);
      }

      const { error } = await query;
      if (error) {
        console.warn(`Reset cleanup warning for ${table}:`, error.message);
      }
    };

    // Social content cleanup (friendships are intentionally not touched)
    await runDelete('social_likes', [{ column: 'user_id', value: user.id }]);
    await runDelete('social_posts', [{ column: 'user_id', value: user.id }]);
    await runDelete('challenge_participants', [{ column: 'user_id', value: user.id }]);
    await runDelete('challenges', [{ column: 'creator_id', value: user.id }]);

    // Notifications/pokes sent or received by this user
    const { error: clearPokesError } = await this.supabase
      .from('social_pokes')
      .delete()
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
    if (clearPokesError) {
      console.warn('Reset cleanup warning for social_pokes:', clearPokesError.message);
    }

    // Clear stockholder progress for this user.
    // First, restore any owned shares back to the market so the pool stays accurate.
    // business_stocks' share/price columns can't be written directly by the
    // client (see 20260826010000_fix_business_stocks_update_rls_hole.sql),
    // so this goes through a server-side RPC scoped to the caller's own holdings.
    const { error: returnSharesError } = await this.supabase.rpc('return_user_stock_shares_to_market');
    if (returnSharesError) {
      console.warn('Reset cleanup warning for returning stock shares:', returnSharesError.message);
    }

    await runDelete('stock_dividend_distributions', [{ column: 'stockholder_id', value: user.id }]);
    await runDelete('stock_holdings', [{ column: 'holder_id', value: user.id }]);

    // Remove purchase transaction history so the portfolio function (which queries
    // stock_transactions) does not show ghost stocks after the reset.
    const { error: clearBuyTxError } = await this.supabase
      .from('stock_transactions')
      .delete()
      .eq('buyer_id', user.id)
      .eq('transaction_type', 'purchase');
    if (clearBuyTxError) {
      console.warn('Reset cleanup warning for stock_transactions (purchases):', clearBuyTxError.message);
    }
    const { error: clearSellTxError } = await this.supabase
      .from('stock_transactions')
      .delete()
      .eq('seller_id', user.id)
      .eq('transaction_type', 'sale');
    if (clearSellTxError) {
      console.warn('Reset cleanup warning for stock_transactions (sales):', clearSellTxError.message);
    }

    // Remove completion history
    await runDelete('habit_completions', [{ column: 'user_id', value: user.id }]);

    // Soft-delete all active habits owned by this user.
    // Existing triggers handle stockholder effects for owned businesses.
    const { error: deactivateHabitsError } = await this.supabase
      .from('habit_businesses')
      .update({
        is_active: false,
        current_progress: 0,
        streak: 0,
        updated_at: nowIso
      })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (deactivateHabitsError) {
      throw new Error(`Failed to reset habits: ${deactivateHabitsError.message}`);
    }

    // Reset financial profile to a fresh-account baseline (friendships unchanged)
    const { error: resetProfileError } = await this.supabase
      .from('user_profiles')
      .update({
        cash: DEFAULT_STARTING_BALANCE,
        net_worth: DEFAULT_STARTING_BALANCE,
        updated_at: nowIso
      })
      .eq('id', user.id);

    if (resetProfileError) {
      throw new Error(`Failed to reset profile: ${resetProfileError.message}`);
    }

    return { success: true };
  }

  // Test methods for database connectivity
  async testConnection() {
    try {
      // Simple test to check if we can connect to Supabase
      const { data, error } = await this.supabase.from('users').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected if no users table exists
        throw error;
      }
      return { success: true, message: 'Database connection successful!' };
    } catch (error) {
      return { success: false, message: 'Database connection failed', error };
    }
  }

  async testAuthConnection() {
    try {
      // Test auth system by getting current session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return { 
        success: true, 
        message: 'Auth system working!', 
        hasActiveSession: !!session,
        sessionInfo: session ? { user: session.user.email, expires: session.expires_at } : null
      };
    } catch (error) {
      return { success: false, message: 'Auth connection failed', error };
    }
  }
}