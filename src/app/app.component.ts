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
    // 'pageshow' fires on bfcache restores (event.persisted = true).
    // On iOS Chrome the page is completely frozen in bfcache; the only
    // reliable fix is a hard reload so Angular starts fresh.
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
    // Track foreground/background transitions.
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    console.log('🔍 AppComponent: Initializing app, current path:', this.getCurrentRoutePath());
    
    // Check if user is already logged in when app starts
    try {
      const { data: { session } } = await this.authService.getSession();
      
      if (session) {
        console.log('✅ AppComponent: User session found');
        // User is logged in, redirect to home if on login/signup/root page only
        const currentPath = this.getCurrentRoutePath();
        if (currentPath === '/login' || currentPath === '/sign-up' || currentPath === '/') {
          console.log('🔄 AppComponent: Redirecting from auth page to home');
          this.router.navigate(['/home']);
        } else {
          console.log('🔍 AppComponent: Staying on current protected page:', currentPath);
        }
        // For other protected pages (like /social, /home, etc.), stay on current page
      } else {
        console.log('❌ AppComponent: No user session found');
        // User is not logged in, redirect to login if on any protected page
        const currentPath = this.getCurrentRoutePath();
        const publicPaths = ['/login', '/sign-up', '/reset-password', '/'];
        if (!publicPaths.includes(currentPath)) {
          console.log('🔄 AppComponent: Redirecting from protected page to login');
          this.router.navigate(['/login']);
        }
      }
    } catch (error) {
      console.log('❌ AppComponent: Session check failed:', error);
      // If session check fails, only redirect if on a protected page
      const currentPath = this.getCurrentRoutePath();
      const publicPaths = ['/login', '/sign-up', '/reset-password', '/'];
      if (!publicPaths.includes(currentPath)) {
        console.log('🔄 AppComponent: Redirecting from protected page to login (session check failed)');
        this.router.navigate(['/login']);
      }
    }

    // Listen to auth state changes
    this.authService.onAuthStateChange(async (event, session) => {
      console.log('🔍 AppComponent: Auth state change:', event, 'current path:', this.getCurrentRoutePath());
      
      if (event === 'SIGNED_OUT') {
        console.log('🔄 AppComponent: User signed out, redirecting to login');
        this.router.navigate(['/login']);
      } else if (event === 'SIGNED_IN') {
        console.log('🔄 AppComponent: User signed in, ensuring profile exists...');
        
        // Ensure user profile exists with proper cash initialization
        // This is critical for OAuth users on Safari/iPad
        try {
          await this.authService.ensureUserProfileExists(session?.user);
          console.log('✅ AppComponent: User profile ensured');
        } catch (error) {
          console.error('❌ AppComponent: Failed to ensure user profile:', error);
          // Don't block the sign-in process, but log the error
        }
        
        // Only redirect to home if currently on login/signup page
        const currentPath = this.getCurrentRoutePath();
        if (currentPath === '/login' || currentPath === '/sign-up' || currentPath === '/') {
          console.log('🔄 AppComponent: User signed in from auth page, redirecting to home');
          this.router.navigate(['/home']);
        } else {
          console.log('🔍 AppComponent: User signed in, staying on current page:', currentPath);
        }
        // If user signs in while on other pages, stay there
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}
