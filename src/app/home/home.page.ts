import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, 
  IonList, IonItem, IonLabel, IonBadge, IonInput, ToastController, AlertController, ModalController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { OfflineQueuedError, OfflineQueueService } from '../services/offline-queue.service';
import { HabitUpdateService } from '../services/habit-update.service';
import { HabitIntervalService } from '../services/habit-interval.service';
import { CountdownTickService } from '../services/countdown-tick.service';
import { UpgradeModalComponent } from './upgrade-modal/upgrade-modal.component';
import { EditHabitModalComponent } from './edit-habit-modal/edit-habit-modal.component';
import { StockOwnersModalComponent } from '../shared/components/stock-owners-modal/stock-owners-modal.component';
import { LaunchBusinessModalComponent } from '../shared/components/launch-business-modal/launch-business-modal.component';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { HabitGridComponent } from '../shared/components/habit-grid/habit-grid.component';
import { StockChartComponent } from '../shared/components/stock-chart/stock-chart.component';
import { BusinessIconPipe } from '../shared/pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, trendingUpOutline, chevronUp, chevronDown, wallet, cash, logoUsd, arrowBack, settings, helpCircle, close, analytics, shield, people, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonInput, CommonModule, FormsModule, RouterLink, BottomNavComponent, HabitGridComponent, StockChartComponent, BusinessIconPipe],
})
export class HomePage implements OnInit, OnDestroy {
  currentUser: any = null;
  userProfile: any = null;
  hasCheckedAuth = false;
  isLoading = false; // Make public for template access
  isAdmin = false; // Track if current user is admin
  
  // Dashboard data
  todaysEarnings = 0;
  todaysStockEarnings = 0;
  pendingHabitsCount = 0;
  habitBusinesses: HabitBusiness[] = [];
  todaysHabits: any[] = [];
  
  // Habit grid data
  primaryHabitBusiness: HabitBusiness | null = null;
  additionalHabitBusinesses: HabitBusiness[] = [];
  
  // Random motivational taglines
  motivationalTaglines = [
    "Time to turn habits into profit!",
    "Your habits are your business!",
    "Build better habits, build bigger profits!",
    "Every habit completed is money earned!",
    "Productive habits = profitable business!",
    "Turn your routine into revenue!",
    "From habits to riches!",
    "Consistency is currency!",
    "Daily grind, daily gold!",
    "Habits today, wealth tomorrow!",
    "Make your habits work for you!",
    "Success is just habits in disguise!"
  ];
  currentTagline = "";

  // Countdown timer state
  countdowns: Record<string, string> = {};
  private tickSub?: Subscription;

