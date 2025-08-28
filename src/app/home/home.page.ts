import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, 
  IonList, IonItem, IonLabel, IonBadge, IonInput, ToastController, AlertController, ModalController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { HabitUpdateService } from '../services/habit-update.service';
import { UpgradeModalComponent } from './upgrade-modal/upgrade-modal.component';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { HabitGridComponent } from '../shared/components/habit-grid/habit-grid.component';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, refresh, logOut, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, chevronUp, chevronDown, wallet, cash, arrowBack, settings, helpCircle, close, analytics } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonInput, CommonModule, FormsModule, RouterLink, BottomNavComponent, HabitGridComponent],
})
export class HomePage implements OnDestroy {
  currentUser: any = null;
  userProfile: any = null;
  hasCheckedAuth = false;
  isLoading = false; // Make public for template access
  
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private habitBusinessService: HabitBusinessService,
    private habitUpdateService: HabitUpdateService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    addIcons({ checkmarkCircle, alertCircle, refresh, logOut, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, arrowUndo, create, trash, trendingUp, chevronUp, chevronDown, wallet, cash, arrowBack, settings, helpCircle, close, analytics });
    this.setRandomTagline();
    this.checkScreenSize();
    this.setupStatsCards();
    this.loadCurrentUser();
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
    
    // Always try to refresh - but let the methods handle duplicate prevention
    if (this.currentUser && this.hasCheckedAuth) {
      console.log('🔄 User established, refreshing dashboard data and user profile...');
      // Force refresh dashboard data
      this.isLoading = false; // Reset loading state
      this.refreshUserProfile(); // Add profile refresh
      this.loadDashboardData();
    } else {
      console.log('🔄 Initial user load needed...');
      // Reset loading state and load user
      this.isLoading = false;
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
      
      // Try to load user profile if user exists
      if (user) {
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
        
        // Load dashboard data after user is confirmed
        await this.loadDashboardData();
        this.hasCheckedAuth = true;
      }
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
        } catch (resetError) {
          console.warn('⚠️ Non-critical error resetting outdated habits:', resetError);
        }
        
        // Load actual habit-business data
        this.habitBusinesses = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
        
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

