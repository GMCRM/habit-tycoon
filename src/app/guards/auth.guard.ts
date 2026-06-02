import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Use getSession() (cached, no HTTP round-trip) instead of getUser() so the
    // guard resolves instantly after PKCE code exchange. getUser() makes a network
    // request which can take 1-2 s, causing Ionic to hold the page transition and
    // show a black background while waiting.
    const {
      data: { session }
    } = await authService.getSession();

    if (session?.user) {
      return true;
    }

    return router.createUrlTree(['/login']);
  } catch (error) {
    console.error('Auth guard session check failed:', error);
    return router.createUrlTree(['/login']);
  }
};