import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { onboardingRequiredGuard, onboardingDoneGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then((m) => m.OnboardingPage),
    canActivate: [authGuard, onboardingDoneGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard, onboardingRequiredGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'admin',
    loadComponent: () => import('./dev-tools/dev-tools.page').then((m) => m.DevToolsPage),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'social',
    loadComponent: () => import('./social/social.page').then( m => m.SocialPage),
    canActivate: [authGuard, onboardingRequiredGuard],
  },
  {
    path: 'stocks',
    loadComponent: () => import('./stocks/stocks.page').then( m => m.StocksPage),
    canActivate: [authGuard, onboardingRequiredGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then( m => m.ResetPasswordPage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage),
    canActivate: [authGuard, onboardingRequiredGuard],
  },
  {
    path: 'weekly-receipt',
    loadComponent: () => import('./weekly-receipt/weekly-receipt.page').then( m => m.WeeklyReceiptPage),
    canActivate: [authGuard, onboardingRequiredGuard],
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
