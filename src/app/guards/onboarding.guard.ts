import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { AdminService } from '../services/admin.service';

// Admins can dogfood the flow on their own account (see admin_users /
// is_admin()) while `app_config.onboarding_enabled` stays false for
// everyone else — lets it be verified end-to-end before the global flip.
async function isActiveForCurrentUser(appConfigService: AppConfigService, adminService: AdminService): Promise<boolean> {
  const [enabled, isAdmin] = await Promise.all([
    appConfigService.isOnboardingEnabled(),
    adminService.isAdmin(),
  ]);
  return enabled || isAdmin;
}

/**
 * Redirects a signed-in user who hasn't finished onboarding to /onboarding.
 * While `app_config.onboarding_enabled` is false (the default) and the user
 * isn't an admin, this is a no-op — the app behaves exactly as it does
 * today. Applied alongside authGuard on the main protected routes.
 */
export const onboardingRequiredGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const adminService = inject(AdminService);
  const router = inject(Router);

  try {
    const active = await isActiveForCurrentUser(appConfigService, adminService);
    if (!active) {
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
 */
export const onboardingDoneGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const adminService = inject(AdminService);
  const router = inject(Router);

  try {
    const active = await isActiveForCurrentUser(appConfigService, adminService);
    if (!active) {
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
