import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../services/app-config.service';

/**
 * Redirects a signed-in user who hasn't finished onboarding to /onboarding.
 * While `app_config.onboarding_enabled` is false (the default), this is a
 * no-op — the app behaves exactly as it does today. Applied alongside
 * authGuard on the main protected routes.
 */
export const onboardingRequiredGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const router = inject(Router);

  try {
    const enabled = await appConfigService.isOnboardingEnabled();
    if (!enabled) {
      return true;
    }

    const {
      data: { session },
    } = await authService.getSession();

    if (!session?.user) {
      // authGuard (which runs alongside this one) handles the /login redirect.
      return true;
    }

    const profile = await authService.getUserProfile(session.user.id);
    if (profile && !profile.onboarding_completed_at) {
      return router.createUrlTree(['/onboarding']);
    }

    return true;
  } catch (error) {
    console.error('onboardingRequiredGuard check failed, letting the user through:', error);
    return true;
  }
};

/**
 * Guards the /onboarding route itself: keeps a user out of it (redirecting
 * to /home) if the flow is disabled or they've already completed it, so it
 * can't be re-entered via back button or a guessed/bookmarked URL.
 *
 * A `?preview=1` query param bypasses both checks — this is how the Admin
 * Portal's "Preview Onboarding" button (dev-tools.page.ts) opens the flow
 * on demand for testing, without touching the global flag or the user's
 * own onboarding_completed_at state.
 */
export const onboardingDoneGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const router = inject(Router);

  if (route.queryParamMap.get('preview') === '1') {
    return true;
  }

  try {
    const enabled = await appConfigService.isOnboardingEnabled();
    if (!enabled) {
      return router.createUrlTree(['/home']);
    }

    const {
      data: { session },
    } = await authService.getSession();

    if (!session?.user) {
      return router.createUrlTree(['/login']);
    }

    const profile = await authService.getUserProfile(session.user.id);
    if (profile?.onboarding_completed_at) {
      return router.createUrlTree(['/home']);
    }

    return true;
  } catch (error) {
    console.error('onboardingDoneGuard check failed, sending user home:', error);
    return router.createUrlTree(['/home']);
  }
};
