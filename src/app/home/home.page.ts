import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonBadge, IonInput, IonSkeletonText, ToastController, AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { JointVentureService, JointVentureStatusRow } from '../services/joint-venture.service';
import { OfflineQueueService } from '../services/offline-queue.service';
import { HabitCacheService } from '../services/habit-cache.service';
import { HabitUpdateService } from '../services/habit-update.service';
import { HabitIntervalService } from '../services/habit-interval.service';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { HabitCardComponent } from '../shared/components/habit-card/habit-card.component';
import { addIcons } from 'ionicons';
import { alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, trendingUpOutline, wallet, cash, logoUsd, settings, helpCircle, close, analytics, shield } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonButton, IonCard, IonCardContent, IonIcon, IonInput, IonSkeletonText, CommonModule, FormsModule, RouterLink, BottomNavComponent, HabitCardComponent],
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

  // Joint venture: today's per-co-owner check-in roster, keyed by habit_business_id.
  // Drives the "waiting on Bob, Carol" strip and the check-in button's checked state.
  jvStatusByBusinessId: Record<string, JointVentureStatusRow[]> = {};
  
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

  // Actions queued while offline, waiting to sync (see OfflineQueueService)
  pendingSyncCount = 0;
  private pendingSyncSub?: Subscription;
  private habitCreatedSub?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private habitBusinessService: HabitBusinessService,
    private habitUpdateService: HabitUpdateService,
    private toastController: ToastController,
    private alertController: AlertController,
    private habitIntervalService: HabitIntervalService,
    private offlineQueueService: OfflineQueueService,
    private habitCacheService: HabitCacheService,
    private jointVentureService: JointVentureService
  ) {
    addIcons({ alertCircle, refresh, construct, addCircle, business, calendar, calendarOutline, time, ellipseOutline, add, lockClosed, logIn, trendingUpOutline, wallet, cash, logoUsd, settings, helpCircle, close, analytics, shield });
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
  }

  // Refresh data whenever the page is entered
  ionViewWillEnter() {
    // Set a new random tagline each time the page is entered
    this.setRandomTagline();

    if (!this.isLoading) {
      this.loadCurrentUser();
    }
  }

  /**
   * Reflects an offline-queued action's optimistic cache update in the UI
   * immediately, instead of leaving the screen stale until the device is
   * back online. Safe to call while offline: getUserHabitBusinesses/
   * getTodaysHabits fall back to the (just-updated) cache when the network
   * call fails, so this doesn't throw.
   */
  private async refreshAfterOfflineQueue() {
    const cachedProfile = await this.habitCacheService.getProfile();
    if (cachedProfile) {
      this.userProfile = { ...this.userProfile, ...cachedProfile };
    }
    await this.loadDashboardData();
  }

  /**
   * Refresh user profile data without reloading everything
   */
  async refreshUserProfile() {
    if (!this.currentUser) return;
    
    try {
      this.userProfile = await this.authService.getUserProfile(this.currentUser.id);
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
    }
  }

  async loadCurrentUser() {
    if (this.isLoading) {
      return;
    }
    
    this.isLoading = true;
    try {
      const { data: { user } } = await this.authService.getUser();
      this.currentUser = user;

      if (!user) {
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

      try {
        this.userProfile = await this.authService.ensureUserProfileExists(user);
      } catch (error) {
        console.error('Profile creation/loading failed:', error);
        // Most likely offline — fall back to the last synced profile snapshot
        // instead of a hardcoded $100 starting balance, so cash/net worth
        // don't visibly reset every time the app opens without connectivity.
        const cachedProfile = await this.habitCacheService.getProfile();
        this.userProfile = cachedProfile || {
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
      console.error('Auth error details:', error);
      this.hasCheckedAuth = true;

      // Clear any data that might have been loaded
      this.habitBusinesses = [];
      this.userProfile = null;
      this.currentUser = null;

      // Only redirect to login after a brief delay to avoid immediate redirect
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    } finally {
      this.isLoading = false;
    }
  }

  async loadDashboardData() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      if (this.currentUser) {
        // Reset any outdated daily habits first to ensure accurate counts
        try {
          await this.habitBusinessService.resetOutdatedDailyHabits();
          
          // ✨ NEW: Reset habit order to custom order when habits are reset (new day/week)
          await this.resetHabitsToCustomOrder();
        } catch (resetError) {
          console.warn('⚠️ Non-critical error resetting outdated habits:', resetError);
        }
        
        // Settle any of this user's own joint-venture invites/upgrades/deletion
        // votes that passed their 24h window since the last visit (no cron in
        // this app — expiry always resolves lazily like the existing
        // Marketplace listing expiry does). Awaited first so a just-expired
        // proposal doesn't still show as a live business below.
        try {
          await this.jointVentureService.resolveAllExpired(this.currentUser.id);
        } catch (jvResolveError) {
          console.warn('⚠️ Non-critical error resolving expired joint ventures:', jvResolveError);
        }

        // Load actual habit-business data. getUserHabitBusinesses() is left
        // completely unmodified (still every non-JV business, plus any JV
        // business where this user happens to be the creator, since its row's
        // user_id is always the creator) — joint ventures this user co-owns
        // but didn't create are fetched separately and merged in, so the
        // heavily-used base query's own risk profile never changes.
        const [ownBusinesses, jvBusinesses] = await Promise.all([
          this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id),
          this.jointVentureService.getJointVentureBusinessesForCoOwner(this.currentUser.id)
        ]);
        const seenIds = new Set(ownBusinesses.map(hb => hb.id));
        this.habitBusinesses = [...ownBusinesses, ...jvBusinesses.filter(hb => !seenIds.has(hb.id))];

        // Today's per-co-owner check-in roster for every joint venture on this
        // dashboard — drives the "waiting on Bob, Carol" status strip.
        const jvIds = this.habitBusinesses.filter(hb => hb.is_joint_venture).map(hb => hb.id);
        if (jvIds.length > 0) {
          try {
            const statusRows = await this.jointVentureService.getStatus(jvIds);
            const grouped: Record<string, JointVentureStatusRow[]> = {};
            for (const row of statusRows) {
              (grouped[row.habit_business_id] ||= []).push(row);
            }
            this.jvStatusByBusinessId = grouped;
          } catch (jvStatusError) {
            console.error('❌ Error loading joint venture status (non-critical):', jvStatusError);
            this.jvStatusByBusinessId = {};
          }
        } else {
          this.jvStatusByBusinessId = {};
        }

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
          return !isCompleted;
        }).length;
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
    this.router.navigate(['/create-habit']);
  }

  /**
   * Check if a multi-completion habit has reached its goal for the current period.
   */
  isGoalCompleted(habitBusiness: HabitBusiness): boolean {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(habitBusiness);
  }

  /**
   * Whether a habit-business should show in the "Done" group. For joint
   * ventures this is the current user's own check-in for today, not
   * whether every co-owner has checked in — a JV habit shouldn't sit in
   * the way of a user's remaining to-dos just because a co-owner hasn't
   * gotten to it yet.
   */
  isDoneForDisplay(habitBusiness: HabitBusiness): boolean {
    if (habitBusiness.is_joint_venture) {
      const rows = this.jvStatusByBusinessId[habitBusiness.id] || [];
      const mine = rows.find(r => r.co_owner_id === this.currentUser?.id);
      return !!mine?.checked_in_today;
    }
    return this.isGoalCompleted(habitBusiness);
  }

  /** Habit-businesses not yet completed for the current period, in display order. */
  get todoHabitBusinesses(): HabitBusiness[] {
    return this.habitBusinesses.filter(hb => !this.isDoneForDisplay(hb));
  }

  /** Habit-businesses completed for the current period, in display order. */
  get doneHabitBusinesses(): HabitBusiness[] {
    return this.habitBusinesses.filter(hb => this.isDoneForDisplay(hb));
  }

  /** *ngFor trackBy for habit-business cards — keeps DOM nodes stable across reloads (fresh objects each fetch) instead of destroying/recreating every card. */
  trackByHabitBusinessId(_index: number, hb: HabitBusiness): string {
    return hb.id;
  }

  /**
   * Toggle the inline 365-day habit grid for a specific habit business.
   * Only one card's grid is ever open at once.
   */
  toggleHabitGrid(habitBusiness: HabitBusiness) {
    const currentState = this.expandedGrids[habitBusiness.id] || false;
    this.expandedGrids = {};
    this.expandedGrids[habitBusiness.id] = !currentState;
  }

  // Track which habits have their 365-day grid expanded
  expandedGrids: { [key: string]: boolean } = {};

  // Stock ownership pay-boost percentage per habit business (1% per share purchased by investors)
  stockBoostByBusinessId: { [habitBusinessId: string]: number } = {};

  ngOnInit() {
    this.pendingSyncSub = this.offlineQueueService.pendingCount$.subscribe(
      count => (this.pendingSyncCount = count)
    );
    // Refresh reactively whenever a habit changes elsewhere: a business
    // launched from elsewhere (e.g. the bottom-nav "+" button while already
    // on /home never navigates, so ionViewWillEnter won't refire), or a
    // completion/undo pushed in by HabitRealtimeService from another
    // signed-in device — without this, cash/streak/pending-count here stay
    // stale until the user manually navigates back to this page.
    this.habitCreatedSub = this.habitUpdateService.updates$.subscribe(event => {
      if (event && !this.isLoading) {
        this.loadDashboardData();
      }
    });
  }

  ngOnDestroy() {
    this.pendingSyncSub?.unsubscribe();
    this.habitCreatedSub?.unsubscribe();
  }

  /** A habit-card action (complete/undo/delete/upgrade/edit/JV) landed successfully — refresh cash + the dashboard list. */
  async onCardChanged() {
    await this.loadCurrentUser();
    await this.loadDashboardData();
  }

  /** A habit-card action was queued offline instead of completing immediately — reflect its optimistic cache update right away. */
  async onCardOfflineQueued() {
    await this.refreshAfterOfflineQueue();
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
   * Abbreviate a number to K/M/B/T using standard rounding (e.g. 3,432,000 ->
   * "3M", 3,600,000 -> "4M"). `decimals` controls precision (e.g. 1 ->
   * "58.6K", 0 -> "59K") - lower it for cards where an extra digit (or a
   * leading "+"/"-") would overflow.
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
    let rounded = Math.round(scaled * factor) / factor;
    // Rounding up can push a value like 999.99K to 1000K - roll it into the next unit
    if (rounded >= 1000 && unitIndex < units.length - 1) {
      rounded = Math.round((rounded / 1000) * factor) / factor;
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
   * Move a habit-business up or down within its own group (to-do or done).
   */
  async moveHabitBusiness(habitBusiness: HabitBusiness, direction: 'up' | 'down') {
    const group = this.isDoneForDisplay(habitBusiness) ? this.doneHabitBusinesses : this.todoHabitBusinesses;
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