  async logout() {
    try {
      await this.authService.signOut();
      
      // Show success toast instead of blocking alert
      const toast = await this.toastController.create({
        message: '👋 Successfully logged out!',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
      
      this.router.navigate(['/login']);
    } catch (error) {
      // Show error toast instead of blocking alert
      const errorToast = await this.toastController.create({
        message: '❌ Logout failed: ' + (error as Error).message,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
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
      
      // Show error toast instead of blocking alert
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      const errorToast = await this.toastController.create({
        message: `❌ Failed to complete habit: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: 'danger'
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
   * Check if a habit has been completed today (or this week for weekly habits)
   * Fixed to properly handle date comparisons and weekly reset logic
   */
  isCompletedToday(habitBusiness: HabitBusiness): boolean {
    if (!habitBusiness.last_completed_at) {
      return false;
    }
    
    // For multi-completion habits, check if the goal is fully completed
    const goalValue = habitBusiness.goal_value || 1;
    const currentProgress = habitBusiness.current_progress || 0;
    
    // If it's a multi-completion habit and goal isn't fully met, it's not "completed"
    if (goalValue > 1 && currentProgress < goalValue) {
      return false;
    }
    
    // Also check if there's any current progress - if it's 0, then it's not really "completed"
    if (currentProgress === 0) {
      return false;
    }
    
    if (habitBusiness.frequency === 'daily') {
      // For daily habits, check if completed today
      const today = new Date();
      const todayString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = completionDate.getFullYear() + '-' + 
        String(completionDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(completionDate.getDate()).padStart(2, '0');
      
      return completionString === todayString;
      
    } else if (habitBusiness.frequency === 'weekly') {
      // For weekly habits, check if completed this week
      const now = new Date();
      const completionDate = new Date(habitBusiness.last_completed_at);
      
      // Get the start of this week (Monday)
      const startOfThisWeek = new Date(now);
      const dayOfWeek = startOfThisWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
      startOfThisWeek.setDate(startOfThisWeek.getDate() - daysUntilMonday);
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      // Get the start of the completion week
      const startOfCompletionWeek = new Date(completionDate);
      const completionDayOfWeek = startOfCompletionWeek.getDay();
      const completionDaysUntilMonday = completionDayOfWeek === 0 ? 6 : completionDayOfWeek - 1;
      startOfCompletionWeek.setDate(startOfCompletionWeek.getDate() - completionDaysUntilMonday);
      startOfCompletionWeek.setHours(0, 0, 0, 0);
      
      const isSameWeek = startOfThisWeek.getTime() === startOfCompletionWeek.getTime();
      console.log(`🔍 Weekly habit ${habitBusiness.business_name}: this week=${startOfThisWeek.toDateString()}, completion week=${startOfCompletionWeek.toDateString()}, same=${isSameWeek}, progress=${currentProgress}, goal=${goalValue}`);
      
      return isSameWeek;
    }
    
    return false;
  }

  /**
   * Check if a multi-completion habit has reached its goal for this period
   */
  isGoalCompleted(habitBusiness: HabitBusiness): boolean {
    const goalValue = habitBusiness.goal_value || 1;
    const currentProgress = habitBusiness.current_progress || 0;
    
    // First check if the progress meets the goal
    if (currentProgress < goalValue) {
      return false; // Goal not met regardless of timing
    }
    
    // If goal is met, check if it's for the current period (today for daily, this week for weekly)
    if (!habitBusiness.last_completed_at) {
      return false; // No completion record
    }
    
    if (habitBusiness.frequency === 'daily') {
      // For daily habits, check if last completion was today
      const today = new Date();
      const todayString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      
      const completionDate = new Date(habitBusiness.last_completed_at);
      const completionString = completionDate.getFullYear() + '-' + 
        String(completionDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(completionDate.getDate()).padStart(2, '0');
      
      return completionString === todayString;
      
    } else if (habitBusiness.frequency === 'weekly') {
      // For weekly habits, check if last completion was this week
      const now = new Date();
      const completionDate = new Date(habitBusiness.last_completed_at);
      
      // Get the start of this week (Monday)
      const startOfThisWeek = new Date(now);
      const dayOfWeek = startOfThisWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday = 0
      startOfThisWeek.setDate(startOfThisWeek.getDate() - daysUntilMonday);
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      // Get the start of the completion week
      const startOfCompletionWeek = new Date(completionDate);
      const completionDayOfWeek = startOfCompletionWeek.getDay();
      const completionDaysUntilMonday = completionDayOfWeek === 0 ? 6 : completionDayOfWeek - 1;
      startOfCompletionWeek.setDate(startOfCompletionWeek.getDate() - completionDaysUntilMonday);
      startOfCompletionWeek.setHours(0, 0, 0, 0);
      
      const isSameWeek = startOfThisWeek.getTime() === startOfCompletionWeek.getTime();
      console.log(`🔍 Weekly habit ${habitBusiness.business_name}: this week=${startOfThisWeek.toDateString()}, completion week=${startOfCompletionWeek.toDateString()}, same=${isSameWeek}, progress=${currentProgress}, goal=${goalValue}`);
      
      return isSameWeek;
    }
    
    return false;
  }

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
      
      // Show error toast
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      const errorToast = await this.toastController.create({
        message: `❌ Failed to undo completion: ${errorMessage}`,
        duration: 3000,
        position: 'top',
        color: 'danger'
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
      // Show modern alert with inputs instead of native prompts
      const alert = await this.alertController.create({
        header: 'Edit Habit Business',
        message: 'Update your habit business details:',
        inputs: [
          {
            name: 'businessName',
            type: 'text',
            placeholder: 'Enter business name',
            label: 'Business Name',
            value: habitBusiness.business_name
          },
          {
            name: 'habitDescription',
            type: 'textarea',
            placeholder: 'Enter habit description',
            label: 'Habit Description',
            value: habitBusiness.habit_description
          },
          {
            name: 'frequency',
            type: 'radio',
            label: 'Daily (Every Day 🔥)',
            value: 'daily',
            checked: habitBusiness.frequency === 'daily'
          },
          {
            name: 'frequency',
            type: 'radio',
            label: 'Weekly (Every Week 📅)',
            value: 'weekly',
            checked: habitBusiness.frequency === 'weekly'
          },
          {
            name: 'goalValue',
            type: 'number',
            placeholder: 'Enter goal (1-99)',
            label: `Completion Goal (per ${habitBusiness.frequency || 'period'})`,
            value: habitBusiness.goal_value?.toString() || '1',
            min: 1,
            max: 99
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Save',
            handler: async (data) => {
              try {
                // Validate inputs
                if (!data.businessName?.trim()) {
                  const errorToast = await this.toastController.create({
                    message: '❌ Business name cannot be empty!',
                    duration: 2000,
                    position: 'top',
                    color: 'danger'
                  });
                  await errorToast.present();
                  return false; // Keep alert open
                }

                if (!data.habitDescription?.trim()) {
                  const errorToast = await this.toastController.create({
                    message: '❌ Habit description cannot be empty!',
                    duration: 2000,
                    position: 'top',
                    color: 'danger'
                  });
                  await errorToast.present();
                  return false; // Keep alert open
                }

                if (!data.frequency || (data.frequency !== 'daily' && data.frequency !== 'weekly')) {
                  const errorToast = await this.toastController.create({
                    message: '❌ Please select a frequency (daily or weekly)!',
                    duration: 2000,
                    position: 'top',
                    color: 'danger'
                  });
                  await errorToast.present();
                  return false; // Keep alert open
                }

                // Validate goal value
                const goalValue = parseInt(data.goalValue, 10);
                if (isNaN(goalValue) || goalValue < 1 || goalValue > 99) {
                  const errorToast = await this.toastController.create({
                    message: '❌ Daily completion goal must be between 1 and 99!',
                    duration: 2000,
                    position: 'top',
                    color: 'danger'
                  });
                  await errorToast.present();
                  return false; // Keep alert open
                }

                // Update the habit business
                await this.habitBusinessService.updateHabitBusiness(habitBusiness.id, {
                  business_name: data.businessName.trim(),
                  habit_description: data.habitDescription.trim(),
                  frequency: data.frequency as 'daily' | 'weekly',
                  goal_value: goalValue
                });

                // Show success toast
                const successToast = await this.toastController.create({
                  message: `✅ Habit business "${data.businessName}" updated successfully!`,
                  duration: 2000,
                  position: 'top',
                  color: 'success'
                });
                await successToast.present();

                // Reload dashboard data to show updated information
                await this.loadDashboardData();

                return true; // Close alert
              } catch (error) {
                console.error('Error editing habit business:', error);
                
                const errorMessage = (error as any)?.message || 'Unknown error occurred';
                const errorToast = await this.toastController.create({
                  message: `❌ Failed to update habit business: ${errorMessage}`,
                  duration: 3000,
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

    } catch (error) {
      console.error('Error creating edit alert:', error);
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
    const currentStreak = habitBusiness.streak || 0;
    
    // Calculate what the next completion will earn using Option A logic
    // The service increments streak first, then applies conservative multiplier
    // So we need to show earnings for (currentStreak + 1)
    const nextStreak = currentStreak + 1;
    
    // Day 1: $1.00 (0x bonus), Day 2: $1.10 (0.1x bonus), Day 3: $1.20 (0.2x bonus), etc.
    const streakMultiplier = nextStreak === 1 ? 0 : (nextStreak - 1) * 0.1;
    const baseTotal = baseEarnings + (baseEarnings * streakMultiplier);
    const streakBonus = baseTotal - baseEarnings; // The bonus amount
    
    // For stock boost, we'll estimate based on typical patterns
    // TODO: Fetch actual stock data for precise calculation
    let stockBoost = 0;
    
    const totalEarnings = baseTotal + stockBoost;
    
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
        getValue: () => this.pendingHabitsCount.toString(),
        label: 'Pending Habits'
      },
      {
        icon: 'business',
        color: 'success',
        getValue: () => '$' + this.todaysEarnings.toFixed(2),
        label: "Today's Habit Earnings"
      },
      {
        icon: 'wallet',
        color: 'secondary',
        getValue: () => '$' + this.todaysStockEarnings.toFixed(2),
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

  ngOnDestroy() {
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
      await this.completeHabitBusiness(habitBusiness);
      
      // Reset state after completion
      state.isCompleting = false;
      state.progress = 0;
    }, 300);
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
   * Format large numbers for display (1M, 1.1M, 1B, etc.)
   */
  formatLargeNumber(amount: number): string {
    if (amount >= 1000000000) {
      // Billions
      const billions = amount / 1000000000;
      return billions >= 10 ? `${Math.floor(billions)}B` : `${billions.toFixed(1)}B`;
    } else if (amount >= 1000000) {
      // Millions
      const millions = amount / 1000000;
      return millions >= 10 ? `${Math.floor(millions)}M` : `${millions.toFixed(1)}M`;
    } else {
      // Less than 1 million, show exact amount with commas for readability
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  /**
   * Get displayed cash amount (formatted or exact)
   */
  getDisplayedCash(): string {
    const cash = this.userProfile?.cash || 0;
    if (cash >= 1000000 && !this.showDetailedCash) {
      return this.formatLargeNumber(cash);
    }
    return cash.toFixed(2);
  }

  /**
   * Get displayed net worth amount (formatted or exact)
   */
  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000000 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toFixed(2);
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
      
      const errorToast = await this.toastController.create({
        message: `❌ Failed to undo completion: ${(error as any)?.message || 'Unknown error'}`,
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await errorToast.present();
    }
  }
}
