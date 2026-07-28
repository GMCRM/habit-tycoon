import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { HabitBusinessService } from '../services/habit-business.service';

/**
 * A user is eligible for the first-run onboarding flow only if they haven't
 * completed it *and* have never created a habit. The habit-count check
 * matters because `onboarding_completed_at` is unset for every account
 * created while the flow was dormant — without it, enabling the flag would
 * send existing users with established habits back through onboarding.
 */
async function isEligibleForOnboarding(authService: AuthService, habitService: HabitBusinessService, userId: string): Promise<boolean> {
  const profile = await authService.getUserProfile(userId);
  if (profile?.onboarding_completed_at) {
    return false;
  }
  const habitCount = await habitService.getUserHabitCount(userId);
  return habitCount === 0;
}

/**
 * Redirects a signed-in, first-time user (no completed onboarding, no
 * habits yet) to /onboarding. While `app_config.onboarding_enabled` is
 * false, this is a no-op. Applied alongside authGuard on the main
 * protected routes.
 */
export const onboardingRequiredGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const habitService = inject(HabitBusinessService);
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

    if (await isEligibleForOnboarding(authService, habitService, session.user.id)) {
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
 * to /home) if the flow is disabled or they're not a first-time user
 * (already completed it, or already has habits), so it can't be re-entered
 * via back button or a guessed/bookmarked URL.
 *
 * A `?preview=1` query param bypasses both checks — this is how the Admin
 * Portal's "Preview Onboarding" button (dev-tools.page.ts) opens the flow
 * on demand for testing, without touching the global flag or the user's
 * own onboarding_completed_at/habit state.
 */
export const onboardingDoneGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const appConfigService = inject(AppConfigService);
  const habitService = inject(HabitBusinessService);
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

    if (!(await isEligibleForOnboarding(authService, habitService, session.user.id))) {
      return router.createUrlTree(['/home']);
    }

    return true;
  } catch (error) {
    console.error('onboardingDoneGuard check failed, sending user home:', error);
    return router.createUrlTree(['/home']);
  }
};
