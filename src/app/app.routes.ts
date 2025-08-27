import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
    path: 'dev-tools',
    loadComponent: () => import('./dev-tools/dev-tools.page').then((m) => m.DevToolsPage),
  },
  {
    path: 'create-habit-business',
    loadComponent: () => import('./create-habit-business/create-habit-business.page').then( m => m.CreateHabitBusinessPage)
  },
  {
    path: 'social',
    loadComponent: () => import('./social/social.page').then( m => m.SocialPage)
  },
  {
    path: 'stocks',
    loadComponent: () => import('./stocks/stocks.page').then( m => m.StocksPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];
