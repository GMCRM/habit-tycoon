import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonTextarea,
  IonNote,
  IonSpinner,
  IonBackButton,
  IonButtons,
  AlertController,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { HabitBusinessService, BusinessType } from '../services/habit-business.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { add, cash, calendar, business, checkmarkCircle, alertCircle, trophy, rocket, lockClosed, document, arrowBack, warning } from 'ionicons/icons';

@Component({
  selector: 'app-create-habit-business',
  templateUrl: './create-habit-business.page.html',
  styleUrls: ['./create-habit-business.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonTextarea,
    IonNote,
    IonSpinner,
    IonBackButton,
    IonButtons
  ]
})
export class CreateHabitBusinessPage implements OnInit {
  businessTypes: BusinessType[] = [];
  userProfile: any = null;
  loading = false;
  creating = false;
  Math = Math; // Make Math available in template

  // Form data
  selectedBusinessTypeId: number | null = null;
  selectedBusinessType: BusinessType | null = null;
  habitName = '';
  habitDescription = '';
  frequency: 'daily' | 'weekly' = 'daily';
  goalValue = 1;

  constructor(
    private habitBusinessService: HabitBusinessService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
        addIcons({arrowBack,checkmarkCircle,document,trophy,rocket,warning,cash,business,add,calendar,alertCircle,lockClosed});
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      // Load business types first
      this.businessTypes = await this.habitBusinessService.getBusinessTypes();
      console.log('Loaded business types:', this.businessTypes);

      // Load user profile with better error handling
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        console.log('User found, ensuring profile exists for:', user.id);
        try {
          this.userProfile = await this.authService.ensureUserProfileExists(user);
          console.log('User profile ensured:', this.userProfile);
        } catch (profileError) {
          console.error('Error ensuring profile exists:', profileError);
          await this.showToast('Cannot connect to user profile. Please check your connection.', 'danger');
          
          // Use temporary default to allow form to work
          this.userProfile = {
            name: user.user_metadata?.['name'] || 'Entrepreneur',
            cash: 100.00,
            net_worth: 100.00
          };
        }
      } else {
        console.log('No user found, redirecting...');
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      await this.showToast('Failed to load data. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  onBusinessTypeChange(event: any) {
    const selectedId = event.detail.value;
    this.selectedBusinessTypeId = selectedId;
    this.selectedBusinessType = this.businessTypes.find(bt => bt.id === selectedId) || null;
    console.log('Selected business type:', this.selectedBusinessType);
  }

  selectRewardLevel(businessType: BusinessType) {
    if (this.userProfile?.cash >= businessType.base_cost) {
      this.selectedBusinessTypeId = businessType.id;
      this.selectedBusinessType = businessType;
      console.log('Selected reward level:', businessType);
    }
  }

  get canAfford(): boolean {
    return this.userProfile && this.selectedBusinessType && 
           this.userProfile.cash >= this.selectedBusinessType.base_cost;
  }

  get isFormValid(): boolean {
    return !!(this.selectedBusinessType && 
              this.habitName.trim() &&
              this.habitDescription.trim() && 
              this.frequency &&
              this.goalValue > 0 && this.goalValue <= 99);
  }

  async createHabitBusiness() {
    if (!this.isFormValid) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (!this.canAfford) {
      await this.showToast(`Insufficient funds. You need $${this.selectedBusinessType?.base_cost} but only have $${this.userProfile?.cash}`, 'danger');
      return;
    }

    // Direct creation without confirmation
    this.performCreate();
  }

  async performCreate() {
    this.creating = true;
    try {
      // Ensure user profile is available
      if (!this.userProfile) {
        throw new Error('User profile not loaded. Please refresh the page and try again.');
      }

      const request = {
        business_type_id: this.selectedBusinessType!.id,
        business_name: this.habitName.trim(),
        habit_description: this.habitDescription.trim(),
        frequency: this.frequency,
        goal_value: this.goalValue
      };

      console.log('Creating habit-business:', request);
      const result = await this.habitBusinessService.createHabitBusiness(request);
      console.log('Created habit-business:', result);

      await this.showToast(`🎉 "${this.habitName}" created successfully!`, 'success');
      
      // Navigate back to home
      this.router.navigate(['/home']);
      
    } catch (error: any) {
      console.error('Error creating habit-business:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      
      let message = 'Unknown error occurred';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        // Handle Supabase errors
        if (error.message) {
          message = error.message;
        } else if (error.error_description) {
          message = error.error_description;
        } else if (error.details) {
          message = error.details;
        }
      }
      
      console.log('Final error message:', message);
      
      // Handle specific error types
      if (message.includes('Could not load user profile') || message.includes('User not authenticated')) {
        await this.showToast('Cannot connect to user profile. Please check your connection and try again.', 'danger');
      } else if (message.includes('Insufficient funds')) {
        await this.showToast(message, 'warning');
      } else if (message.includes('Invalid business type')) {
        await this.showToast('Invalid business type selected. Please refresh and try again.', 'danger');
      } else {
        await this.showToast(`Failed to create habit business: ${message}`, 'danger');
      }
    } finally {
      this.creating = false;
    }
  }

  async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  getBusinessTypeIcon(businessType: BusinessType): string {
    return businessType.icon || '🏢';
  }
}
