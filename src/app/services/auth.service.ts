// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'X-Client-Info': 'habit-tycoon-web'
        }
      }
    });
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
      return `${window.location.origin}/home`; // Web redirect
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
      
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
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