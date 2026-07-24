import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

// Route-level gate only. The authoritative check is the server-side
// `is_admin()` function AdminService calls — this guard just keeps
// non-admins off the /admin route in the UI.
export const adminGuard = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  try {
    if (await adminService.isAdmin()) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  } catch (error) {
    console.error('Admin guard error:', error);
    router.navigate(['/home']);
    return false;
  }
};
