import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent,
  IonButton, IonIcon, IonBadge, IonSpinner,
  IonModal, IonButtons, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { HabitGridComponent } from '../shared/components/habit-grid/habit-grid.component';
import { HabitBusinessService } from '../services/habit-business.service';
import { SocialService } from '../services/social.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  arrowBack, trendingUp, trendingDown, star, business, 
  cash, checkmarkCircle, alertCircle, funnel, closeCircle, 
  settings, logOut, trendingUpOutline, pieChartOutline, 
  swapHorizontal, helpCircle, close, addCircle, pieChart, 
  wallet, removeCircle, add, remove, chevronBack, 
  chevronForward, helpCircleOutline
} from 'ionicons/icons';

interface FriendBusiness {
  id: string;
  businessName: string;
  businessIcon: string;
  ownerName: string;
  ownerId: string;
  streak: number;
  frequency: string;
  goalValue: number;
  currentProgress: number;
  earningsPerCompletion: number;
  stockId: string | null;
  stockPrice: number;
  basePrice: number;
  priceMultiplier: number;
  sharesAvailable: number;
  totalShares: number;
  potentialDividend: number;
}

interface Portfolio {
  id: string;
  stockId: string;
  businessId: string;
  businessName: string;
  businessIcon: string;
  ownerName: string;
  ownerId: string;
  sharesOwned: number;
  averagePurchasePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  totalDividendsEarned: number;
  dailyDividendRate: number;
  businessStreak: number;
}

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.page.html',
  styleUrls: ['./stocks.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardContent,
    IonButton, IonIcon, IonBadge, IonSpinner,
    IonModal, IonButtons, IonItem, IonLabel, IonInput,
    IonSelect, IonSelectOption,
    BottomNavComponent, HabitGridComponent
  ]
})
export class StocksPage implements OnInit, OnDestroy {
  selectedTab: 'available' | 'portfolio' = 'available';
  friendBusinesses: FriendBusiness[] = [];
  portfolio: Portfolio[] = [];
  isLoading = false;
  currentUser: any = null;
  userProfile: any = null;
  sellQuantities: { [stockId: string]: number } = {};
  showHelpSection = false;
  showPortfolioHelpSection = false;
  selectedQuantities: { [stockId: string]: number } = {};
  todaysActualDividends = 0;
  
  // Toggle states for amount display
  showDetailedNetWorth = false;
  showDetailedCash = false;
  
  // Portfolio stats carousel properties
  currentStatIndex = 0;
  autoCarouselInterval: any = null;
  isMobileScreen = false;
  isMediumSmallScreen = false;
  isMediumLargeScreen = false;
  portfolioStats: any[] = [];
  
  // Grid display properties
  weeksToShow = 26; // Default weeks to show
  
  // Sell modal properties
  showSellModal = false;
  selectedHolding: any = null;
  sellQuantity = 0;
  
  // Reminder tracking properties
  dailyReminders: { [businessId: string]: string } = {}; // businessId -> date sent
  habitCompletionStatus: { [businessId: string]: boolean } = {}; // businessId -> completed status
  
  // Filter properties
  selectedOwnerFilter: string = '';
  
  constructor(
    private router: Router,
    private habitBusinessService: HabitBusinessService,
    private socialService: SocialService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Register icons
    addIcons({funnel,closeCircle,settings,logOut,trendingUpOutline,pieChartOutline,swapHorizontal,helpCircle,trendingUp,close,addCircle,pieChart,wallet,trendingDown,removeCircle,helpCircleOutline,chevronBack,chevronForward,remove,add,arrowBack,star,business,cash,checkmarkCircle,alertCircle});
  }

  async ngOnInit() {
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem('stocks-active-tab');
    if (savedTab === 'portfolio' || savedTab === 'available') {
      this.selectedTab = savedTab;
    }
    
    // Load saved owner filter from localStorage
    const savedOwnerFilter = localStorage.getItem('stocks-owner-filter');
    if (savedOwnerFilter) {
      this.selectedOwnerFilter = savedOwnerFilter;
    }
    
    // Check initial screen size and setup carousel
    this.checkScreenSize();
    this.setupPortfolioStats();
    
    await this.loadCurrentUser();
    await this.loadData();
  }

