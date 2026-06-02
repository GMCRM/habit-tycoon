import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Singleton service that owns the single Supabase client for the app.
 * All other services should inject this and use `supabaseService.client`
 * instead of calling createClient() themselves, to avoid the
 * "Multiple GoTrueClient instances" warning and related auth lock conflicts.
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        // Set to false so Supabase does NOT auto-exchange the ?code= param on
        // createClient(). We call exchangeCodeForSession() explicitly in
        // AppComponent so we have a direct, awaitable handle on the result
        // instead of racing against Supabase's internal lock.
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'habit-tycoon-web',
        },
      },
    });
  }
}
