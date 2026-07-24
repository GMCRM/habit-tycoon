import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonText, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonText, IonCard, IonCardContent, IonIcon, CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage {
  email: string = '';
  displayName: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ logoGoogle });
  }

  // Google OAuth signup
  async onGoogleSignUp() {
    console.log('🔄 Starting Google OAuth signup...');
    try {
      const result = await this.authService.signUpWithGoogle();
      
      if (result.error) {
        console.error('❌ Google signup failed:', result.error);
        alert('Google signup failed: ' + (result.error as any)?.message || 'Unknown error');
        return;
      }

      console.log('✅ Google OAuth initiated successfully');
      // Note: User will be redirected to Google, then back to our app
      
    } catch (error) {
      console.error('❌ Unexpected Google signup error:', error);
      alert('Unexpected error during Google signup: ' + error);
    }
  }

  async onSignUp() {
    const email = this.email.trim();
    const password = this.password.trim();
    const displayName = this.displayName.trim();

    if (!email || !password) {
      alert('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      alert('Password must contain at least one letter and one number');
      return;
    }

    console.log('🔄 Starting sign-up process...');
    console.log('Email:', email);
    console.log('Display name:', displayName);

    try {
      const result = await this.authService.signUp(email, password, displayName);
      
      if (result.error) {
        console.error('❌ Sign-up failed:', result.error);
        
        // Show detailed error message
        let errorMessage = 'Sign-up failed: ';
        if (result.error.message) {
          errorMessage += result.error.message;
        } else {
          errorMessage += 'Unknown error occurred';
        }
        
        // Add more details if available
        if (result.error.details) {
          console.error('Error details:', result.error.details);
        }
        
        alert(errorMessage);
        return;
      }

      console.log('✅ Sign-up successful:', result.data);

      // Check if user needs email confirmation
      if (result.data?.user && !result.data.user.email_confirmed_at) {
        alert('Sign-up successful! Please check your email to confirm your account before logging in.');
      } else {
        alert('Sign-up successful! You can now log in.');
      }

      // Navigate to login page
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('❌ Unexpected sign-up error:', error);
      alert('Unexpected error during sign-up: ' + error);
    }
  }
}