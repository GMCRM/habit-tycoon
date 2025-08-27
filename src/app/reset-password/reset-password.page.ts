import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Check if we have access token and type from the URL
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        console.log('🔄 URL fragment received:', fragment);
        
        // Parse the fragment to extract access_token and refresh_token
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('✅ Valid password recovery session detected');
          // Session is automatically handled by Supabase
        } else {
          console.warn('⚠️ Invalid or missing recovery parameters');
          this.showErrorAndRedirect('Invalid or expired reset link');
        }
      } else {
        console.warn('⚠️ No URL fragment found');
        this.showErrorAndRedirect('Invalid reset link');
      }
    });
  }

  async onResetPassword() {
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

    if (this.newPassword.length < 6) {
      const errorToast = await this.toastController.create({
        message: 'Password must be at least 6 characters long',
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
