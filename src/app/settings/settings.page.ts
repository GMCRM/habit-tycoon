import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonModal,
  IonTextarea
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { addIcons } from 'ionicons';
import { save, person, lockClosed, logoGoogle, trash, warning } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonToast,
    IonModal,
    IonTextarea,
    BottomNavComponent
  ]
})
export class SettingsPage implements OnInit {
  // User profile data
  username: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // Loading states
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  isDeletingProfile = false;
  
  // Toast messages
  showToast = false;
  toastMessage = '';
  toastColor = 'success';
  
  // Confirmation states
  showDeleteConfirmation = false;
  deleteConfirmationText = '';
  
  currentUser: any = null;
  isGoogleUser = false; // New property to track if user signed in with Google

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({person,save,lockClosed,logoGoogle,trash,warning});
  }

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    try {
      const { data: user } = await this.authService.getUser();
      if (user?.user) {
        this.currentUser = user.user;
        
        // Check if user signed in with Google OAuth
        // Supabase stores the provider information in user.app_metadata
        this.isGoogleUser = user.user.app_metadata?.provider === 'google';
        
        console.log('User auth provider:', user.user.app_metadata?.provider);
        console.log('Is Google user:', this.isGoogleUser);
        
        const profile = await this.authService.getUserProfile(user.user.id);
        if (profile) {
          this.username = profile.name || '';
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async updateProfile() {
    if (!this.currentUser || !this.username.trim()) {
      this.showToastMessage('Please enter a valid username', 'danger');
      return;
    }

    this.isUpdatingProfile = true;
    try {
      await this.authService.updateUserProfile(this.currentUser.id, {
        name: this.username.trim()
      });
      this.showToastMessage('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showToastMessage('Failed to update profile', 'danger');
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  async updatePassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showToastMessage('Please fill in all password fields', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToastMessage('New passwords do not match', 'danger');
      return;
    }

    if (this.newPassword.length < 6) {
      this.showToastMessage('Password must be at least 6 characters', 'danger');
      return;
    }

    this.isUpdatingPassword = true;
    try {
      await this.authService.updatePassword(this.newPassword);
      this.showToastMessage('Password updated successfully!', 'success');
      // Clear password fields
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error: any) {
      console.error('Error updating password:', error);
      this.showToastMessage(error.message || 'Failed to update password', 'danger');
    } finally {
      this.isUpdatingPassword = false;
    }
  }

  showToastMessage(message: string, color: string) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  showDeleteProfileConfirmation() {
    this.showDeleteConfirmation = true;
  }

  cancelDeleteProfile() {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationText = '';
  }

  async confirmDeleteProfile() {
    if (this.deleteConfirmationText.toLowerCase() !== 'delete') {
      this.showToastMessage('Please type "DELETE" to confirm', 'danger');
      return;
    }

    if (!this.currentUser) {
      this.showToastMessage('No user found to delete', 'danger');
      return;
    }

    this.isDeletingProfile = true;
    
    try {
      // First delete the user profile data
      await this.authService.deleteUserProfile(this.currentUser.id);
      
      // Then delete the auth user account
      const { error } = await this.authService.deleteAuthUser();
      
      if (error) {
        throw error;
      }

      this.showToastMessage('Profile deleted successfully', 'success');
      
      // Wait a moment for the toast to show, then navigate to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      this.showToastMessage(error.message || 'Failed to delete profile', 'danger');
    } finally {
      this.isDeletingProfile = false;
      this.showDeleteConfirmation = false;
      this.deleteConfirmationText = '';
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
