import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const { data: { user } } = await authService.getUser();
    
    // Check if user is the admin (your email)
    const ADMIN_EMAIL = 'grantmatai@gmail.com';
    
    if (user && user.email === ADMIN_EMAIL) {
      console.log('✅ Admin access granted for:', user.email);
      return true;
    }
    
    console.log('❌ Admin access denied for:', user?.email || 'no user');
    // Redirect non-admin users to home
    router.navigate(['/home']);
    return false;
  } catch (error) {
    console.error('❌ Admin guard error:', error);
    router.navigate(['/home']);
    return false;
  }
};
