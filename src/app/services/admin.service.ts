import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private authService: AuthService) {}

  // Authorization is enforced server-side via the `is_admin()` SECURITY
  // DEFINER function (checks membership in the RLS-protected `admin_users`
  // table keyed on auth.uid()), not by comparing the client's email string.
  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await this.authService.supabase.rpc('is_admin');
      if (error) {
        console.error('Error checking admin status:', error.message);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async getCurrentUserEmail(): Promise<string | null> {
    try {
      const { data: { user } } = await this.authService.getUser();
      return user?.email || null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }
}
