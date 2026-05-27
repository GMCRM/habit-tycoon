// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = supabaseService.client;
  }

  // Google OAuth sign up
  async signUpWithGoogle() {
    try {
      console.log('🔄 Starting Google OAuth signup...');
      
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: this.getRedirectUrl()
        }
      });

      if (error) {
        console.error('❌ Google OAuth failed:', error);
        throw error;
      }

      console.log('✅ Google OAuth initiated:', data);
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
      return `io.ionic.habittycoon://auth/callback`; // Custom URL scheme for mobile
    } else {
      // For GitHub Pages, we need to include the base path and account for hash routing
      const isGitHubPages = window.location.hostname === 'gmcrm.github.io';
      if (isGitHubPages) {
        return `${window.location.origin}/habit-tycoon/#/home`; // GitHub Pages redirect with hash routing
      } else {
        return `${window.location.origin}/#/home`; // Local/other web redirect with hash routing
      }
    }
  }

  // Check if running on mobile platform
  private isMobile(): boolean {
    return window.location.protocol === 'capacitor:';
  }

  // Google OAuth sign in (same as sign up)
  async signInWithGoogle() {
    return this.signUpWithGoogle(); // OAuth handles both signup and signin
  }

  async signUp(email: string, password: string, displayName?: string) {
    try {
      console.log('🔄 Starting signup process...');
      console.log('Email:', email);
      console.log('Display name:', displayName);
      
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

      console.log('✅ Auth user created:', authData.user?.id);

      // Step 2: Check if profile was created by trigger
      if (authData.user) {
        try {
          console.log('🔄 Checking if profile was created by trigger...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for trigger
          
          const profile = await this.getUserProfile(authData.user.id);
          console.log('✅ Profile found via trigger:', profile);
          
        } catch (profileError) {
          console.warn('⚠️ Profile not created by trigger, creating manually...');
          console.error('Profile check error:', profileError);
          
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
      console.log('🔄 Sending password reset email to:', email);
      
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

      console.log('✅ Password reset email sent successfully');
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return { data: null, error };
    }
  }

  // Update password (called from reset password page)
  async updatePassword(newPassword: string) {
    try {
      console.log('🔄 Updating password...');
      
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update failed:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Password update failed:', error);
      return { data: null, error };
    }
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  // Get current session
  getSession() {
    return this.supabase.auth.getSession();
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // User Profile Management
  // Method to manually create user profile
  async createUserProfile(userId: string, email: string, name?: string) {
    console.log('🔄 Creating profile manually...');
    console.log('User ID:', userId);
    console.log('Email:', email);
    console.log('Name:', name);

    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: email,
            name: name || email.split('@')[0],
            cash: 100.00,
            net_worth: 100.00
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
      
      console.log('✅ Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Profile creation failed with exception:', error);
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

      console.log('🔍 Ensuring profile exists for user:', user.id);

      // First, try to get existing profile
      let profile;
      try {
        profile = await this.getUserProfile(user.id);
        if (profile && profile.cash !== undefined && profile.cash !== null) {
          console.log('✅ Profile already exists with proper cash:', profile);
          return profile;
        }
      } catch (error) {
        console.log('ℹ️ Profile does not exist yet, will create:', error instanceof Error ? error.message : error);
      }

      // Profile doesn't exist or missing cash, create/update it
      console.log('🔄 Creating/updating profile for user:', user.id);
      
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
              cash: 100.00,
              net_worth: 100.00
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

      console.log('🔄 Force creating profile for current user...');
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.['full_name'] || user.user_metadata?.['name']
      });

      // Use UPSERT to create or update the profile
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.['full_name'] || user.user_metadata?.['name'] || user.email!.split('@')[0],
          cash: 100.00,
          net_worth: 100.00
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Force profile creation failed:', error);
        throw error;
      }

      console.log('✅ Profile force created/updated successfully:', data);
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

  // Testing method to get all profiles (for debugging)
  async getAllProfiles() {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error('Error getting all profiles:', error);
      throw error;
    }
    
    return data;
  }

  // Testing method to get all auth users (for debugging)
  async getAllAuthUsers() {
    try {
      // Note: This requires admin privileges, might not work
      const { data, error } = await this.supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error getting auth users:', error);
        return [];
      }
      
      return data.users;
    } catch (error) {
      console.error('Admin access not available:', error);
      return [];
    }
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
      
      console.log('Delete result:', data);
      
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

    // Clear stockholder progress for this user
    await runDelete('stock_dividend_distributions', [{ column: 'stockholder_id', value: user.id }]);
    await runDelete('stock_holdings', [{ column: 'holder_id', value: user.id }]);

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
        cash: 100.00,
        net_worth: 100.00,
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