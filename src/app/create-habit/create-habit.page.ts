import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
  ModalController, ToastController
} from '@ionic/angular/standalone';
import { HabitBusinessService, BusinessType } from '../services/habit-business.service';
import { JointVentureService } from '../services/joint-venture.service';
import { AuthService } from '../services/auth.service';
import { HabitCacheService } from '../services/habit-cache.service';
import { DEFAULT_STARTING_BALANCE } from '../shared/default-profile.util';
import { BusinessIconPipe } from '../shared/pipes/business-icon.pipe';
import { FriendPickerModalComponent } from '../shared/components/friend-picker-modal/friend-picker-modal.component';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { addIcons } from 'ionicons';
import { rocket, checkmarkCircle, document, trophy, lockClosed, warning, peopleCircle, briefcase } from 'ionicons/icons';

type LaunchTab = 'solo' | 'joint';

@Component({
  selector: 'app-create-habit',
  templateUrl: './create-habit.page.html',
  styleUrls: ['./create-habit.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonSpinner,
    BusinessIconPipe, BottomNavComponent
  ]
})
export class CreateHabitPage implements OnInit {
  businessTypes: BusinessType[] = [];
  userProfile: any = null;
  loading = false;
  creating = false;

  activeTab: LaunchTab = 'solo';

  // Net worth / habit cash bar — abbreviated by default, tap to reveal the exact figure.
  showDetailedNetWorth = false;
  showDetailedCash = false;

  selectedBusinessTypeId: number | null = null;
  selectedBusinessType: BusinessType | null = null;
  habitName = '';
  habitDescription = '';
  recurrenceInterval: '24h' | 'specific_days' | 'weekly_count' = '24h';
  activeDays: number[] = [1, 2, 3, 4, 5]; // Mon–Fri default
  goalValue = 1;

  /** Upper bound for goalValue given the current schedule — a 'weekly_count'
   *  goal can never exceed 7 since only one completion per calendar day
   *  counts toward it (see HabitBusinessService.validateGoalValue). */
  get maxGoalValue(): number {
    return this.recurrenceInterval === 'weekly_count' ? 7 : 20;
  }

  readonly scheduleInterfaceOptions = { cssClass: 'schedule-select-popover' };

  // Friends selected for a joint venture. v1 scope restricts a joint venture
  // to a plain daily habit — see joint_venture_habit_shape_check.
  selectedFriendIds: string[] = [];

  readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly dayDows   = [0, 1, 2, 3, 4, 5, 6];

