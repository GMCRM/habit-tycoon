import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

// If the app was backgrounded longer than this (ms), force a full reload so
// Angular, Supabase auth, and all subscriptions start fresh.
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private hiddenAt: number | null = null;
  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.hiddenAt = Date.now();
    } else {
      const hiddenMs = this.hiddenAt ? Date.now() - this.hiddenAt : 0;
      this.hiddenAt = null;
      if (hiddenMs > STALE_THRESHOLD_MS) {
        // App was backgrounded too long — hard reload for a clean state.
        window.location.reload();
        return;
      }
      // Short absence: re-enter NgZone and refresh the Supabase JWT so
      // subsequent API calls don't get 401s.
      this.ngZone.run(async () => {
        try {
          await this.authService.supabase.auth.refreshSession();
        } catch {
          // Session already valid or offline — ignore.
        }
      });
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  private getCurrentRoutePath(): string {
    const hashPath = window.location.hash?.replace(/^#/, '') || '';
    if (hashPath.startsWith('/')) {
      return hashPath;
    }
    return this.router.url || '/';
  }

  async ngOnInit() {
    // --- Resume / bfcache handling ---
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    console.log('🔍 AppComponent: Initializing app, current path:', this.getCurrentRoutePath());

    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has('code') || urlParams.has('error_code');

    // Guard to prevent double-navigation if both the listener and the OAuth
    // poller resolve a session at nearly the same time.
    let navigatedToHome = false;
    const goHome = async (user: any) => {
      if (navigatedToHome) return;
      navigatedToHome = true;
      try {
        await this.authService.ensureUserProfileExists(user);
      } catch (e) {
        console.error('❌ AppComponent: Failed to ensure user profile:', e);
      }
      console.log('🔄 AppComponent: Navigating to home');
      await this.router.navigate(['/home']);
      // Strip ?code= so a hard-refresh doesn't attempt to re-exchange an
      // already-used code (which would leave the user stuck on login).
      if (window.location.search) {
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      }
    };

    // CRITICAL: register the auth-state listener SYNCHRONOUSLY before any
    // await.  Supabase begins the PKCE code exchange the moment createClient()
    // is called (in SupabaseService constructor).  By the time ngOnInit runs,
    // the exchange may already be complete and SIGNED_IN already fired.
    // Registering here (before any await) gives us the best chance of catching
    // it; the OAuth poller below is the fallback for when we still miss it.
    this.authService.onAuthStateChange(async (event, session) => {
      this.ngZone.run(async () => {
        console.log('🔍 AppComponent: Auth state change:', event, 'current path:', this.getCurrentRoutePath());

        if (event === 'SIGNED_OUT') {
          console.log('🔄 AppComponent: User signed out, redirecting to login');
          navigatedToHome = false; // Reset so next sign-in works
          this.router.navigate(['/login']);
        } else if (event === 'SIGNED_IN') {
          console.log('🔄 AppComponent: SIGNED_IN event received');
          const currentPath = this.getCurrentRoutePath();
          if (currentPath === '/login' || currentPath === '/sign-up' || currentPath === '/' || isOAuthCallback) {
            await goHome(session?.user);
          }
        }
      });
    });

    if (!isOAuthCallback) {
      // Normal startup: check for an existing session and navigate accordingly.
      try {
        const { data: { session } } = await this.authService.getSession();
        if (session) {
          console.log('✅ AppComponent: User session found');
          const currentPath = this.getCurrentRoutePath();
          if (currentPath === '/login' || currentPath === '/sign-up' || currentPath === '/') {
            this.router.navigate(['/home']);
          }
        } else {
          console.log('❌ AppComponent: No user session found');
          const currentPath = this.getCurrentRoutePath();
          const publicPaths = ['/login', '/sign-up', '/reset-password', '/'];
          if (!publicPaths.includes(currentPath)) {
            this.router.navigate(['/login']);
          }
        }
      } catch (error) {
        console.log('❌ AppComponent: Session check failed:', error);
        const currentPath = this.getCurrentRoutePath();
        const publicPaths = ['/login', '/sign-up', '/reset-password', '/'];
        if (!publicPaths.includes(currentPath)) {
          this.router.navigate(['/login']);
        }
      }
    } else {
      // OAuth callback path.
      // SIGNED_IN may have already fired before our listener was registered
      // (Supabase exchanges the code as part of createClient(), which happens
      // before Angular's ngOnInit).  Poll getSession() as a reliable fallback.
      console.log('🔍 AppComponent: OAuth callback detected — polling for session...');
      let attempts = 0;
      const pollForSession = async () => {
        if (navigatedToHome) return; // Listener already handled it
        attempts++;
        try {
          const { data: { session } } = await this.authService.getSession();
          if (session) {
            console.log('✅ AppComponent: OAuth session confirmed via poll');
            this.ngZone.run(() => goHome(session.user));
          } else if (attempts < 20) {
            setTimeout(pollForSession, 400); // retry up to ~8 s
          } else {
            console.log('❌ AppComponent: OAuth session poll timed out, going to login');
            this.router.navigate(['/login']);
          }
        } catch {
          if (attempts < 20) setTimeout(pollForSession, 400);
        }
      };
      setTimeout(pollForSession, 200);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}
