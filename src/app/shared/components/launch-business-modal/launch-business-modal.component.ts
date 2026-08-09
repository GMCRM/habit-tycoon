import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner, IonToggle
} from '@ionic/angular/standalone';
import { HabitBusinessService, BusinessType } from '../../../services/habit-business.service';
import { JointVentureService } from '../../../services/joint-venture.service';
import { AuthService } from '../../../services/auth.service';
import { HabitCacheService } from '../../../services/habit-cache.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { FriendPickerModalComponent } from '../friend-picker-modal/friend-picker-modal.component';
import { addIcons } from 'ionicons';
import { rocket, close, checkmarkCircle, document, trophy, lockClosed, warning, peopleCircle } from 'ionicons/icons';

@Component({
  selector: 'app-launch-business-modal',
  templateUrl: './launch-business-modal.component.html',
  styleUrls: ['./launch-business-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner, IonToggle,
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
  Math = Math;

  selectedBusinessTypeId: number | null = null;
  selectedBusinessType: BusinessType | null = null;
  habitName = '';
  habitDescription = '';
  recurrenceInterval: '24h' | 'specific_days' = '24h';
  activeDays: number[] = [1, 2, 3, 4, 5]; // Mon–Fri default
  goalValue = 1;

  // Joint venture: friends who want to share the exact same habit split the
  // cost evenly and all co-own a single business. v1 scope restricts a
  // joint venture to a plain daily habit — see joint_venture_habit_shape_check.
  isJointVenture = false;
  selectedFriendIds: string[] = [];

  readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly dayDows   = [0, 1, 2, 3, 4, 5, 6];

  constructor(
    private habitBusinessService: HabitBusinessService,
    private jointVentureService: JointVentureService,
    private authService: AuthService,
    private habitCacheService: HabitCacheService
  ) {
    addIcons({ rocket, close, checkmarkCircle, document, trophy, lockClosed, warning, peopleCircle });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      this.businessTypes = await this.habitBusinessService.getBusinessTypes();

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
    if (this.userProfile?.cash >= businessType.base_cost) {
      this.selectedBusinessTypeId = businessType.id;
      this.selectedBusinessType = businessType;
    }
  }

  /** Total co-owners once launched: this player + everyone selected in the friend picker. */
  get jvOwnerCount(): number {
    return this.selectedFriendIds.length + 1;
  }

  /** Every non-initiating co-owner's share — same rounding rule the server uses. */
  get jvShareOthers(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return Math.round((this.selectedBusinessType.base_cost / this.jvOwnerCount) * 100) / 100;
  }

  /** This player's own share — absorbs the rounding remainder so the total collected equals base_cost exactly. */
  get jvCreatorShare(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return Math.round((this.selectedBusinessType.base_cost - this.jvShareOthers * (this.jvOwnerCount - 1)) * 100) / 100;
  }

  /** Per-completion earnings each co-owner gets — base_pay split across owners, rounded up to the cent, same as the server. */
  get jvBasePayShare(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return Math.ceil((this.selectedBusinessType.base_pay / this.jvOwnerCount) * 100) / 100;
  }

  /** Group streak-bonus cap as a percentage, added on top of the always-paid base share — scales with owner count instead of a flat 200%. */
  get jvMaxStreakMultiplierPercent(): number {
    if (this.jvOwnerCount < 2) return 0;
    return this.jvOwnerCount * 20 + 200;
  }

  /** Each co-owner's max possible payout per completion once the group streak is maxed: base share + the bonus on top of it. */
  get jvMaxPayPerOwner(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return Math.ceil(this.jvBasePayShare * (1 + this.jvMaxStreakMultiplierPercent / 100) * 100) / 100;
  }

  onJointVentureToggle(checked: boolean) {
    this.isJointVenture = checked;
    if (checked) {
      // v1 scope: a joint venture is always a plain daily habit — lock the
      // schedule/completions-per-day inputs rather than hide them, so it's
      // clear why they're fixed.
      this.recurrenceInterval = '24h';
      this.goalValue = 1;
    } else {
      this.selectedFriendIds = [];
    }
  }

  async openFriendPicker() {
    const modal = await this.modalController.create({
      component: FriendPickerModalComponent,
      componentProps: {
        modalController: this.modalController,
        initialSelectedFriendIds: this.selectedFriendIds
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.selectedFriendIds) {
      this.selectedFriendIds = data.selectedFriendIds;
    }
  }

  get canAfford(): boolean {
    if (!this.userProfile || !this.selectedBusinessType) return false;
    if (this.isJointVenture) {
      return this.selectedFriendIds.length === 0 || this.userProfile.cash >= this.jvCreatorShare;
    }
    return this.userProfile.cash >= this.selectedBusinessType.base_cost;
  }

  /** Everything except the joint-venture friend selection — gates whether the Summary section (and its Joint Venture toggle) is shown at all. */
  get baseFormValid(): boolean {
    const daysValid = this.recurrenceInterval !== 'specific_days' || this.activeDays.length > 0;
    return !!(this.selectedBusinessType &&
              this.habitName.trim() &&
              this.habitDescription.trim() &&
              this.recurrenceInterval &&
              daysValid &&
              this.goalValue > 0 && this.goalValue <= 20);
  }

  /** Gates the Launch button — also requires at least one friend chosen once Joint Venture is toggled on. */
  get isFormValid(): boolean {
    const jvValid = !this.isJointVenture || this.selectedFriendIds.length >= 1;
    return this.baseFormValid && jvValid;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async createHabitBusiness() {
    if (!this.isFormValid) {
      if (this.isJointVenture && this.selectedFriendIds.length === 0) {
        await this.showToast('Choose at least one friend to co-found this business with', 'warning');
      } else {
        await this.showToast('Please fill in all fields', 'warning');
      }
      return;
    }

    if (!this.canAfford) {
      const needed = this.isJointVenture ? this.jvCreatorShare : this.selectedBusinessType?.base_cost;
      await this.showToast(`Insufficient funds. You need $${needed} but only have $${this.userProfile?.cash}`, 'danger');
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

      if (this.isJointVenture) {
        const { data: { user } } = await this.authService.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const result = await this.jointVentureService.createProposal(
          user.id,
          this.selectedBusinessType!.id,
          this.habitName.trim(),
          this.habitDescription.trim(),
          this.selectedFriendIds
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to create joint venture proposal');
        }

        await this.showToast(`🤝 Invites sent! "${this.habitName}" goes live once everyone accepts and pays their share.`, 'success');
        this.modalController.dismiss({ created: false, jointVentureProposed: true });
        return;
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
