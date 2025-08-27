import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardContent, IonIcon, ToastController, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {

  email = '';
  password = '';

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  // Google OAuth login
  async onGoogleLogin() {
    console.log('🔄 Starting Google OAuth login...');
    try {
      const result = await this.authService.signInWithGoogle();
      
      if (result.error) {
        console.error('❌ Google login failed:', result.error);
        
        // Show error toast instead of blocking alert
        const errorToast = await this.toastController.create({
          message: 'Google login failed: ' + ((result.error as any)?.message || 'Unknown error'),
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await errorToast.present();
        return;
      }

      console.log('✅ Google OAuth initiated successfully');
      // Note: User will be redirected to Google, then back to our app
      
    } catch (error) {
      console.error('❌ Unexpected Google login error:', error);
      
      // Show error toast instead of blocking alert
      const errorToast = await this.toastController.create({
        message: 'Unexpected error during Google login: ' + error,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  async onLogin() {
    try {
      const result = await this.authService.signIn(this.email, this.password);
      console.log('Logged in user:', result);
      
      // Show success toast instead of blocking alert
      const successToast = await this.toastController.create({
        message: '🎉 Login successful! Welcome back!',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await successToast.present();
      
      // Navigate to home page to test database
      this.router.navigate(['/home']);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Show error toast instead of blocking alert
      const errorToast = await this.toastController.create({
        message: '❌ Login failed: ' + error.message,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: 'Enter your email address to receive a password reset link.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email address',
          value: this.email // Pre-fill with current email if entered
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send Reset Link',
          handler: async (data) => {
            if (!data.email || !data.email.trim()) {
              const errorToast = await this.toastController.create({
                message: 'Please enter a valid email address',
                duration: 3000,
                position: 'top',
                color: 'warning'
              });
              await errorToast.present();
              return false; // Keep alert open
            }

            try {
              const result = await this.authService.resetPassword(data.email.trim());
              
              if (result.error) {
                const errorToast = await this.toastController.create({
                  message: 'Failed to send reset email: ' + (result.error as any)?.message || 'Unknown error',
                  duration: 4000,
                  position: 'top',
                  color: 'danger'
                });
                await errorToast.present();
                return false; // Keep alert open
              }

              const successToast = await this.toastController.create({
                message: '✉️ Password reset link sent! Check your email.',
                duration: 5000,
                position: 'top',
                color: 'success'
              });
              await successToast.present();
              return true; // Close alert
              
            } catch (error: any) {
              console.error('Password reset failed:', error);
              const errorToast = await this.toastController.create({
                message: 'Failed to send reset email: ' + error.message,
                duration: 4000,
                position: 'top',
                color: 'danger'
              });
              await errorToast.present();
              return false; // Keep alert open
            }
          }
        }
      ]
    });

    await alert.present();
  }

}