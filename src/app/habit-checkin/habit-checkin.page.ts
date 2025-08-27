import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { HabitBusinessService, HabitBusiness, UpgradeCalculation, BusinessStock, StockHolding } from '../services/habit-business.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, 
  checkmark,
  cash, 
  calendar, 
  list, 
  calendarOutline, 
  trendingUp, 
  trendingDown,
  add,
  flame, 
  business, 
  trophy, addCircle } from 'ionicons/icons';

interface HabitWithCompletion extends HabitBusiness {
  completedToday?: boolean;
  completed_today?: boolean;  // Also support snake_case for template
  completedThisWeek?: boolean;
  potentialEarnings?: number;
  upgradeOptions?: UpgradeCalculation;
  stockInfo?: BusinessStock;
  stockInvestors?: number;
}

interface StockDisplay extends StockHolding {
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

@Component({
  selector: 'app-habit-checkin',
  templateUrl: './habit-checkin.page.html',
  styleUrls: ['./habit-checkin.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonSpinner,
    CommonModule, 
    FormsModule,
    RouterLink
  ]
})
export class HabitCheckinPage implements OnInit {
  loading = true;
  currentUser: any = null;
  userProfile: any = null;
  
  // Habit data
  todaysHabits: HabitWithCompletion[] = [];
  weeklyHabits: HabitWithCompletion[] = [];
  
  // UI state
  completingHabitId: string | null = null;
  
  // Stats
  todaysDate: string = '';
  completedToday = 0;
  totalHabits = 0;
  dailyEarnings = 0;
  activeStreaks = 0;
  
  // Additional template properties
  today: Date = new Date();
  totalActiveStreaks: number = 0;
  todaysEarnings: number = 0;
  completing: boolean = false;
  showAchievement: boolean = false;
  achievementMessage: string = '';
  
  // Stock and upgrade data
  userStockHoldings: StockDisplay[] = [];
  availableStocks: BusinessStock[] = [];
  showUpgradeOptions: { [habitId: string]: boolean } = {};
  showStockInfo: { [habitId: string]: boolean } = {};
  
  // Expose Math to template
  Math = Math;

  constructor(
    private habitBusinessService: HabitBusinessService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({flame,checkmarkCircle,business,trendingUp,add,addCircle,trophy,checkmark,cash,calendar,list,calendarOutline,trendingDown});
  }

  async ngOnInit() {
    await this.loadUserAndHabits();
    await this.loadStockData();
    this.setupDate();
  }