  // Actions queued while offline, waiting to sync (see OfflineQueueService)
  pendingSyncCount = 0;
  private pendingSyncSub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private habitBusinessService: HabitBusinessService,
    private habitUpdateService: HabitUpdateService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private habitIntervalService: HabitIntervalService,
    private countdownTickService: CountdownTickService,
    private offlineQueueService: OfflineQueueService
  ) {
    addIcons({ checkmarkCircle, alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, trendingUpOutline, chevronUp, chevronDown, wallet, cash, logoUsd, arrowBack, settings, helpCircle, close, analytics, shield, people, informationCircleOutline });
    this.setRandomTagline();
  }

  /**
   * Set a daily motivational tagline based on the current date
   * This ensures the same tagline shows all day until midnight
   */
  setRandomTagline() {
    // Use today's date as a seed for consistent daily taglines
    const today = new Date();
    const dateString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    // Create a simple hash from the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get array index
    const index = Math.abs(hash) % this.motivationalTaglines.length;
    this.currentTagline = this.motivationalTaglines[index];
    
    console.log(`🎯 Today's motivation (${dateString}):`, this.currentTagline);
  }

  // Refresh data whenever the page is entered
  ionViewWillEnter() {
    console.log('🔄 HomePage: ionViewWillEnter - refreshing data...');
    
    // Set a new random tagline each time the page is entered
    this.setRandomTagline();
    
    if (!this.isLoading) {
      console.log('🔄 Verifying auth state before loading home data...');
      this.loadCurrentUser();
    }
  }

  /**
   * Refresh user profile data without reloading everything
   */
  async refreshUserProfile() {
    if (!this.currentUser) return;
    
    try {
      console.log('🔄 Refreshing user profile for ID:', this.currentUser.id);
      this.userProfile = await this.authService.getUserProfile(this.currentUser.id);
      console.log('✅ Refreshed user profile:', this.userProfile);
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  }

  async loadCurrentUser() {
    if (this.isLoading) {
      console.log('🔄 Already loading user, skipping...');
      return;
    }
    
    this.isLoading = true;
    try {
      const { data: { user } } = await this.authService.getUser();
      console.log('Current user from auth:', user);
      this.currentUser = user;

      if (!user) {
        console.log('❌ No authenticated user found, redirecting to login');
        this.hasCheckedAuth = true;
        this.habitBusinesses = [];
        this.userProfile = null;
        this.currentUser = null;
        this.todaysHabits = [];
        this.todaysEarnings = 0;
        this.todaysStockEarnings = 0;
        this.pendingHabitsCount = 0;
        this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }
      
      // Try to load user profile if user exists
      // Check if user is admin
      this.isAdmin = await this.adminService.isAdmin();
      console.log('👤 Admin status:', this.isAdmin);
      
      try {
        console.log('Attempting to ensure profile exists for user ID:', user.id);
        this.userProfile = await this.authService.ensureUserProfileExists(user);
        console.log('User profile ensured:', this.userProfile);
        } catch (error) {
        console.error('Profile creation/loading failed:', error);
        // Initialize default profile if everything fails
        this.userProfile = {
          name: user.user_metadata?.['name'] || 'Entrepreneur',
          cash: 100.00,
          net_worth: 100.00
        };
      }
      
      // Load dashboard data after user is confirmed.
      // Reset isLoading first so loadDashboardData's own guard doesn't skip it.
      this.isLoading = false;
      await this.loadDashboardData();
      this.hasCheckedAuth = true;
    } catch (error) {
      console.log('❌ No user logged in, redirecting to login');
      console.error('Auth error details:', error);
      this.hasCheckedAuth = true;
      
      // Clear any data that might have been loaded
      this.habitBusinesses = [];
      this.userProfile = null;
      this.currentUser = null;
      
      // Only redirect to login after a brief delay to avoid immediate redirect
      setTimeout(() => {
        console.log('🔄 Redirecting to login...');
        this.router.navigate(['/login']);
      }, 1000);
    } finally {
      this.isLoading = false;
    }
  }

  async loadDashboardData() {
    if (this.isLoading) {
      console.log('📊 Already loading dashboard, skipping...');
      return;
    }
    
    this.isLoading = true;
    try {
      console.log('📊 Loading dashboard data for user:', this.currentUser?.id);
      
      if (this.currentUser) {
        // Reset any outdated daily habits first to ensure accurate counts
        try {
          await this.habitBusinessService.resetOutdatedDailyHabits();
          
          // ✨ NEW: Reset habit order to custom order when habits are reset (new day/week)
          await this.resetHabitsToCustomOrder();
        } catch (resetError) {
          console.warn('⚠️ Non-critical error resetting outdated habits:', resetError);
        }
        
        // Load actual habit-business data
        this.habitBusinesses = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);

        // Load each business's stock ownership pay boost (1% per share purchased by investors)
        try {
          this.stockBoostByBusinessId = await this.habitBusinessService.getStockOwnershipBoosts(
            this.habitBusinesses.map(hb => hb.id)
          );
        } catch (stockBoostError) {
          console.error('❌ Error loading stock ownership boosts (non-critical):', stockBoostError);
          this.stockBoostByBusinessId = {};
        }

        // Load today's habits
        this.todaysHabits = await this.habitBusinessService.getTodaysHabits(this.currentUser.id);
        
        // Calculate today's actual earnings (what user has earned today)
        try {
          this.todaysEarnings = await this.habitBusinessService.getTodaysActualEarnings(this.currentUser.id);
        } catch (earningsError) {
          console.error('❌ Error loading today\'s earnings (non-critical):', earningsError);
          this.todaysEarnings = 0; // Default to 0 if earnings calculation fails
        }
        
        // Calculate today's stock dividend earnings
        try {
          this.todaysStockEarnings = await this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
        } catch (stockError) {
          console.error('❌ Error loading today\'s stock dividends (non-critical):', stockError);
          this.todaysStockEarnings = 0; // Default to 0 if stock earnings calculation fails
        }
        
        // Calculate pending habits (habits that haven't reached their goal for today/this week)
        this.pendingHabitsCount = this.habitBusinesses.filter(hb => {
          const isCompleted = this.isGoalCompleted(hb);
          console.log(`🔍 Habit ${hb.business_name}: progress=${hb.current_progress}/${hb.goal_value || 1}, frequency=${hb.frequency}, lastCompleted=${hb.last_completed_at}, isCompleted=${isCompleted}`);
          return !isCompleted;
        }).length;
        
        console.log(`📊 Dashboard calculations complete: pending=${this.pendingHabitsCount}, habit earnings=$${this.todaysEarnings.toFixed(2)}, stock dividends=$${this.todaysStockEarnings.toFixed(2)}`);
      } else {
        console.warn('⚠️  No current user found, cannot load dashboard data');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Don't clear already loaded data - only set fallbacks for failed calculations
      if (!this.habitBusinesses || this.habitBusinesses.length === 0) {
        this.habitBusinesses = [];
      }
      if (!this.todaysHabits || this.todaysHabits.length === 0) {
        this.todaysHabits = [];
      }
      // Set fallback values for calculations that failed
      this.todaysEarnings = this.todaysEarnings || 0;
      this.todaysStockEarnings = this.todaysStockEarnings || 0;
      this.pendingHabitsCount = this.pendingHabitsCount || 0;
    } finally {
      this.isLoading = false;
    }
  }

  async createNewHabitBusiness() {
    console.log('🏢 Creating new habit-business...');
    const modal = await this.modalController.create({
      component: LaunchBusinessModalComponent,
      componentProps: {
        modalController: this.modalController,
        toastController: this.toastController
      },
      cssClass: 'launch-business-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data?.created) {
      await this.loadCurrentUser();
      await this.loadDashboardData();
    }
  }

  async completeHabitBusiness(habitBusiness: HabitBusiness) {
    console.log('✅ Completing habit business:', habitBusiness);
    
    try {
      // Call the actual habit completion service
      const { earnings } = await this.habitBusinessService.completeHabit(habitBusiness.id);

      // Show success toast instead of blocking alert
      const toast = await this.toastController.create({
        message: `🎉 Habit "${habitBusiness.business_name}" completed! +$${earnings.toFixed(2)} earned`,
        duration: 3000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      
      // 🚀 REAL-TIME UPDATE: Emit completion event for immediate grid updates
      this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
      
      // Reload user profile to get updated cash
      await this.loadCurrentUser();
      
      // Reload dashboard data to get updated stats and completion status
      await this.loadDashboardData();

    } catch (error) {
      console.error('Error completing habit:', error);

      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      const errorToast = await this.toastController.create({
        message: isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to complete habit: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: isOfflineQueued ? 'warning' : 'danger'
      });
      await errorToast.present();
    }
  }

  completeHabit() {
    console.log('🎯 Opening habit check-in page...');
    this.router.navigate(['/habit-checkin']);
  }

  async toggleHabit(habit: any) {
    console.log('🔄 Toggling habit:', habit);
    // TODO: Implement habit toggle
    habit.completed = !habit.completed;
    
    if (habit.completed) {
      // Show success toast instead of blocking alert
      const toast = await this.toastController.create({
        message: `✅ Habit "${habit.name}" completed! +$${habit.earnings} earned`,
        duration: 3000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      // TODO: Update database and user cash
    }
  }

  /**
   * Check if a habit has been completed for the current interval period.
   */
  isCompletedToday(habitBusiness: HabitBusiness): boolean {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }

  /**
   * Check if a multi-completion habit has reached its goal for the current period.
   */
  isGoalCompleted(habitBusiness: HabitBusiness): boolean {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }

  /** Habit-businesses not yet completed for the current period, in display order. */
  get todoHabitBusinesses(): HabitBusiness[] {
    return this.habitBusinesses.filter(hb => !this.isGoalCompleted(hb));
  }

  /** Habit-businesses completed for the current period, in display order. */
  get doneHabitBusinesses(): HabitBusiness[] {
    return this.habitBusinesses.filter(hb => this.isGoalCompleted(hb));
  }

  /** True when today is one of the habit's active days (or it's a daily habit). */
  isTodayActiveDay(habitBusiness: HabitBusiness): boolean {
    return this.habitIntervalService.isTodayActiveDay(habitBusiness);
  }

  /** Label of the next active day for a specific_days habit (e.g. "Monday"). */
  getNextActiveDayLabel(habitBusiness: HabitBusiness): string {
    return this.habitIntervalService.getNextActiveDayLabel(habitBusiness.active_days || []);
  }

  /** True current streak, correcting for a stale (not-yet-reset) streak column. */
  getEffectiveStreak(habitBusiness: HabitBusiness): number {
    return this.habitIntervalService.getEffectiveStreak(habitBusiness);
  }

  /** Active day DOW array for chip rendering (0=Sun…6=Sat). */
  readonly allDows = [0, 1, 2, 3, 4, 5, 6];
  readonly dayChipLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly today = new Date();

  /**
   * Undo habit completion for today
   */
  async undoHabitCompletion(habitBusiness: HabitBusiness) {
    console.log('↩️ Undoing habit completion:', habitBusiness);
    
    try {
      // Call the undo completion service method directly
      const { earnings } = await this.habitBusinessService.undoHabitCompletion(habitBusiness.id);

      // Show success toast
      const toast = await this.toastController.create({
        message: `↩️ Completion undone for "${habitBusiness.business_name}"! -$${earnings.toFixed(2)} removed`,
        duration: 3000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      
      // 🚀 REAL-TIME UPDATE: Emit undo event for immediate grid updates
      this.habitUpdateService.emitHabitUndo(habitBusiness.id);
      
      // Reload user profile to get updated cash
      await this.loadCurrentUser();
      
      // Reload dashboard data to get updated stats and completion status
      await this.loadDashboardData();
      
    } catch (error) {
      console.error('Error undoing habit completion:', error);

      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      const errorToast = await this.toastController.create({
        message: isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to undo completion: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: isOfflineQueued ? 'warning' : 'danger'
      });
      await errorToast.present();
    }
  }

  /**
   * Open the 365-day habit grid modal for a specific habit business
   */
  /**
   * Toggle the inline 365-day habit grid for a specific habit business
   */
  toggleHabitGrid(habitBusiness: HabitBusiness) {
    console.log('📅 Toggling habit grid for:', habitBusiness);
    
    const currentState = this.expandedGrids[habitBusiness.id] || false;
    
    // Close all other grids first (only allow one open at a time)
    this.expandedGrids = {};
    
    // Toggle the clicked grid
    this.expandedGrids[habitBusiness.id] = !currentState;
    
    console.log('Grid expanded state for', habitBusiness.business_name, ':', this.expandedGrids[habitBusiness.id]);
  }

  /**
   * Upgrade a habit business to a better business type
   */
  async upgradeHabitBusiness(habitBusiness: HabitBusiness) {
    console.log('📈 Upgrading habit business:', habitBusiness);

    // Businesses can only be upgraded once every 24h (server-enforced too —
    // this just avoids a round trip and gives a friendlier message).
    const UPGRADE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    if (habitBusiness.last_upgraded_at) {
      const msSinceUpgrade = Date.now() - new Date(habitBusiness.last_upgraded_at).getTime();
      const msRemaining = UPGRADE_COOLDOWN_MS - msSinceUpgrade;
      if (msRemaining > 0) {
        const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));
        const toast = await this.toastController.create({
          message: `⏳ This business was just upgraded — you can upgrade it again in ${hoursRemaining}h.`,
          duration: 3000,
          position: 'top',
          color: 'warning'
        });
        await toast.present();
        return;
      }
    }

    try {
      // Get all available business types to show upgrade options
      const businessTypes = await this.habitBusinessService.getBusinessTypes();
      
      // Filter to show only business types that cost more than current one (upgrades)
      const upgradeOptions = businessTypes.filter(bt => 
        bt.base_cost > (habitBusiness.cost || 0) && 
        bt.id !== habitBusiness.business_type_id
      );
      
      if (upgradeOptions.length === 0) {
        const toast = await this.toastController.create({
          message: '🎉 You already have the best business type available!',
          duration: 3000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
        return;
      }
      
      // Current business sell value: base value (marketplace_base_value for a
      // Marketplace-sourced business, otherwise 70% of original cost) boosted
      // +1%/streak day up to +100%; falls back to the base value once the
      // streak breaks and resets to 0.
      const currentBusinessValue = this.habitBusinessService.getMarketplaceListingPrice(habitBusiness);
      
      // Open the professional upgrade modal
      const modal = await this.modalController.create({
        component: UpgradeModalComponent,
        componentProps: {
          habitBusiness: habitBusiness,
          upgradeOptions: upgradeOptions,
          userCash: this.userProfile?.cash || 0,
          currentBusinessValue: currentBusinessValue,
          modalController: this.modalController,
          toastController: this.toastController
        },
        cssClass: 'upgrade-modal'
      });
      
      await modal.present();
      
      const { data } = await modal.onDidDismiss();
      
      if (data && data.selectedBusinessType) {
        await this.performUpgrade(habitBusiness, data.selectedBusinessType, data.upgradeCost);
      }
      
    } catch (error) {
      console.error('Error showing upgrade options:', error);
      const errorToast = await this.toastController.create({
        message: `❌ Failed to load upgrade options: ${error}`,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  /**
   * Perform the actual business upgrade
   */
  async performUpgrade(habitBusiness: HabitBusiness, newBusinessType: any, upgradeCost: number) {
    try {
      // Call the upgrade service method
      await this.habitBusinessService.upgradeHabitBusiness(habitBusiness.id, newBusinessType.id, upgradeCost);
      
      // Show success toast
      const successToast = await this.toastController.create({
        message: `🎉 Upgraded to ${newBusinessType.icon} ${newBusinessType.name}! Your old "${habitBusiness.business_name}" is now listed on the Marketplace for friends to buy.`,
        duration: 4500,
        position: 'top',
        color: 'success'
      });
      await successToast.present();
      
      // Reload user profile to get updated cash
      await this.loadCurrentUser();
      
      // Reload dashboard data to show the upgraded business
      await this.loadDashboardData();
      
    } catch (error) {
      console.error('Error upgrading habit business:', error);
      
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      const errorToast = await this.toastController.create({
        message: `❌ Failed to upgrade business: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }
  async editHabitBusiness(habitBusiness: HabitBusiness) {
    console.log('✏️ Editing habit business:', habitBusiness);
    try {
      const modal = await this.modalController.create({
        component: EditHabitModalComponent,
        componentProps: {
          habitBusiness,
          modalController: this.modalController
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1
      });

      await modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role !== 'save' || !data) return;

      try {
        await this.habitBusinessService.updateHabitBusiness(habitBusiness.id, {
          business_name: data.businessName,
          habit_description: data.habitDescription,
          recurrence_interval: data.recurrenceInterval,
          goal_value: data.goalValue,
          active_days: data.activeDays
        });

        const successToast = await this.toastController.create({
          message: `✅ "${data.businessName}" updated successfully!`,
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await successToast.present();
        await this.loadDashboardData();
      } catch (error) {
        const errorToast = await this.toastController.create({
          message: `❌ Failed to update: ${(error as any)?.message || 'Unknown error'}`,
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await errorToast.present();
      }
    } catch (error) {
      console.error('Error opening edit modal:', error);
    }
  }

  /**
   * Show who owns shares of this business's stock, and how many each holds
   */
  async openStockOwnersModal(habitBusiness: HabitBusiness) {
    const modal = await this.modalController.create({
      component: StockOwnersModalComponent,
      componentProps: {
        businessName: habitBusiness.business_name,
        habitBusinessId: habitBusiness.id,
        modalController: this.modalController
      },
      cssClass: 'stock-owners-modal'
    });
    await modal.present();
  }

  /**
   * Delete (sell) a habit business with loss penalty
   */
  async deleteHabitBusiness(habitBusiness: HabitBusiness) {
    console.log('🗑️ Deleting habit business:', habitBusiness);
    
    try {
      // Check if this would be the user's last habit business
      if (this.habitBusinesses.length <= 1) {
        const warningToast = await this.toastController.create({
          message: '⚠️ Cannot delete your only habit business! You must have at least one active business.',
          duration: 4000,
          position: 'top',
          color: 'warning'
        });
        await warningToast.present();
        return;
      }

      // Preview the exact price this business will list for on the Marketplace
      const listingPrice = this.habitBusinessService.getMarketplaceListingPrice(habitBusiness);

      // Show modern confirmation alert
      const alert = await this.alertController.create({
        header: '🗑️ Delete Habit',
        message: `Are you sure you want to delete "${habitBusiness.business_name}"?\n\n🏪 It will be listed on the Marketplace for $${listingPrice.toFixed(2)} for 24 hours so a friend can buy it.\n💰 You're guaranteed that $${listingPrice.toFixed(2)} either way — sooner if a friend buys it, otherwise automatically once the listing expires.\n\nThis action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete & List',
            role: 'destructive',
            handler: async () => {
              try {
                // Call the delete service method
                const listingPrice = await this.habitBusinessService.deleteHabitBusiness(habitBusiness.id);

                // Show success toast
                const successToast = await this.toastController.create({
                  message: `🏪 "${habitBusiness.business_name}" is listed on the Marketplace for $${listingPrice.toFixed(2)}!`,
                  duration: 4000,
                  position: 'top',
                  color: 'success'
                });
                await successToast.present();
                
                // Reload user profile to get updated cash
                await this.loadCurrentUser();
                
                // Reload dashboard data to remove the deleted business
                await this.loadDashboardData();
                
              } catch (error) {
                console.error('Error deleting habit business:', error);
                
                const errorMessage = (error as any)?.message || 'Unknown error occurred';
                const errorToast = await this.toastController.create({
                  message: `❌ Failed to sell habit business: ${errorMessage}`,
                  duration: 3000,
                  position: 'top',
                  color: 'danger'
                });
                await errorToast.present();
              }
            }
          }
        ]
      });

      await alert.present();

    } catch (error) {
      console.error('Error creating delete alert:', error);
    }
  }

  /**
   * Calculate earnings breakdown for a habit business
   */
  getEarningsBreakdown(habitBusiness: HabitBusiness): {
    baseEarnings: number;
    streakBonus: number;
    stockBoost: number;
    totalEarnings: number;
  } {
    // The stored earnings_per_completion is the base rate without multipliers
    const baseEarnings = habitBusiness.earnings_per_completion;
    const currentStreak = this.habitIntervalService.getEffectiveStreak(habitBusiness);

    // Calculate what the next completion will earn using Option A logic
    // The service increments streak first, then applies conservative multiplier
    // So we need to show earnings for (currentStreak + 1)
    const nextStreak = currentStreak + 1;

    // Stock ownership boost: 1% base pay per tradeable share purchased by investors,
    // applied to base pay before the streak bonus
    const stockBoostPercentage = this.stockBoostByBusinessId[habitBusiness.id] || 0;
    const stockBoost = baseEarnings * (stockBoostPercentage / 100);
    const boostedBaseEarnings = baseEarnings + stockBoost;

    // Day 1: $1.00 (0x bonus), Day 2: $1.10 (0.1x bonus), Day 3: $1.20 (0.2x bonus), ...
    // capped at +100% (2x total pay) so long streaks don't run away unbounded
    const streakMultiplier = nextStreak === 1 ? 0 : Math.min((nextStreak - 1) * 0.1, 1);
    const baseTotal = boostedBaseEarnings + (boostedBaseEarnings * streakMultiplier);
    const streakBonus = baseTotal - boostedBaseEarnings; // The bonus amount

    const totalEarnings = baseTotal;

    return {
      baseEarnings,
      streakBonus,
      stockBoost,
      totalEarnings
    };
  }

  /**
   * Toggle earnings breakdown visibility for a specific habit
   */
  toggleEarningsBreakdown(habitBusinessId: string) {
    const currentState = this.showEarningsBreakdown[habitBusinessId] || false;
    this.showEarningsBreakdown[habitBusinessId] = !currentState;
  }

  /**
   * Toggle entire earnings section visibility for a specific habit
   */
  toggleEarningsVisibility(habitBusinessId: string) {
    const currentState = this.showEarningsSection[habitBusinessId];
    // Default to false (hidden) if not set, so first click shows it
    this.showEarningsSection[habitBusinessId] = currentState === undefined ? true : !currentState;
  }

  // Track which habits have their 365-day grid expanded
  expandedGrids: { [key: string]: boolean } = {};

  // Track which habits have their earnings breakdown expanded
  showEarningsBreakdown: { [key: string]: boolean } = {};

  // Track which habits have their entire earnings section visible
  showEarningsSection: { [key: string]: boolean } = {};

  // Stock ownership pay-boost percentage per habit business (1% per share purchased by investors)
  stockBoostByBusinessId: { [habitBusinessId: string]: number } = {};

  // Help section visibility
  showStatsHelpSection = false;
  showHabitProgressHelpSection = false;

  // Complete/undo button in-flight states (drives the completion pop animation)
  completeButtonStates: { [key: string]: { isCompleting: boolean; isUndoing: boolean } } = {};

  ngOnInit() {
    this.countdownTickService.register();
    this.tickSub = this.countdownTickService.tick$.subscribe(() => {
      this.habitBusinesses.forEach(hb => {
        const interval = this.habitIntervalService.resolveInterval(hb);
        const secs = this.habitIntervalService.getSecondsUntilReset(interval, new Date(), hb.active_days);
        this.countdowns[hb.id] = this.habitIntervalService.formatCountdown(secs, interval);
      });
    });
    this.pendingSyncSub = this.offlineQueueService.pendingCount$.subscribe(
      count => (this.pendingSyncCount = count)
    );
  }

  ngOnDestroy() {
    this.tickSub?.unsubscribe();
    this.pendingSyncSub?.unsubscribe();
    this.countdownTickService.unregister();
  }

  /**
   * Shared completion logic used when marking a habit complete
   */
  private async runCompleteHabit(habitBusiness: HabitBusiness) {
    // Show "missed yesterday" prompt for daily habits that weren't done yesterday
    const missedYesterday = this.habitIntervalService.didMissYesterday(habitBusiness);
    console.log('[runCompleteHabit] habit:', habitBusiness.business_name, '| recurrence_interval:', habitBusiness.recurrence_interval, '| goal_value:', habitBusiness.goal_value, '| created_at:', habitBusiness.created_at, '| last_completed_at:', habitBusiness.last_completed_at, '| didMissYesterday:', missedYesterday);
    if (missedYesterday) {
      await this.showMissedYesterdayAlert(habitBusiness);
    } else {
      await this.completeHabitBusiness(habitBusiness);
    }
  }

  /**
   * Instantly complete a habit on a single tap
   */
  async handleCompleteTap(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();

    if (!this.completeButtonStates[habitBusiness.id]) {
      this.completeButtonStates[habitBusiness.id] = { isCompleting: false, isUndoing: false };
    }

    const state = this.completeButtonStates[habitBusiness.id];
    if (state.isCompleting) return;

    state.isCompleting = true;
    try {
      await this.runCompleteHabit(habitBusiness);
    } finally {
      state.isCompleting = false;
    }
  }

  /**
   * Show a prompt when the user tries to complete a habit they missed yesterday.
   * Lets them choose to mark yesterday or today as complete.
   */
  private async showMissedYesterdayAlert(habitBusiness: HabitBusiness): Promise<void> {
    // The alert itself dismisses immediately on tap (buttons run their work
    // in the background rather than blocking the dialog), but callers
    // (handleCompleteTap) rely on this promise to know when it's safe to
    // clear their "isCompleting" guard — resolving as soon as alert.present()
    // does (instead of waiting for the background work) would re-enable the
    // complete button before the pending completion actually finishes,
    // allowing a second, overlapping tap.
    return new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      this.alertController.create({
        header: '⏰ Forgot to mark your habit yesterday?',
        message: 'You missed marking this habit yesterday. Did you complete it? You can still mark it as complete.\n\nSelect which day to complete:',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => done()
          },
          {
            text: 'Yesterday',
            handler: () => {
              // Run async in background so the alert closes immediately
              (async () => {
                try {
                  await this.habitBusinessService.completeHabitYesterday(habitBusiness.id);
                  const toast = await this.toastController.create({
                    message: `✅ "${habitBusiness.business_name}" marked complete for yesterday! Earnings added.`,
                    duration: 3000,
                    position: 'top',
                    color: 'success'
                  });
                  await toast.present();
                  this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
                  await this.loadCurrentUser();
                  await this.loadDashboardData();
                } catch (error) {
                  const isOfflineQueued = error instanceof OfflineQueuedError;
                  const errorMessage = (error as any)?.message || 'Unknown error occurred';
                  const errorToast = await this.toastController.create({
                    message: isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed: ${errorMessage}`,
                    duration: 3000,
                    position: 'top',
                    color: isOfflineQueued ? 'warning' : 'danger'
                  });
                  await errorToast.present();
                } finally {
                  done();
                }
              })();
            }
          },
          {
            text: 'Today',
            handler: () => {
              (async () => {
                try {
                  await this.completeHabitBusiness(habitBusiness);
                } finally {
                  done();
                }
              })();
            }
          }
        ]
      }).then(alert => alert.present());
    });
  }

  /**
   * Instantly undo a habit completion on a single tap
   */
  async handleUndoTap(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();

    if (!this.completeButtonStates[habitBusiness.id]) {
      this.completeButtonStates[habitBusiness.id] = { isCompleting: false, isUndoing: false };
    }

    const state = this.completeButtonStates[habitBusiness.id];
    if (state.isUndoing) return;

    state.isUndoing = true;
    try {
      await this.undoHabitCompletion(habitBusiness);
    } finally {
      state.isUndoing = false;
    }
  }

  /**
   * Format large numbers for display (1.1K, 1.1M, 1.1B, 1.1T, etc.)
   */
  formatLargeNumber(amount: number): string {
    if (amount >= 1000000000000) {
      // Trillions
      const trillions = amount / 1000000000000;
      return trillions >= 10 ? `${Math.floor(trillions)}T` : `${trillions.toFixed(1)}T`;
    } else if (amount >= 1000000000) {
      // Billions
      const billions = amount / 1000000000;
      return billions >= 10 ? `${Math.floor(billions)}B` : `${billions.toFixed(1)}B`;
    } else if (amount >= 1000000) {
      // Millions
      const millions = amount / 1000000;
      return millions >= 10 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
    } else if (amount >= 1000) {
      // Thousands
      const thousands = amount / 1000;
      return thousands >= 10 ? `${Math.floor(thousands)}K` : `${thousands.toFixed(1)}K`;
    } else {
      // Less than 1 thousand, show exact amount with commas for readability
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  // Daily stat numbers abbreviate (1K, 1M, 1T...) once they hit this size.
  // Kept low (matching the header cash/net-worth threshold) because the stat
  // cards are only ~1/3 of the screen wide with overflow:hidden - an
  // un-abbreviated value like "$66,000.00" is wider than the card and gets
  // clipped on both sides by the centered text, e.g. showing "66,000.0".
  private readonly STAT_ABBREVIATE_THRESHOLD = 1000;

  isStatAbbreviated(value: number): boolean {
    return Math.abs(value || 0) >= this.STAT_ABBREVIATE_THRESHOLD;
  }

  /**
   * Abbreviate a number to K/M/B/T, always rounding UP so the displayed
   * value never understates the real amount (e.g. 100,001 -> "101K").
   * `decimals` controls precision (e.g. 1 -> "58.6K", 0 -> "59K") - lower it
   * for cards where an extra digit (or a leading "+"/"-") would overflow.
   */
  private abbreviateStatNumber(value: number, decimals: number = 1): string {
    const units = ['', 'K', 'M', 'B', 'T'];
    const sign = value < 0 ? '-' : '';
    let scaled = Math.abs(value);
    let unitIndex = 0;
    while (scaled >= 1000 && unitIndex < units.length - 1) {
      scaled /= 1000;
      unitIndex++;
    }
    const factor = Math.pow(10, decimals);
    let rounded = Math.ceil(scaled * factor) / factor;
    // Rounding up can push a value like 999.99K to 1000K - roll it into the next unit
    if (rounded >= 1000 && unitIndex < units.length - 1) {
      rounded = Math.ceil((rounded / 1000) * factor) / factor;
      unitIndex++;
    }
    const display = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(decimals);
    return `${sign}${display}${units[unitIndex]}`;
  }

  /**
   * Format a currency amount with thousands separators (e.g. $1,234.56),
   * abbreviating to $101K / $1.2M / $1T once it crosses the threshold.
   */
  formatCurrency(amount: number, decimals: number = 1): string {
    const value = amount || 0;
    if (this.isStatAbbreviated(value)) {
      return '$' + this.abbreviateStatNumber(value, decimals);
    }
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Format a plain count with thousands separators (e.g. 1,234),
   * abbreviating to 101K / 1.2M / 1T once it crosses the threshold.
   */
  formatCount(count: number): string {
    const value = count || 0;
    if (this.isStatAbbreviated(value)) {
      return this.abbreviateStatNumber(value);
    }
    return value.toLocaleString('en-US');
  }

  /**
   * Show a habit-business's description in a popup (the description text
   * itself is hidden on the card; only a "Description" link is shown).
   */
  async showHabitDescription(habitBusiness: HabitBusiness) {
    const alert = await this.alertController.create({
      header: habitBusiness.business_name,
      message: habitBusiness.habit_description || 'No description provided.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Show the exact value behind an abbreviated daily stat in a popup.
   */
  async showExactStatValue(label: string, value: number, isCurrency: boolean) {
    if (!this.isStatAbbreviated(value)) return;
    const exact = value || 0;
    const message = isCurrency
      ? '$' + exact.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : exact.toLocaleString('en-US');
    const alert = await this.alertController.create({
      header: label,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Get displayed cash amount, abbreviated once it crosses $1,000
   */
  getDisplayedCash(): string {
    const cash = this.userProfile?.cash || 0;
    if (cash >= 1000) {
      return this.formatLargeNumber(cash);
    }
    return cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Get displayed net worth amount, abbreviated once it crosses $1,000
   */
  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  isCashAbbreviated(value: number): boolean {
    return Math.abs(value || 0) >= 1000;
  }

  /**
   * Show the exact value behind an abbreviated cash/net worth header stat in a popup.
   */
  async showExactCashValue(label: string, value: number) {
    if (!this.isCashAbbreviated(value)) return;
    const exact = value || 0;
    const message = '$' + exact.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const alert = await this.alertController.create({
      header: label,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Toggle stats help section
   */
  toggleStatsHelpSection() {
    this.showStatsHelpSection = !this.showStatsHelpSection;
  }

  /**
   * Navigate to the itemized Weekly Receipt page
   */
  openWeeklyReceipt() {
    this.router.navigate(['/weekly-receipt']);
  }

  /**
   * Toggle habit progress help section
   */
  toggleHabitProgressHelpSection() {
    this.showHabitProgressHelpSection = !this.showHabitProgressHelpSection;
  }

  /**
   * Undo the last completion for multi-completion habits
   */
  async undoLastCompletion(habitBusiness: HabitBusiness) {
    try {
      console.log('🔄 Undoing last completion for habit:', habitBusiness.business_name);
      
      // Call the undo service
      await this.habitBusinessService.undoHabitCompletion(habitBusiness.id);
      
      // Show success toast
      const toast = await this.toastController.create({
        message: `↩️ Undid completion for "${habitBusiness.business_name}"`,
        duration: 2000,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      
      // Emit update event for real-time updates
      this.habitUpdateService.emitHabitCompletion(habitBusiness.id);
      
      // Reload data to reflect changes
      await this.loadCurrentUser();
      await this.loadDashboardData();
      
    } catch (error) {
      console.error('Error undoing completion:', error);

      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error';
      const errorToast = await this.toastController.create({
        message: isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to undo completion: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: isOfflineQueued ? 'warning' : 'danger'
      });
      await errorToast.present();
    }
  }

  /**
   * Move a habit-business up or down within its own group (to-do or done).
   */
  async moveHabitBusiness(habitBusiness: HabitBusiness, direction: 'up' | 'down') {
    const group = this.isGoalCompleted(habitBusiness) ? this.doneHabitBusinesses : this.todoHabitBusinesses;
    const groupIndex = group.findIndex(hb => hb.id === habitBusiness.id);
    const targetGroupIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;

    if (groupIndex === -1 || targetGroupIndex < 0 || targetGroupIndex >= group.length) {
      return; // Already at the top/bottom of its group
    }

    const swapWith = group[targetGroupIndex];
    const indexA = this.habitBusinesses.findIndex(hb => hb.id === habitBusiness.id);
    const indexB = this.habitBusinesses.findIndex(hb => hb.id === swapWith.id);

    // Update the local array immediately for responsive UI
    [this.habitBusinesses[indexA], this.habitBusinesses[indexB]] =
      [this.habitBusinesses[indexB], this.habitBusinesses[indexA]];

    try {
      const orderedBusinessIds = this.habitBusinesses.map(hb => hb.id);
      await this.habitBusinessService.updateHabitBusinessOrder(this.currentUser.id, orderedBusinessIds);
    } catch (error) {
      console.error('Error updating habit order:', error);

      // Revert the local change
      await this.loadDashboardData();

      const errorToast = await this.toastController.create({
        message: '❌ Failed to update order. Please try again.',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }

  /**
   * Reset habits to user's custom order (called when new day/week starts)
   */
  async resetHabitsToCustomOrder() {
    try {
      await this.habitBusinessService.resetToCustomOrder(this.currentUser.id);
      // Reload data to reflect the reset order
      await this.loadDashboardData();
    } catch (error) {
      console.error('Error resetting habits to custom order:', error);
      // Don't show error toast as this is automatic - just log it
    }
  }
}
