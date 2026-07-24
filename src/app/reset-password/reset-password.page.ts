import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, 
  IonButton, IonItem, IonLabel, IonInput, ToastController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonButton, IonItem, IonLabel, IonInput, CommonModule, FormsModule, RouterLink]
})
export class ResetPasswordPage implements OnInit {

  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  // Gate the form on an explicitly-established recovery session rather than
  // trusting Supabase's URL auto-detection (disabled app-wide — see
  // SupabaseService's `detectSessionInUrl: false`).
  sessionReady = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    // The Angular Router uses HashLocationStrategy, so a recovery link's
    // `?code=...` query param (PKCE, the flow this app's Supabase client is
    // configured for) is parsed by Angular as a query param on this route,
    // not as a bare URL query string. Older/implicit-flow recovery links
    // instead carry `access_token`/`refresh_token` in the fragment after the
    // route path. Handle both explicitly since detectSessionInUrl is off.
    const queryParams = await firstValueFrom(this.route.queryParams);
    const code = queryParams['code'];

    if (code) {
      const { error } = await this.authService.supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Recovery code exchange failed:', error.message);
        await this.showErrorAndRedirect('Invalid or expired reset link');
        return;
      }
      this.sessionReady = true;
      return;
    }

    const fragment = await firstValueFrom(this.route.fragment);
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        const { error } = await this.authService.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('Recovery setSession failed:', error.message);
          await this.showErrorAndRedirect('Invalid or expired reset link');
          return;
        }
        this.sessionReady = true;
        return;
      }
    }

    await this.showErrorAndRedirect('Invalid or expired reset link');
  }

  async onResetPassword() {
    if (!this.sessionReady) {
      const errorToast = await this.toastController.create({
        message: 'Reset link not verified yet — please use the link from your email again',
        duration: 4000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      const errorToast = await this.toastController.create({
        message: 'Passwords do not match',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
      return;
    }

    if (this.newPassword.length < 8) {
      const errorToast = await this.toastController.create({
        message: 'Password must be at least 8 characters long',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
      return;
    }

    if (!/[A-Za-z]/.test(this.newPassword) || !/[0-9]/.test(this.newPassword)) {
      const errorToast = await this.toastController.create({
        message: 'Password must contain at least one letter and one number',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.updatePassword(this.newPassword);

      if (result.error) {
        const errorToast = await this.toastController.create({
          message: 'Failed to update password: ' + (result.error as any)?.message || 'Unknown error',
          duration: 4000,
          position: 'top',
          color: 'danger'
        });
        await errorToast.present();
        return;
      }

      const successToast = await this.toastController.create({
        message: '✅ Password updated successfully! Please log in with your new password.',
        duration: 5000,
        position: 'top',
        color: 'success'
      });
      await successToast.present();

      // Redirect to login page after successful password update
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Password update failed:', error);
      const errorToast = await this.toastController.create({
        message: 'Failed to update password: ' + error.message,
        duration: 4000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    } finally {
      this.isLoading = false;
    }
  }

  private async showErrorAndRedirect(message: string) {
    const errorToast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await errorToast.present();

    // Redirect to login after a short delay
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }
}