  constructor(
    private habitBusinessService: HabitBusinessService,
    private jointVentureService: JointVentureService,
    private authService: AuthService,
    private habitCacheService: HabitCacheService,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ rocket, checkmarkCircle, document, trophy, lockClosed, warning, peopleCircle, briefcase });
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
          // instead of a hardcoded starting balance (see home.page.ts).
          const cachedProfile = await this.habitCacheService.getProfile();
          this.userProfile = cachedProfile || {
            name: user.user_metadata?.['name'] || 'Entrepreneur',
            cash: DEFAULT_STARTING_BALANCE,
            net_worth: DEFAULT_STARTING_BALANCE
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

  get isJointVenture(): boolean {
    return this.activeTab === 'joint';
  }

  private formatLargeNumber(amount: number): string {
    if (amount >= 1000000000000) {
      const trillions = amount / 1000000000000;
      return trillions >= 10 ? `${Math.floor(trillions)}T` : `${trillions.toFixed(1)}T`;
    } else if (amount >= 1000000000) {
      const billions = amount / 1000000000;
      return billions >= 10 ? `${Math.floor(billions)}B` : `${billions.toFixed(1)}B`;
    } else if (amount >= 1000000) {
      const millions = amount / 1000000;
      return millions >= 10 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return thousands >= 10 ? `${Math.floor(thousands)}K` : `${thousands.toFixed(1)}K`;
    } else {
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getDisplayedCash(): string {
    const cash = this.userProfile?.cash || 0;
    if (cash >= 1000 && !this.showDetailedCash) {
      return this.formatLargeNumber(cash);
    }
    return cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  toggleNetWorthDisplay(): void {
    this.showDetailedNetWorth = !this.showDetailedNetWorth;
  }

  toggleCashDisplay(): void {
    this.showDetailedCash = !this.showDetailedCash;
  }

  selectTab(tab: LaunchTab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;

    if (tab === 'joint') {
      // v1 scope: a joint venture is always a plain daily habit — lock the
      // schedule/completions-per-day inputs rather than hide them, so it's
      // clear why they're fixed.
      this.recurrenceInterval = '24h';
      this.goalValue = 1;
    } else {
      this.selectedFriendIds = [];
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
    // Selecting a tier is always allowed, even if the solo price is out of
    // reach — a Joint Venture split (below) can still make it affordable.
    // Actual affordability is enforced by `canAfford` at launch time.
    this.selectedBusinessTypeId = businessType.id;
    this.selectedBusinessType = businessType;
  }

  /**
   * What this tier would actually cost this player right now: the full
   * price solo, or their split share once on the Joint Venture tab with
   * friends chosen (before that, it's still the full price — a JV needs at
   * least one other owner to split anything).
   */
  shareForType(businessType: BusinessType): number {
    if (!this.isJointVenture || this.jvOwnerCount < 2) return businessType.base_cost;
    const othersShare = Math.round((businessType.base_cost / this.jvOwnerCount) * 100) / 100;
    return Math.round((businessType.base_cost - othersShare * (this.jvOwnerCount - 1)) * 100) / 100;
  }

  canAffordType(businessType: BusinessType): boolean {
    return (this.userProfile?.cash ?? 0) >= this.shareForType(businessType);
  }

  /** Total co-owners once launched: this player + everyone selected in the friend picker. */
  get jvOwnerCount(): number {
    return this.selectedFriendIds.length + 1;
  }

  /**
   * The most expensive business this player's cash can unlock via a Joint
   * Venture split, assuming the cost is shared evenly across the current
   * owner count: cash * owners >= cost  <=>  cost / owners <= cash. This is
   * the number the Investment Package tiles below light up against.
   */
  get jvMaxUnlockedCost(): number {
    return Math.round((this.userProfile?.cash ?? 0) * this.jvOwnerCount * 100) / 100;
  }

  /** Every non-initiating co-owner's share — same rounding rule the server uses. */
  get jvShareOthers(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return Math.round((this.selectedBusinessType.base_cost / this.jvOwnerCount) * 100) / 100;
  }

  /** This player's own share — absorbs the rounding remainder so the total collected equals base_cost exactly. */
  get jvCreatorShare(): number {
    if (!this.selectedBusinessType || this.jvOwnerCount < 2) return 0;
    return this.shareForType(this.selectedBusinessType);
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

  /** Everything except the joint-venture friend selection — gates whether the Summary section is shown at all. */
  get baseFormValid(): boolean {
    const daysValid = this.recurrenceInterval !== 'specific_days' || this.activeDays.length > 0;
    return !!(this.selectedBusinessType &&
              this.habitName.trim() &&
              this.habitDescription.trim() &&
              this.recurrenceInterval &&
              daysValid &&
              this.goalValue > 0 && this.goalValue <= this.maxGoalValue);
  }

  /** Clamps goalValue when switching to a schedule with a lower max (e.g. 'weekly_count' caps at 7). */
  onScheduleChange() {
    if (this.goalValue > this.maxGoalValue) {
      this.goalValue = this.maxGoalValue;
    }
  }

  /** Gates the Launch button — also requires at least one friend chosen once on the Joint Venture tab. */
  get isFormValid(): boolean {
    const jvValid = !this.isJointVenture || this.selectedFriendIds.length >= 1;
    return this.baseFormValid && jvValid;
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
        this.router.navigate(['/home']);
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

      await this.habitBusinessService.createHabitBusiness(request);

      await this.showToast(`🎉 "${this.habitName}" created successfully!`, 'success');

      this.router.navigate(['/home']);

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
