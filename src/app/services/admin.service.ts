import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly ADMIN_EMAIL = 'grantmatai@gmail.com';

  constructor(private authService: AuthService) {}

  async isAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await this.authService.getUser();
      return user?.email === this.ADMIN_EMAIL;
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
