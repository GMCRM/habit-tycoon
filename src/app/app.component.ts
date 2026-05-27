import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  private getCurrentRoutePath(): string {
    const hashPath = window.location.hash?.replace(/^#/, '') || '';
    if (hashPath.startsWith('/')) {
      return hashPath;
    }
    return this.router.url || '/';
  }

  async ngOnInit() {
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
}
