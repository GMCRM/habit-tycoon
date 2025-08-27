import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonText, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
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

  constructor(private authService: AuthService, private router: Router) {}

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

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
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

  // Test database connectivity
  async testDatabase() {
    console.log('🔧 Testing database connection...');
    try {
      const result = await this.authService.testConnection();
      console.log('Database test result:', result);
      
      if (result.success) {
        alert('✅ Database connection successful!');
      } else {
        alert('❌ Database connection failed: ' + result.message);
        console.error('Database error:', result.error);
      }
    } catch (error) {
      console.error('❌ Database test failed:', error);
      alert('❌ Database test failed: ' + error);
    }
  }

  // Test just auth signup without profile creation
  async testAuthOnly() {
    const email = this.email.trim();
    const password = this.password.trim();
    
    if (!email || !password) {
      alert('Please fill in email and password first');
      return;
    }
    
    console.log('🧪 Testing auth-only signup...');
    try {
      // Direct auth signup without profile creation
      const { data, error } = await this.authService.supabase.auth.signUp({
        email: email,
        password: password
      });
      
      if (error) {
        console.error('❌ Auth signup failed:', error);
        alert('Auth signup failed: ' + error.message);
      } else {
        console.log('✅ Auth signup successful:', data);
        alert('✅ Auth signup successful! User ID: ' + data.user?.id);
      }
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      alert('❌ Auth test failed: ' + error);
    }
  }
}