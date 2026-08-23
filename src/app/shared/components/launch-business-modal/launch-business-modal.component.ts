import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner
} from '@ionic/angular/standalone';
import { HabitBusinessService, BusinessType } from '../../../services/habit-business.service';
import { AuthService } from '../../../services/auth.service';
import { HabitCacheService } from '../../../services/habit-cache.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { formatLargeNumber } from '../../currency-format.util';
import { addIcons } from 'ionicons';
import { rocket, close, checkmarkCircle, document, trophy, lockClosed, warning } from 'ionicons/icons';

@Component({
  selector: 'app-launch-business-modal',
  templateUrl: './launch-business-modal.component.html',
  styleUrls: ['./launch-business-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
    BusinessIconPipe
  ]
})
export class LaunchBusinessModalComponent implements OnInit {
  @Input() modalController: any;
  @Input() toastController: any;

  businessTypes: BusinessType[] = [];
  userProfile: any = null;
  loading = false;
  creating = false;

  selectedBusinessTypeId: number | null = null;
  selectedBusinessType: BusinessType | null = null;
  habitName = '';
  habitDescription = '';
  recurrenceInterval: '24h' | 'specific_days' = '24h';
  activeDays: number[] = [1, 2, 3, 4, 5]; // Mon–Fri default
  goalValue = 1;

  readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly dayDows   = [0, 1, 2, 3, 4, 5, 6];

  readonly scheduleInterfaceOptions = { cssClass: 'schedule-select-popover' };

  constructor(
    private habitBusinessService: HabitBusinessService,
    private authService: AuthService,
    private habitCacheService: HabitCacheService
  ) {
    addIcons({ rocket, close, checkmarkCircle, document, trophy, lockClosed, warning });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      // Habit Tycoon (tier 2) businesses can only be reached by upgrading an
      // existing, milestone-complete habit — never offered as a first business.
      this.businessTypes = (await this.habitBusinessService.getBusinessTypes()).filter(bt => bt.tier !== 2);

      const { data: { user } } = await this.authService.getUser();
      if (user) {
        try {
          this.userProfile = await this.authService.ensureUserProfileExists(user);
        } catch (profileError) {
          console.error('Error ensuring profile exists:', profileError);
          await this.showToast('Cannot connect to user profile. Please check your connection.', 'danger');
          // Most likely offline — fall back to the last synced profile snapshot
          // instead of a hardcoded $100 starting balance (see home.page.ts).
          const cachedProfile = await this.habitCacheService.getProfile();
          this.userProfile = cachedProfile || {
            name: user.user_metadata?.['name'] || 'Entrepreneur',
            cash: 100.00,
            net_worth: 100.00
          };
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      await this.showToast('Failed to load data. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  toggleDay(dow: number) {
    const idx = this.activeDays.indexOf(dow);
    if (idx >= 0) {
      this.activeDays = this.activeDays.filter(d => d !== dow);
    } else {
      this.activeDays = [...this.activeDays, dow].sort((a, b) => a - b);
    }
  }

  isDayActive(dow: number): boolean {
    return this.activeDays.includes(dow);
  }

  selectRewardLevel(businessType: BusinessType) {
    if (!this.canAffordType(businessType)) return;
    this.selectedBusinessTypeId = businessType.id;
    this.selectedBusinessType = businessType;
  }

  canAffordType(businessType: BusinessType): boolean {
    return (this.userProfile?.cash ?? 0) >= businessType.base_cost;
  }

  /** A player's cash can run well into the billions+ once Habit Tycoon businesses are in play — abbreviate past that point. */
  formatMoney(amount: number): string {
    return Math.abs(amount) >= 1e9
      ? formatLargeNumber(amount)
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  get canAfford(): boolean {
    if (!this.userProfile || !this.selectedBusinessType) return false;
    return this.userProfile.cash >= this.selectedBusinessType.base_cost;
  }

  /** Gates whether the Summary section is shown, and the Launch button. */
  get baseFormValid(): boolean {
    const daysValid = this.recurrenceInterval !== 'specific_days' || this.activeDays.length > 0;
    return !!(this.selectedBusinessType &&
              this.habitName.trim() &&
              this.habitDescription.trim() &&
              this.recurrenceInterval &&
              daysValid &&
              this.goalValue > 0 && this.goalValue <= 20);
  }

  get isFormValid(): boolean {
    return this.baseFormValid;
  }

  dismiss() {
    this.modalController.dismiss();
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

    await this.performCreate();
  }

  async performCreate() {
    this.creating = true;
    try {
      if (!this.userProfile) {
        throw new Error('User profile not loaded. Please refresh the page and try again.');
      }

      const request = {
        business_type_id: this.selectedBusinessType!.id,
        business_name: this.habitName.trim(),
        habit_description: this.habitDescription.trim(),
        recurrence_interval: this.recurrenceInterval,
        goal_value: this.goalValue,
        active_days: this.recurrenceInterval === 'specific_days' ? this.activeDays : undefined
      };

      const result = await this.habitBusinessService.createHabitBusiness(request);

      await this.showToast(`🎉 "${this.habitName}" created successfully!`, 'success');

      this.modalController.dismiss({ created: true, habitBusiness: result });

    } catch (error: any) {
      console.error('Error creating habit-business:', error);

      let message = 'Unknown error occurred';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (error && typeof error === 'object') {
        if (error.message) {
          message = error.message;
        } else if (error.error_description) {
          message = error.error_description;
        } else if (error.details) {
          message = error.details;
        }
      }

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

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
