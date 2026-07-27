import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { AuthService } from './services/auth.service';
import { WidgetBridge } from './services/widget-bridge.plugin';

// If the app was backgrounded longer than this (ms), force a full reload so
// Angular, Supabase auth, and all subscriptions start fresh.
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  // Guards shared between the web ?code= callback path (ngOnInit) and the
  // native deep-link callback path (appUrlOpen) below, since both can land
  // on the same account.
  private navigatedToHome = false;
  private isExchangingCode = false;
  private appUrlOpenListener: PluginListenerHandle | null = null;
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

  // Keeps the iOS widget's copy of the Supabase session current — its own
  // sync point (independent of HabitCacheService's habit-snapshot sync)
  // since the widget extension authenticates its own network calls and
  // needs a refresh_token, not habit data. Called from every
  // onAuthStateChange event that carries a session (SIGNED_IN,
  // TOKEN_REFRESHED, INITIAL_SESSION, ...) plus the startup getSession()
  // check below, so a signed-in widget stays current without extra polling.
  private syncWidgetAuthSession(session: any): void {
    if (!session?.access_token || !session?.refresh_token || !session?.user?.id) return;
    void WidgetBridge.syncAuthSession({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      userId: session.user.id,
    });
  }

  private getCurrentRoutePath(): string {
    const hashPath = window.location.hash?.replace(/^#/, '') || '';
    if (hashPath.startsWith('/')) {
      return hashPath;
    }
    return this.router.url || '/';
  }

  private async goHome(user: any) {
    if (this.navigatedToHome) return;
    this.navigatedToHome = true;
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
  }

  // Exchanges an OAuth `code` for a session. Shared by the web callback path
  // (?code= in window.location.search, handled in ngOnInit) and the native
  // deep-link callback path (com.grantcross.habittycoon://auth/callback?code=,
  // handled by the appUrlOpen listener below) — Capacitor's WebView never
  // navigates to the custom-scheme URL, so window.location never sees the
  // code on native; it only ever arrives via the appUrlOpen event.
  private async exchangeCodeAndGoHome(code: string) {
    console.log('🔍 AppComponent: OAuth callback — exchanging code for session...');
    this.isExchangingCode = true;
    try {
      const { data, error } = await this.authService.supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('❌ AppComponent: Code exchange failed:', error.message);
        this.ngZone.run(() => this.router.navigate(['/login']));
      } else if (data.session) {
        console.log('✅ AppComponent: Code exchange succeeded');
        // goHome may also be triggered by the SIGNED_IN listener below;
        // navigatedToHome guards against a double navigation.
        await this.goHome(data.session.user);
      } else {
        console.error('❌ AppComponent: No session after code exchange');
        this.ngZone.run(() => this.router.navigate(['/login']));
      }
    } catch (err) {
      console.error('❌ AppComponent: Code exchange threw:', err);
      this.ngZone.run(() => this.router.navigate(['/login']));
    } finally {
      this.isExchangingCode = false;
    }
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

    // Native deep-link callback: com.grantcross.habittycoon://auth/callback?code=...
    // Google/Supabase redirects the system browser here after sign-in; iOS/Android
    // foreground the app via the registered URL scheme and Capacitor fires this
    // event with the full URL. This never touches window.location, so it's the
    // only place the code arrives on native — the ?code= branch below only fires
    // on web.
    // Not awaited: this must not delay the onAuthStateChange registration
    // immediately below, which has to run before any await (see its comment).
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.ngZone.run(async () => {
        console.log('🔍 AppComponent: appUrlOpen received:', event.url);
        const callbackUrl = new URL(event.url);
        const errorCode = callbackUrl.searchParams.get('error_code');
        if (errorCode) {
          console.error('❌ AppComponent: OAuth error via deep link:', callbackUrl.searchParams.get('error_description'));
          this.router.navigate(['/login']);
          return;
        }
        const code = callbackUrl.searchParams.get('code');
        if (code) {
          await this.exchangeCodeAndGoHome(code);
        }
      });
    }).then(handle => { this.appUrlOpenListener = handle; });

    // CRITICAL: register the auth-state listener SYNCHRONOUSLY before any
    // await.  Supabase begins the PKCE code exchange the moment createClient()
    // is called (in SupabaseService constructor).  By the time ngOnInit runs,
    // the exchange may already be complete and SIGNED_IN already fired.
    // Registering here (before any await) gives us the best chance of catching
    // it; the OAuth poller below is the fallback for when we still miss it.
    this.authService.onAuthStateChange(async (event, session) => {
      this.ngZone.run(async () => {
        console.log('🔍 AppComponent: Auth state change:', event, 'current path:', this.getCurrentRoutePath());

        // Covers every event that carries a session (SIGNED_IN,
        // TOKEN_REFRESHED, INITIAL_SESSION, ...), not just the two branched
        // on below — the widget needs a current token independent of the
        // app's own navigation concerns.
        if (session) {
          this.syncWidgetAuthSession(session);
        }

        if (event === 'SIGNED_OUT') {
          // Ignore SIGNED_OUT while the OAuth code exchange is in-flight.
          // On Chrome (desktop) Supabase fires SIGNED_OUT when it finds and
          // invalidates a stale session stored in localStorage from a prior
          // visit. If this event arrives after SIGNED_IN the unguarded
          // router.navigate(['/login']) call would override the successful
          // exchange and boot the user back to the login screen.
          if (this.isExchangingCode) {
            console.log('🔍 AppComponent: Ignoring SIGNED_OUT during OAuth code exchange');
            return;
          }
          console.log('🔄 AppComponent: User signed out, redirecting to login');
          this.navigatedToHome = false; // Reset so next sign-in works
          void WidgetBridge.clearAuthSession();
          this.router.navigate(['/login']);
        } else if (event === 'SIGNED_IN') {
          console.log('🔄 AppComponent: SIGNED_IN event received');
          const currentPath = this.getCurrentRoutePath();
          if (currentPath === '/login' || currentPath === '/sign-up' || currentPath === '/' || isOAuthCallback) {
            await this.goHome(session?.user);
          }
        }
      });
    });

    // Strip ?code= from the URL immediately so that if the page is ever
    // restored from Chrome's bfcache the already-used code is not visible and
    // won't trigger a second (doomed) exchange attempt.
    if (isOAuthCallback && window.location.search && !urlParams.has('error_code')) {
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }

    if (!isOAuthCallback) {
      // Normal startup: check for an existing session and navigate accordingly.
      try {
        const { data: { session } } = await this.authService.getSession();
        if (session) {
          console.log('✅ AppComponent: User session found');
          this.syncWidgetAuthSession(session);
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
      // OAuth callback — exchange the code ourselves so we have a direct,
      // awaitable result instead of racing against Supabase's internal lock.
      // detectSessionInUrl is false in SupabaseService so Supabase will NOT
      // attempt the exchange on its own.
      if (urlParams.has('error_code')) {
        console.error('❌ AppComponent: OAuth error:', urlParams.get('error_description'));
        this.ngZone.run(() => this.router.navigate(['/login']));
        return;
      }

      const code = urlParams.get('code')!;
      await this.exchangeCodeAndGoHome(code);
    }
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.appUrlOpenListener?.remove();
  }
}