  private setupDate() {
    const today = new Date();
    this.todaysDate = today.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  async loadUserAndHabits() {
    this.loading = true;
    try {
      // Load current user
      const { data: { user } } = await this.authService.getUser();
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      
      this.currentUser = user;
      
      // Load user profile
      try {
        this.userProfile = await this.authService.getUserProfile(user.id);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      
      // Load all habit-businesses
      const allHabits = await this.habitBusinessService.getUserHabitBusinesses(user.id);
      
      // Separate daily and weekly habits
      this.todaysHabits = allHabits
        .filter(habit => habit.frequency === 'daily')
        .map(habit => this.addCompletionStatus(habit));
        
      this.weeklyHabits = allHabits
        .filter(habit => habit.frequency === 'weekly')
        .map(habit => this.addCompletionStatus(habit));
      
      // Calculate stats
      this.calculateStats();
      
    } catch (error) {
      console.error('Error loading habits:', error);
      await this.showToast('Error loading habits. Please try again.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  private addCompletionStatus(habit: HabitBusiness): HabitWithCompletion {
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = habit.last_completed_at ? 
      new Date(habit.last_completed_at).toISOString().split('T')[0] : null;
    
    let completedToday = false;
    let completedThisWeek = false;
    
    if (habit.frequency === 'daily') {
      completedToday = lastCompleted === today;
    } else if (habit.frequency === 'weekly') {
      // Check if completed this week (last 7 days)
      if (habit.last_completed_at) {
        const lastCompletedDate = new Date(habit.last_completed_at);
        const now = new Date();
        const daysDiff = (now.getTime() - lastCompletedDate.getTime()) / (1000 * 3600 * 24);
        completedThisWeek = daysDiff < 7;
      }
    }
    
    // Calculate potential earnings with streak multiplier
    const nextStreak = habit.streak + 1;
    // Day 1: $1.00 (0x bonus), Day 2: $1.10 (0.1x bonus), Day 3: $1.20 (0.2x bonus), etc.
    const streakMultiplier = nextStreak === 1 ? 0 : (nextStreak - 1) * 0.1;
    const potentialEarnings = habit.earnings_per_completion + (habit.earnings_per_completion * streakMultiplier);
    
    return {
      ...habit,
      completedToday,
      completed_today: completedToday,  // For template compatibility
      completedThisWeek,
      potentialEarnings
    };
  }

  private calculateStats() {
    this.totalHabits = this.todaysHabits.length;
    this.completedToday = this.todaysHabits.filter(h => h.completedToday).length;
    this.activeStreaks = [...this.todaysHabits, ...this.weeklyHabits]
      .filter(h => h.streak > 0).length;
    
    // Set aliases for template
    this.totalActiveStreaks = this.activeStreaks;
    
    // Calculate daily earnings (only for habits completed today)
    this.dailyEarnings = this.todaysHabits
      .filter(h => h.completedToday)
      .reduce((total, habit) => {
        // Day 1: 0x bonus, Day 2: 0.1x bonus, etc.
        const streakMultiplier = habit.streak === 1 ? 0 : (habit.streak - 1) * 0.1;
        const earnings = habit.earnings_per_completion + (habit.earnings_per_completion * streakMultiplier);
        return total + earnings;
      }, 0);
      
    this.todaysEarnings = this.dailyEarnings;
  }

  async completeHabit(habit: HabitWithCompletion) {
    if (this.completingHabitId) return; // Prevent double-clicks
    
    try {
      this.completingHabitId = habit.id;
      this.completing = true;
      
      // Show confirmation for high-value habits
      if (habit.potentialEarnings! > 1000) {
        const alert = await this.alertController.create({
          header: 'Complete Habit',
          message: `Complete "${habit.habit_description}" and earn $${habit.potentialEarnings}?`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Complete',
              handler: () => this.executeHabitCompletion(habit)
            }
          ]
        });
        await alert.present();
      } else {
        await this.executeHabitCompletion(habit);
      }
      
    } catch (error) {
      console.error('Error in completeHabit:', error);
      await this.showToast('Failed to complete habit. Please try again.', 'danger');
    } finally {
      this.completingHabitId = null;
      this.completing = false;
    }
  }

  private async executeHabitCompletion(habit: HabitWithCompletion) {
    try {
      await this.habitBusinessService.completeHabit(habit.id);
      
      // Show success message with earnings
      const nextStreak = habit.streak + 1;
      const streakMultiplier = nextStreak === 1 ? 0 : (nextStreak - 1) * 0.1;
      const earnings = habit.earnings_per_completion + (habit.earnings_per_completion * streakMultiplier);
      await this.showToast(
        `🎉 Habit completed! You earned $${earnings} (Day ${nextStreak})`, 
        'success'
      );
      
      // Reload data to reflect changes
      await this.loadUserAndHabits();
      
    } catch (error: any) {
      console.error('Error completing habit:', error);
      const message = error.message || 'Failed to complete habit';
      await this.showToast(message, 'danger');
    }
  }

  getNextMilestone(currentStreak: number): number {
    const milestones = [7, 14, 30, 60, 100, 365];
    return milestones.find(milestone => milestone > currentStreak) || currentStreak + 100;
  }

  calculateEarnings(habit: HabitWithCompletion): number {
    const nextStreak = habit.streak + 1;
    const streakMultiplier = nextStreak === 1 ? 0 : (nextStreak - 1) * 0.1;
    return habit.earnings_per_completion + (habit.earnings_per_completion * streakMultiplier);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  // Stock and upgrade functionality
  async loadStockData() {
    if (!this.currentUser) return;
    
    try {
      // Load user's stock holdings
      const holdings = await this.habitBusinessService.getUserStockHoldings(this.currentUser.id);
      this.userStockHoldings = holdings.map(holding => ({
        ...holding,
        currentValue: holding.shares_owned * (holding.business_stocks?.current_stock_price || 0),
        profitLoss: (holding.shares_owned * (holding.business_stocks?.current_stock_price || 0)) - holding.total_invested,
        profitLossPercentage: holding.total_invested > 0 ? 
          (((holding.shares_owned * (holding.business_stocks?.current_stock_price || 0)) - holding.total_invested) / holding.total_invested) * 100 : 0
      }));
      
      // Load available stocks
      this.availableStocks = await this.habitBusinessService.getAvailableStocks(this.currentUser.id);
      
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  }

  async loadUpgradeOptions(habit: HabitWithCompletion) {
    try {
      const upgradeOptions = await this.habitBusinessService.calculateUpgradeOptions(habit.id);
      habit.upgradeOptions = upgradeOptions;
      
      // Load stock info for this business
      const stockInfo = this.availableStocks.find(stock => stock.habit_business_id === habit.id);
      if (stockInfo) {
        habit.stockInfo = stockInfo;
        // Count investors (shares owned by others)
        habit.stockInvestors = stockInfo.total_shares_issued - stockInfo.shares_owned_by_owner;
      }
      
    } catch (error) {
      console.error('Error loading upgrade options:', error);
      await this.showToast('Error loading upgrade options', 'danger');
    }
  }

  async toggleUpgradeOptions(habit: HabitWithCompletion) {
    const isCurrentlyShown = this.showUpgradeOptions[habit.id];
    
    if (!isCurrentlyShown) {
      await this.loadUpgradeOptions(habit);
    }
    
    this.showUpgradeOptions[habit.id] = !isCurrentlyShown;
  }

  async toggleStockInfo(habit: HabitWithCompletion) {
    const isCurrentlyShown = this.showStockInfo[habit.id];
    
    if (!isCurrentlyShown) {
      await this.loadUpgradeOptions(habit);
    }
    
    this.showStockInfo[habit.id] = !isCurrentlyShown;
  }

  async upgradeBusiness(habit: HabitWithCompletion, newBusinessTypeId: number) {
    try {
      const alert = await this.alertController.create({
        header: 'Upgrade Business',
        message: `Are you sure you want to upgrade your business? This will reset your streak but convert its value to cash.`,
        inputs: [
          {
            name: 'businessName',
            type: 'text',
            placeholder: 'New business name',
            value: habit.business_name
          },
          {
            name: 'habitDescription',
            type: 'text',
            placeholder: 'New habit description',
            value: habit.habit_description
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Upgrade',
            handler: async (data) => {
              if (!data.businessName || !data.habitDescription) {
                await this.showToast('Please fill in all fields', 'danger');
                return false;
              }
              
              try {
                await this.habitBusinessService.upgradeBusiness(
                  habit.id,
                  newBusinessTypeId,
                  data.businessName,
                  data.habitDescription
                );
                
                await this.showToast('Business upgraded successfully! 🚀', 'success');
                await this.loadUserAndHabits();
                await this.loadStockData();
                
              } catch (error: any) {
                await this.showToast(error.message || 'Upgrade failed', 'danger');
              }
              
              return true;
            }
          }
        ]
      });
      
      await alert.present();
      
    } catch (error) {
      console.error('Error upgrading business:', error);
      await this.showToast('Error upgrading business', 'danger');
    }
  }

  async purchaseStock(stock: BusinessStock) {
    try {
      const alert = await this.alertController.create({
        header: 'Purchase Stock',
        message: `Buy shares in this business at $${stock.current_stock_price} per share`,
        inputs: [
          {
            name: 'shares',
            type: 'number',
            placeholder: 'Number of shares',
            min: 1,
            max: stock.shares_available
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Buy',
            handler: async (data) => {
              const shares = parseInt(data.shares);
              if (!shares || shares < 1 || shares > stock.shares_available) {
                await this.showToast('Invalid number of shares', 'danger');
                return false;
              }
              
              const totalCost = shares * stock.current_stock_price;
              if (this.userProfile.cash < totalCost) {
                await this.showToast(`Insufficient funds. Need $${totalCost}`, 'danger');
                return false;
              }
              
              try {
                await this.habitBusinessService.purchaseStock(stock.id, shares);
                await this.showToast(`Purchased ${shares} shares for $${totalCost}! 📈`, 'success');
                await this.loadStockData();
                
                // Reload user profile to update cash
                this.userProfile = await this.authService.getUserProfile(this.currentUser.id);
                
              } catch (error: any) {
                await this.showToast(error.message || 'Purchase failed', 'danger');
              }
              
              return true;
            }
          }
        ]
      });
      
      await alert.present();
      
    } catch (error) {
      console.error('Error purchasing stock:', error);
      await this.showToast('Error purchasing stock', 'danger');
    }
  }

  // Helper methods for template
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  }

  getStockTrendIcon(profitLoss: number): string {
    return profitLoss >= 0 ? 'trending-up' : 'trending-down';
  }

  getStockTrendColor(profitLoss: number): string {
    return profitLoss >= 0 ? 'success' : 'danger';
  }
}