  ngOnDestroy() {
    this.stopAutoCarousel();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobileScreen = width <= 768;
    this.isMediumSmallScreen = width > 768 && width <= 1024;
    this.isMediumLargeScreen = width > 1024 && width <= 1400;
    
    // Set weeks to show based on screen size with better breakpoints
    if (this.isMobileScreen) {
      this.weeksToShow = 13; // 3 months for mobile (13 weeks = ~3 months)
      console.log('📱 MOBILE screen detected:', width + 'px - Setting weeks to:', this.weeksToShow);
    } else if (this.isMediumSmallScreen) {
      this.weeksToShow = 17; // 4 months for small-medium screens (17 weeks = ~4 months)
      console.log('🔍 SMALL-MEDIUM screen detected:', width + 'px - Setting weeks to:', this.weeksToShow);
    } else if (this.isMediumLargeScreen) {
      this.weeksToShow = 26; // 6 months for medium-large screens (26 weeks = ~6 months)
      console.log('� MEDIUM-LARGE screen detected:', width + 'px - Setting weeks to:', this.weeksToShow);
    } else {
      this.weeksToShow = 53; // Full year for large screens (53 weeks = full year)
      console.log('🖥️ LARGE screen detected:', width + 'px - Setting weeks to:', this.weeksToShow, '(FULL YEAR)');
    }
    
    if (this.isMobileScreen && this.selectedTab === 'portfolio' && this.portfolio.length > 0) {
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }

  private setupPortfolioStats() {
    this.portfolioStats = [
      {
        icon: 'wallet',
        color: 'secondary',
        getValue: () => this.getTotalDailyDividends().toFixed(2),
        label: "Today's Actual Dividends"
      },
      {
        icon: 'wallet', 
        color: 'primary',
        getValue: () => this.getTotalPortfolioValue().toFixed(2),
        label: 'Portfolio Value'
      },
      {
        icon: 'trending-up',
        getColor: () => this.getTotalPortfolioProfitLoss() >= 0 ? 'success' : 'danger',
        getValue: () => `${this.getTotalPortfolioProfitLoss() >= 0 ? '+' : ''}$${this.getTotalPortfolioProfitLoss().toFixed(2)}`,
        label: 'All-Time Gains',
        getClass: () => this.getTotalPortfolioProfitLoss() >= 0 ? 'profit' : 'loss'
      },
      {
        icon: 'trending-up',
        color: 'primary', 
        getValue: () => this.userProfile?.net_worth || '0.00',
        label: 'Net Worth'
      }
    ];
  }

  private startAutoCarousel() {
    this.stopAutoCarousel();
    this.autoCarouselInterval = setInterval(() => {
      this.nextStat();
    }, 8000); // Change every 8 seconds
  }

  stopAutoCarousel() {
    if (this.autoCarouselInterval) {
      clearInterval(this.autoCarouselInterval);
      this.autoCarouselInterval = null;
    }
  }

  nextStat() {
    this.currentStatIndex = (this.currentStatIndex + 1) % this.portfolioStats.length;
  }

  previousStat() {
    this.currentStatIndex = this.currentStatIndex === 0 
      ? this.portfolioStats.length - 1 
      : this.currentStatIndex - 1;
  }

  onStatTouchStart(event: TouchEvent) {
    this.stopAutoCarousel(); // Stop auto-rotation when user interacts
  }

  onStatTouchEnd(event: TouchEvent) {
    // Restart auto-rotation after user interaction
    if (this.isMobileScreen && this.selectedTab === 'portfolio' && this.portfolio.length > 0) {
      setTimeout(() => this.startAutoCarousel(), 2000);
    }
  }

  selectTab(tab: 'available' | 'portfolio') {
    this.selectedTab = tab;
    localStorage.setItem('stocks-active-tab', tab);
    
    // Handle carousel for portfolio tab
    if (tab === 'portfolio' && this.isMobileScreen && this.portfolio.length > 0) {
      this.setupPortfolioStats();
      this.startAutoCarousel();
    } else {
      this.stopAutoCarousel();
    }
  }

  toggleMobileTab() {
    const newTab = this.selectedTab === 'available' ? 'portfolio' : 'available';
    this.selectTab(newTab);
  }

  toggleHelpSection() {
    this.showHelpSection = !this.showHelpSection;
  }

  togglePortfolioHelpSection() {
    this.showPortfolioHelpSection = !this.showPortfolioHelpSection;
  }

  async loadCurrentUser() {
    try {
      const { data: { user } } = await this.authService.getUser();
      this.currentUser = user;
      
      if (user?.id) {
        this.userProfile = await this.authService.getUserProfile(user.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  async loadData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadFriendBusinesses(),
        this.loadPortfolio()
      ]);
      
      // Load reminder history after portfolio data is loaded
      this.loadReminderHistory();
      
      // Setup carousel after data is loaded
      if (this.selectedTab === 'portfolio' && this.isMobileScreen && this.portfolio.length > 0) {
        this.setupPortfolioStats();
        this.startAutoCarousel();
      }
    } catch (error) {
      console.error('Error loading stocks data:', error);
    }
    this.isLoading = false;
  }

  async loadFriendBusinesses() {
    if (!this.currentUser?.id) {
      console.log('No current user for loading friend businesses');
      return;
    }

    try {
      this.friendBusinesses = await this.habitBusinessService.getFriendBusinesses(this.currentUser.id);
      console.log('✅ Loaded friend businesses:', this.friendBusinesses.length);
    } catch (error) {
      console.error('Error loading friend businesses:', error);
      this.friendBusinesses = [];
    }
  }

  async loadPortfolio() {
    console.log('🔍 Starting loadPortfolio...');
    if (!this.currentUser?.id) {
      console.log('❌ No current user for loading portfolio');
      return;
    }

    console.log('🔍 Loading portfolio for user:', this.currentUser.id);
    try {
      this.portfolio = await this.habitBusinessService.getUserStockPortfolio(this.currentUser.id);
      console.log('✅ Loaded portfolio:', this.portfolio.length);
      console.log('🔍 Portfolio data:', this.portfolio);

      // Load today's actual dividends
      this.todaysActualDividends = await this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
      console.log('💰 Today\'s actual dividends:', this.todaysActualDividends);
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      this.portfolio = [];
      this.todaysActualDividends = 0;
    }
  }

  async buyShares(business: FriendBusiness, shares: number) {
    if (!business.stockId) {
      const toast = await this.toastController.create({
        message: 'Stock not available for this business yet',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      const totalCost = business.stockPrice * shares;
      
      // Show confirmation alert
      const alert = await this.alertController.create({
        header: 'Confirm Purchase',
        message: `Buy ${shares} shares of ${business.businessName} for $${totalCost.toFixed(2)}?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Buy',
            handler: async () => {
              try {
                const result = await this.habitBusinessService.purchaseStockShares(business.stockId!, shares);
                
                const toast = await this.toastController.create({
                  message: `✅ Purchased ${result.shares_purchased} shares for $${result.total_cost.toFixed(2)}!`,
                  duration: 3000,
                  color: 'success'
                });
                await toast.present();
                
                // Reload data and user profile
                await this.loadData();
                await this.loadCurrentUser();
              } catch (error: any) {
                const toast = await this.toastController.create({
                  message: `❌ ${error.message}`,
                  duration: 3000,
                  color: 'danger'
                });
                await toast.present();
              }
            }
          }
        ]
      });
      
      await alert.present();
    } catch (error) {
      console.error('Error buying shares:', error);
    }
  }

  async sendHabitPoke(friendId: string, businessName: string) {
    if (!this.currentUser?.id) {
      console.log('No current user for sending poke');
      return;
    }

    try {
      await this.socialService.sendHabitPoke(this.currentUser.id, friendId, businessName);
      
      const toast = await this.toastController.create({
        message: `👋 Sent motivation poke for ${businessName}!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: `❌ ${error.message}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async sendStockholderReminder(friendId: string, businessName: string, friendName: string) {
    if (!this.currentUser?.id) {
      console.log('No current user for sending stockholder reminder');
      return;
    }

    try {
      // Get current user's name for the notification
      const { data: userProfile } = await this.authService.getUserProfile(this.currentUser.id);
      const currentUserName = userProfile?.name || this.currentUser?.email || 'A stockholder';

      await this.socialService.sendStockholderReminder(
        this.currentUser.id, 
        friendId, 
        businessName,
        currentUserName
      );
      
      const toast = await this.toastController.create({
        message: `📩 Sent stockholder reminder to ${friendName} about ${businessName}!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error: any) {
      const toast = await this.toastController.create({
        message: `❌ ${error.message}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  getPerformanceTrend(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand < 0.4) return 'up';
    if (rand < 0.8) return 'down';
    return 'stable';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'medium';
    }
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  }

  getPerformanceClass(profitLoss: number): string {
    return profitLoss >= 0 ? 'profit' : 'loss';
  }

  getTotalPortfolioValue(): number {
    return this.portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  }

  getTotalPortfolioProfitLoss(): number {
    return this.portfolio.reduce((sum, item) => sum + item.profitLoss, 0);
  }

  getTotalDailyDividends(): number {
    return this.todaysActualDividends;
  }

  getPotentialDailyDividends(): number {
    return this.portfolio.reduce((sum, item) => sum + item.dailyDividendRate, 0);
  }

  /**
   * Sell stocks from portfolio
   */
  async sellStocks(holding: Portfolio, quantityOrPercentage: number = 0.5) {
    try {
      let sharesToSell: number;
      let isPercentage = false;
      
      // Determine if it's a quantity (whole number > 1) or percentage (decimal <= 1)
      if (quantityOrPercentage <= 1) {
        // It's a percentage
        sharesToSell = Math.floor(holding.sharesOwned * quantityOrPercentage);
        isPercentage = true;
      } else {
        // It's a direct quantity
        sharesToSell = Math.floor(quantityOrPercentage);
      }
      
      if (sharesToSell <= 0) {
        const toast = await this.toastController.create({
          message: 'No shares to sell',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
        return;
      }

      if (sharesToSell > holding.sharesOwned) {
        const toast = await this.toastController.create({
          message: 'Cannot sell more shares than you own',
          duration: 2000,
          color: 'warning'
        });
        await toast.present();
        return;
      }

      // Show confirmation dialog
      const percentageText = isPercentage ? ` (${Math.round(quantityOrPercentage * 100)}%)` : '';
      const alert = await this.alertController.create({
        header: 'Sell Stocks',
        message: `
          <div style="text-align: left;">
            <p><strong>Stock:</strong> ${holding.businessName}</p>
            <p><strong>Shares to sell:</strong> ${sharesToSell}${percentageText}</p>
            <p><strong>Current price:</strong> $${holding.currentPrice.toFixed(2)}/share</p>
            <p><strong>Total value:</strong> $${(sharesToSell * holding.currentPrice).toFixed(2)}</p>
            <p><strong>Transaction fee:</strong> 2%</p>
            <p><strong>Net proceeds:</strong> $${(sharesToSell * holding.currentPrice * 0.98).toFixed(2)}</p>
          </div>
        `,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Sell',
            cssClass: 'danger',
            handler: async () => {
              await this.executeSale(holding, sharesToSell);
            }
          }
        ]
      });
      
      await alert.present();
    } catch (error) {
      console.error('Error preparing stock sale:', error);
      const toast = await this.toastController.create({
        message: 'Error preparing sale',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  private async executeSale(holding: Portfolio, sharesToSell: number) {
    try {
      this.isLoading = true;
      
      const result = await this.habitBusinessService.sellStockShares(
        holding.stockId, // Use the stock_id from the portfolio
        sharesToSell
      );

      if (result.success) {
        const toast = await this.toastController.create({
          message: `✅ Sold ${sharesToSell} shares for $${result.net_proceeds.toFixed(2)}`,
          duration: 3000,
          color: 'success'
        });
        await toast.present();

        // Reload portfolio and user profile to reflect changes
        await this.loadPortfolio();
        await this.loadFriendBusinesses(); // Refresh available stocks too
        await this.loadCurrentUser(); // Refresh user profile (cash and net worth)
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error executing stock sale:', error);
      const toast = await this.toastController.create({
        message: `Error selling stocks: ${error}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  getHalfShares(shares: number): number {
    return Math.floor(shares / 2);
  }

  /**
   * Get price change percentage from base price
   */
  getPriceChangePercentage(business: FriendBusiness): number {
    if (!business.basePrice || business.basePrice === 0) return 0;
    return ((business.stockPrice - business.basePrice) / business.basePrice) * 100;
  }

  /**
   * Get price change indicator class
   */
  getPriceChangeClass(business: FriendBusiness): string {
    const change = this.getPriceChangePercentage(business);
    if (change > 0) return 'price-up';
    if (change < 0) return 'price-down';
    return 'price-neutral';
  }

  /**
   * Format price change for display
   */
  formatPriceChange(business: FriendBusiness): string {
    const change = this.getPriceChangePercentage(business);
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  }

  /**
   * Increment sell quantity for a specific stock
   */
  incrementSellQuantity(stockId: string, maxShares: number) {
    const current = this.sellQuantities[stockId] || 1;
    if (current < maxShares) {
      this.sellQuantities[stockId] = current + 1;
    }
  }

  /**
   * Decrement sell quantity for a specific stock
   */
  decrementSellQuantity(stockId: string) {
    const current = this.sellQuantities[stockId] || 1;
    if (current > 1) {
      this.sellQuantities[stockId] = current - 1;
    }
  }

  /**
   * Increment buy quantity for a specific stock
   */
  incrementQuantity(stockId: string) {
    const current = this.selectedQuantities[stockId] || 1;
    this.selectedQuantities[stockId] = current + 1;
  }

  /**
   * Decrement buy quantity for a specific stock
   */
  decrementQuantity(stockId: string) {
    const current = this.selectedQuantities[stockId] || 1;
    if (current > 1) {
      this.selectedQuantities[stockId] = current - 1;
    }
  }

  /**
   * Logout user and redirect to login page
   */
  async logout() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Logout error:', error);
      const toast = await this.toastController.create({
        message: 'Failed to logout. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  /**
   * Open sell modal for a specific holding
   */
  openSellModal(holding: any) {
    this.selectedHolding = {
      ...holding,
      emoji: holding.businessIcon,
      sharePrice: holding.currentPrice,
      shares: holding.sharesOwned
    };
    this.sellQuantity = 1;
    this.showSellModal = true;
  }

  /**
   * Close sell modal
   */
  closeSellModal() {
    this.showSellModal = false;
    this.selectedHolding = null;
    this.sellQuantity = 0;
  }

  /**
   * Set sell quantity with preset amounts
   */
  setSellQuantity(quantity: number) {
    this.sellQuantity = Math.max(0, Math.min(quantity, this.selectedHolding?.shares || 0));
  }

  /**
   * Helper method for calculating percentages in template
   */
  calculateSellQuantity(percentage: number): number {
    if (!this.selectedHolding) return 0;
    return Math.floor(this.selectedHolding.shares * percentage);
  }

  /**
   * Generate array of sell options from 1 to max shares owned
   */
  getSellOptions(): number[] {
    if (!this.selectedHolding) return [];
    const maxShares = this.selectedHolding.shares;
    return Array.from({ length: maxShares }, (_, i) => i + 1);
  }

  /**
   * Confirm and execute the sell transaction
   */
  async confirmSell() {
    if (!this.selectedHolding || !this.sellQuantity || this.sellQuantity <= 0) {
      return;
    }

    try {
      // Find the actual portfolio item
      const portfolioItem = this.portfolio.find(p => p.stockId === this.selectedHolding.stockId);
      if (!portfolioItem) {
        throw new Error('Portfolio item not found');
      }

      await this.executeSale(portfolioItem, this.sellQuantity);
      this.closeSellModal();
      
      const toast = await this.toastController.create({
        message: `Successfully sold ${this.sellQuantity} shares!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error selling shares:', error);
      const toast = await this.toastController.create({
        message: 'Failed to sell shares. Please try again.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  /**
   * Check if user has already sent a reminder today for this business
   */
  hasAlreadyRemindedToday(businessId: string): boolean {
    const today = new Date().toDateString();
    return this.dailyReminders[businessId] === today;
  }

  /**
   * Check if the habit business owner has completed their habit for the current period
   */
  isHabitCompleted(holding: any): boolean {
    // Check if we have completion status cached
    if (this.habitCompletionStatus[holding.businessId] !== undefined) {
      return this.habitCompletionStatus[holding.businessId];
    }

    // For daily habits, check if current progress meets or exceeds goal
    if (holding.frequency === 'daily') {
      return (holding.currentProgress || 0) >= (holding.goalValue || 1);
    }
    
    // For weekly habits, also check if current progress meets or exceeds goal
    if (holding.frequency === 'weekly') {
      return (holding.currentProgress || 0) >= (holding.goalValue || 1);
    }

    return false;
  }

  /**
   * Check if remind button should be disabled
   */
  isRemindButtonDisabled(holding: any): boolean {
    return this.hasAlreadyRemindedToday(holding.businessId) || this.isHabitCompleted(holding);
  }

  /**
   * Get tooltip text for disabled remind button
   */
  getRemindButtonTooltip(holding: any): string {
    if (this.hasAlreadyRemindedToday(holding.businessId)) {
      return 'You can only send one reminder per day';
    }
    if (this.isHabitCompleted(holding)) {
      return `${holding.ownerName} has already completed their habit today`;
    }
    return '';
  }

  /**
   * Mark that a reminder was sent today for this business
   */
  markReminderSent(businessId: string): void {
    const today = new Date().toDateString();
    this.dailyReminders[businessId] = today;
    
    // Store in localStorage for persistence across sessions
    localStorage.setItem(`reminder_${businessId}`, today);
  }

  /**
   * Load reminder history from localStorage
   */
  loadReminderHistory(): void {
    this.portfolio.forEach(holding => {
      const storedDate = localStorage.getItem(`reminder_${holding.businessId}`);
      if (storedDate) {
        this.dailyReminders[holding.businessId] = storedDate;
      }
    });
  }

  /**
   * Send a reminder to the habit business owner
   */
  async sendReminder(holding: any) {
    if (!this.currentUser || !holding) {
      return;
    }

    // Check if reminder is disabled
    if (this.isRemindButtonDisabled(holding)) {
      const toast = await this.toastController.create({
        message: this.getRemindButtonTooltip(holding),
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    try {
      // Show confirmation dialog
      const alert = await this.alertController.create({
        header: 'Send Reminder',
        message: `Send a reminder to ${holding.ownerName} to complete their ${holding.businessName} habit?`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Send Reminder',
            handler: async () => {
              try {
                console.log('🔍 Sending reminder with data:', {
                  fromUserId: this.currentUser.id,
                  toUserId: holding.ownerId,
                  businessName: holding.businessName,
                  fromUserName: this.currentUser.user_metadata?.display_name || this.currentUser.email || 'A fellow investor',
                  currentUser: this.currentUser
                });

                // Send the reminder using the social service
                await this.socialService.sendStockholderReminder(
                  this.currentUser.id,
                  holding.ownerId,
                  holding.businessName,
                  this.currentUser.user_metadata?.display_name || this.currentUser.email || 'A fellow investor'
                );

                // Mark reminder as sent
                this.markReminderSent(holding.businessId);

                // Show success message
                const successToast = await this.toastController.create({
                  message: `✅ Reminder sent to ${holding.ownerName}!`,
                  duration: 3000,
                  color: 'success'
                });
                await successToast.present();

              } catch (error) {
                console.error('❌ Detailed error sending reminder:', {
                  error,
                  errorMessage: (error as any)?.message,
                  holding,
                  currentUser: this.currentUser
                });
                const errorToast = await this.toastController.create({
                  message: `❌ Failed to send reminder: ${(error as any)?.message || 'Please try again.'}`,
                  duration: 4000,
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
      console.error('Error creating reminder alert:', error);
    }
  }

  /**
   * Get unique owners from friend businesses for filter dropdown
   */
  getUniqueOwners(): string[] {
    const owners = this.friendBusinesses.map(business => business.ownerName);
    return [...new Set(owners)].sort();
  }

  /**
   * Get filtered businesses based on selected owner filter
   */
  getFilteredBusinesses(): FriendBusiness[] {
    if (!this.selectedOwnerFilter || this.selectedOwnerFilter === '') {
      return this.friendBusinesses;
    }
    return this.friendBusinesses.filter(business => 
      business.ownerName === this.selectedOwnerFilter
    );
  }

  /**
   * Handle owner filter change
   */
  onOwnerFilterChange(): void {
    // Save filter selection to localStorage for persistence
    if (this.selectedOwnerFilter) {
      localStorage.setItem('stocks-owner-filter', this.selectedOwnerFilter);
    } else {
      localStorage.removeItem('stocks-owner-filter');
    }
  }

  /**
   * Get display text for current owner filter
   */
  getOwnerFilterDisplayText(): string {
    return this.selectedOwnerFilter || 'All Owners';
  }

  /**
   * Clear the owner filter
   */
  clearOwnerFilter(): void {
    this.selectedOwnerFilter = '';
    localStorage.removeItem('stocks-owner-filter');
  }

  /**
   * Format large numbers with abbreviations (M for millions, B for billions)
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
   * Get displayed net worth (formatted or exact)
   */
  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000000 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Get displayed cash amount (formatted or exact)
   */
  getDisplayedCash(): string {
    const cash = this.userProfile?.cash || 0;
    if (cash >= 1000000 && !this.showDetailedCash) {
      return this.formatLargeNumber(cash);
    }
    return cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Toggle net worth display between abbreviated and detailed
   */
  toggleNetWorthDisplay(): void {
    this.showDetailedNetWorth = !this.showDetailedNetWorth;
  }

  /**
   * Toggle cash display between abbreviated and detailed
   */
  toggleCashDisplay(): void {
    this.showDetailedCash = !this.showDetailedCash;
  }
}