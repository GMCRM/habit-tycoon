import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
import { SettingsService } from '../services/settings.service';
import { AdminService } from '../services/admin.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { OfflineQueuedError, OfflineQueueService } from '../services/offline-queue.service';
import { HabitUpdateService } from '../services/habit-update.service';
import { HabitIntervalService } from '../services/habit-interval.service';
import { CountdownTickService } from '../services/countdown-tick.service';
import { UpgradeModalComponent } from './upgrade-modal/upgrade-modal.component';
import { EditHabitModalComponent } from './edit-habit-modal/edit-habit-modal.component';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { HabitGridComponent } from '../shared/components/habit-grid/habit-grid.component';
import { StockChartComponent } from '../shared/components/stock-chart/stock-chart.component';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, chevronUp, chevronDown, wallet, cash, arrowBack, settings, helpCircle, close, analytics, shield } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonInput, CommonModule, FormsModule, RouterLink, BottomNavComponent, HabitGridComponent, StockChartComponent],
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

  // Mobile carousel properties for stats cards
  currentStatIndex = 0;
  autoCarouselInterval: any = null;
  isMobileScreen = false;
  statsCards: any[] = [];

  // Countdown timer state
  countdowns: Record<string, string> = {};
  private tickSub?: Subscription;

  // Actions queued while offline, waiting to sync (see OfflineQueueService)
  pendingSyncCount = 0;
  private pendingSyncSub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private settingsService: SettingsService,
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
    addIcons({ checkmarkCircle, alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, chevronUp, chevronDown, wallet, cash, arrowBack, settings, helpCircle, close, analytics, shield });
    this.setRandomTagline();
    this.checkScreenSize();
    this.setupStatsCards();
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
      this.settingsService.syncFromProfile(this.userProfile);
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
        this.settingsService.syncFromProfile(this.userProfile);
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
        
        // Update stats cards with new data
        this.setupStatsCards();
        
        // Start carousel if on mobile
        if (this.isMobileScreen && this.statsCards.length > 0) {
          this.startAutoCarousel();
        }
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

  createNewHabitBusiness() {
    console.log('🏢 Creating new habit-business...');
    this.router.navigate(['/create-habit-business']);
  }

  async completeHabitBusiness(habitBusiness: HabitBusiness) {
    console.log('✅ Completing habit business:', habitBusiness);
    
    try {
      // Call the actual habit completion service
      await this.habitBusinessService.completeHabit(habitBusiness.id);
      
      // Show success toast instead of blocking alert
      const toast = await this.toastController.create({
        message: `🎉 Habit "${habitBusiness.business_name}" completed! +$${habitBusiness.earnings_per_completion} earned`,
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
      await this.habitBusinessService.undoHabitCompletion(habitBusiness.id);
      
      // Show success toast
      const toast = await this.toastController.create({
        message: `↩️ Completion undone for "${habitBusiness.business_name}"! -$${habitBusiness.earnings_per_completion} removed`,
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
      
      // Calculate current business sell value (70% of original cost)
      const currentBusinessValue = Math.floor((habitBusiness.cost || 0) * 0.7);
      
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
        message: `🎉 Successfully upgraded "${habitBusiness.business_name}" to ${newBusinessType.icon} ${newBusinessType.name}!`,
        duration: 4000,
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

      // Calculate sell value (70% of original cost)
      const originalCost = habitBusiness.cost || 100;
      const sellValue = Math.floor(originalCost * 0.7);
      const loss = originalCost - sellValue;

      // Show modern confirmation alert
      const alert = await this.alertController.create({
        header: '🗑️ Sell Habit Business',
        message: `Are you sure you want to sell "${habitBusiness.business_name}"?\n\n💰 You will receive: $${sellValue}\n⚠️ You will lose: $${loss} from your original investment\n\nThis action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Sell & Delete',
            role: 'destructive',
            handler: async () => {
              try {
                // Call the delete service method
                const sellValue = await this.habitBusinessService.deleteHabitBusiness(habitBusiness.id);
                
                // Show success toast
                const successToast = await this.toastController.create({
                  message: `💰 Habit business "${habitBusiness.business_name}" sold for $${sellValue}!`,
                  duration: 3000,
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

  // Track detailed view state for cash and net worth cards
  showDetailedCash = false;
  showDetailedNetWorth = false;

  // Help section visibility
  showStatsHelpSection = false;
  showHabitProgressHelpSection = false;

  // Hold-down button states
  holdingStates: { [key: string]: { 
    isHolding: boolean; 
    progress: number; 
    isCompleting: boolean; 
    isUndoing: boolean;
    undoProgress: number;
    timer?: any; 
    interval?: any;
    undoTimer?: any;
    undoInterval?: any;
  } } = {};
  private holdDuration = 1500; // 1.5 seconds to complete
  private updateInterval = 50; // Update progress every 50ms

  // Whether the complete/undo button responds to a single tap instead of a hold
  tapToComplete = false;
  private tapToCompleteSub?: Subscription;

  // Carousel methods for mobile stats
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobileScreen = width <= 768;
    
    if (this.isMobileScreen && this.statsCards.length > 0) {
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }

  private setupStatsCards() {
    this.statsCards = [
      {
        icon: 'checkmark-circle',
        color: 'success',
        getValue: () => this.formatCount(this.pendingHabitsCount),
        getRawValue: () => this.pendingHabitsCount,
        isCurrency: false,
        label: 'Pending Habits'
      },
      {
        icon: 'business',
        color: 'success',
        getValue: () => this.formatCurrency(this.todaysEarnings),
        getRawValue: () => this.todaysEarnings,
        isCurrency: true,
        label: "Today's Habit Earnings"
      },
      {
        icon: 'wallet',
        color: 'secondary',
        getValue: () => this.formatCurrency(this.todaysStockEarnings),
        getRawValue: () => this.todaysStockEarnings,
        isCurrency: true,
        label: "Today's Stock Dividends"
      }
    ];
  }

  startAutoCarousel() {
    this.stopAutoCarousel();
    this.autoCarouselInterval = setInterval(() => {
      this.nextStat();
    }, 4000); // Change every 4 seconds
  }

  stopAutoCarousel() {
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
      this.autoCarouselInterval = null;
    }
  }

  nextStat() {
    this.currentStatIndex = (this.currentStatIndex + 1) % this.statsCards.length;
  }

  previousStat() {
    this.currentStatIndex = this.currentStatIndex === 0 
      ? this.statsCards.length - 1 
      : this.currentStatIndex - 1;
  }

  onStatTouchStart(event: TouchEvent) {
    this.stopAutoCarousel(); // Stop auto-rotation when user interacts
  }

  onStatTouchEnd(event: TouchEvent) {
    // Restart auto-rotation after user interaction
    if (this.isMobileScreen && this.statsCards.length > 0) {
      setTimeout(() => this.startAutoCarousel(), 2000);
    }
  }

  ngOnInit() {
    this.tapToCompleteSub = this.settingsService.tapToComplete$.subscribe(
      value => (this.tapToComplete = value)
    );
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
    this.tapToCompleteSub?.unsubscribe();
    this.pendingSyncSub?.unsubscribe();
    this.countdownTickService.unregister();
    this.stopAutoCarousel();
    // Clean up any ongoing hold timers
    Object.values(this.holdingStates).forEach(state => {
      if (state.timer) clearTimeout(state.timer);
      if (state.interval) clearInterval(state.interval);
      if (state.undoTimer) clearTimeout(state.undoTimer);
      if (state.undoInterval) clearInterval(state.undoInterval);
    });
  }

  /**
   * Start holding down the complete button
   */
  startHolding(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();
    
    // Initialize holding state if not exists
    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }

    const state = this.holdingStates[habitBusiness.id];
    
    // Don't start if already completing
    if (state.isCompleting) return;

    state.isHolding = true;
    state.progress = 0;

    // Update progress every 50ms
    state.interval = setInterval(() => {
      if (state.isHolding) {
        state.progress += (this.updateInterval / this.holdDuration) * 100;
        
        if (state.progress >= 100) {
          this.completeHolding(habitBusiness);
        }
      }
    }, this.updateInterval);

    // Failsafe timeout
    state.timer = setTimeout(() => {
      if (state.isHolding) {
        this.completeHolding(habitBusiness);
      }
    }, this.holdDuration);
  }

  /**
   * Stop holding down the complete button
   */
  stopHolding(habitBusiness: HabitBusiness, event: Event) {
    const state = this.holdingStates[habitBusiness.id];
    if (!state || state.isCompleting) return;

    state.isHolding = false;
    
    // Clear timers
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = undefined;
    }
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = undefined;
    }

    // Reset progress if not completed
    if (state.progress < 100) {
      // Animate progress back to 0
      const resetInterval = setInterval(() => {
        state.progress -= 10;
        if (state.progress <= 0) {
          state.progress = 0;
          clearInterval(resetInterval);
        }
      }, 20);
    }
  }

  /**
   * Complete the holding action
   */
  private async completeHolding(habitBusiness: HabitBusiness) {
    const state = this.holdingStates[habitBusiness.id];
    if (!state) return;

    state.isCompleting = true;
    state.progress = 100;
    state.isHolding = false;

    // Clear timers
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = undefined;
    }
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = undefined;
    }

    // Complete the habit after a brief success animation
    setTimeout(async () => {
      await this.runCompleteHabit(habitBusiness);

      // Reset state after completion
      state.isCompleting = false;
      state.progress = 0;
    }, 300);
  }

  /**
   * Shared completion logic used by both the hold-to-complete and tap-to-complete flows
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
   * Instantly complete a habit on a single tap (used when tap-to-complete is enabled)
   */
  async handleCompleteTap(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();

    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }

    const state = this.holdingStates[habitBusiness.id];
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
    // (handleCompleteTap/completeHolding) rely on this promise to know when
    // it's safe to clear their "isCompleting" guard — resolving as soon as
    // alert.present() does (instead of waiting for the background work)
    // would re-enable the complete button/hold gesture before the pending
    // completion actually finishes, allowing a second, overlapping tap.
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
   * Start holding for undo action
   */
  startUndoHolding(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();
    
    // Initialize holding state if not exists
    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }

    const state = this.holdingStates[habitBusiness.id];
    
    // Don't start if already undoing
    if (state.isUndoing) return;

    state.isUndoing = true;
    state.undoProgress = 0;

    // Update progress incrementally (goes from 0 to 100)
    state.undoInterval = setInterval(() => {
      state.undoProgress += (100 / this.holdDuration) * this.updateInterval;
      if (state.undoProgress >= 100) {
        state.undoProgress = 100;
        this.completeUndoHolding(habitBusiness);
      }
    }, this.updateInterval);

    // Set timeout to complete the undo action
    state.undoTimer = setTimeout(() => {
      this.completeUndoHolding(habitBusiness);
    }, this.holdDuration);
  }

  /**
   * Stop holding for undo action
   */
  stopUndoHolding(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();
    
    const state = this.holdingStates[habitBusiness.id];
    if (!state || !state.isUndoing) return;

    // Clear timers
    if (state.undoTimer) {
      clearTimeout(state.undoTimer);
      state.undoTimer = undefined;
    }
    if (state.undoInterval) {
      clearInterval(state.undoInterval);
      state.undoInterval = undefined;
    }

    state.isUndoing = false;

    // Reset progress gradually
    const resetInterval = setInterval(() => {
      state.undoProgress -= 10;
      if (state.undoProgress <= 0) {
        state.undoProgress = 0;
        clearInterval(resetInterval);
      }
    }, 20);
  }

  /**
   * Complete the undo holding action
   */
  private async completeUndoHolding(habitBusiness: HabitBusiness) {
    const state = this.holdingStates[habitBusiness.id];
    if (!state) return;

    state.undoProgress = 100;
    state.isUndoing = false;

    // Clear timers
    if (state.undoTimer) {
      clearTimeout(state.undoTimer);
      state.undoTimer = undefined;
    }
    if (state.undoInterval) {
      clearInterval(state.undoInterval);
      state.undoInterval = undefined;
    }

    // Complete the undo after a brief animation
    setTimeout(async () => {
      await this.undoHabitCompletion(habitBusiness);

      // Reset state after undo
      state.undoProgress = 0;
    }, 300);
  }

  /**
   * Instantly undo a habit completion on a single tap (used when tap-to-complete is enabled)
   */
  async handleUndoTap(habitBusiness: HabitBusiness, event: Event) {
    event.preventDefault();

    if (!this.holdingStates[habitBusiness.id]) {
      this.holdingStates[habitBusiness.id] = {
        isHolding: false,
        progress: 0,
        isCompleting: false,
        isUndoing: false,
        undoProgress: 0
      };
    }

    const state = this.holdingStates[habitBusiness.id];
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

  // Daily stat numbers abbreviate (100K, 1M, 1T...) once they hit this size
  private readonly STAT_ABBREVIATE_THRESHOLD = 100000;

  isStatAbbreviated(value: number): boolean {
    return Math.abs(value || 0) >= this.STAT_ABBREVIATE_THRESHOLD;
  }

  /**
   * Abbreviate a number to K/M/B/T, always rounding UP so the displayed
   * value never understates the real amount (e.g. 100,001 -> "101K").
   */
  private abbreviateStatNumber(value: number): string {
    const units = ['', 'K', 'M', 'B', 'T'];
    const sign = value < 0 ? '-' : '';
    let scaled = Math.abs(value);
    let unitIndex = 0;
    while (scaled >= 1000 && unitIndex < units.length - 1) {
      scaled /= 1000;
      unitIndex++;
    }
    let rounded = Math.ceil(scaled * 10) / 10;
    // Rounding up can push a value like 999.99K to 1000K - roll it into the next unit
    if (rounded >= 1000 && unitIndex < units.length - 1) {
      rounded = Math.ceil((rounded / 1000) * 10) / 10;
      unitIndex++;
    }
    const display = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    return `${sign}${display}${units[unitIndex]}`;
  }

  /**
   * Format a currency amount with thousands separators (e.g. $1,234.56),
   * abbreviating to $101K / $1.2M / $1T once it crosses the threshold.
   */
  formatCurrency(amount: number): string {
    const value = amount || 0;
    if (this.isStatAbbreviated(value)) {
      return '$' + this.abbreviateStatNumber(value);
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
   * Get displayed cash amount (formatted or exact)
   */
  getDisplayedCash(): string {
    const cash = this.userProfile?.cash || 0;
    if (cash >= 1000 && !this.showDetailedCash) {
      return this.formatLargeNumber(cash);
    }
    return cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Get displayed net worth amount (formatted or exact)
   */
  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Toggle detailed view for cash card
   */
  toggleCashDetail() {
    this.showDetailedCash = !this.showDetailedCash;
  }

  /**
   * Toggle detailed view for net worth card
   */
  toggleNetWorthDetail() {
    this.showDetailedNetWorth = !this.showDetailedNetWorth;
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
