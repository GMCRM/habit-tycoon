import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent,
  IonButton, IonIcon, IonBadge, IonSpinner,
  IonModal, IonButtons, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption,
  ToastController, AlertController, ModalController
} from '@ionic/angular/standalone';
import { HabitGridComponent } from '../../shared/components/habit-grid/habit-grid.component';
import { StockChartComponent } from '../../shared/components/stock-chart/stock-chart.component';
import { StockOwnersModalComponent } from '../../shared/components/stock-owners-modal/stock-owners-modal.component';
import { HabitBusinessService } from '../../services/habit-business.service';
import { HabitIntervalService } from '../../services/habit-interval.service';
import { OfflineQueuedError } from '../../services/offline-queue.service';
import { SocialService } from '../../services/social.service';
import { AuthService } from '../../services/auth.service';
import { BusinessIconPipe } from '../../shared/pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import {
  arrowBack, trendingUp, trendingDown, star, business,
  cash, checkmarkCircle, alertCircle, funnel, closeCircle,
  settings, trendingUpOutline, pieChartOutline,
  swapHorizontal, helpCircle, close, addCircle, pieChart,
  wallet, removeCircle, add, remove, chevronBack,
  chevronForward, helpCircleOutline, people, arrowUp, arrowDown
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
  lastCompletedAt: string | null;
  recurrenceInterval: string;
  activeDays: number[];
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
  goalValue: number;
  currentProgress: number;
  lastCompletedAt: string | null;
  recurrenceInterval: string;
  activeDays: number[];
  lastPurchaseAt: string;
}

@Component({
  selector: 'app-stocks-content',
  templateUrl: './stocks-content.component.html',
  styleUrls: ['./stocks-content.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonCardContent,
    IonButton, IonIcon, IonBadge, IonSpinner,
    IonModal, IonButtons, IonItem, IonLabel, IonInput,
    IonSelect, IonSelectOption,
    HabitGridComponent, StockChartComponent,
    BusinessIconPipe
  ]
})
export class StocksContentComponent implements OnInit {
  // Lets a parent (e.g. the Social page, which shows net worth/cash above this
  // component's own tabs) know its cached user profile is stale after a buy/sell.
  @Output() profileChanged = new EventEmitter<void>();

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

  isMobileScreen = false;
  isMediumSmallScreen = false;
  isMediumLargeScreen = false;

  // Grid display properties
  weeksToShow = 26; // Default weeks to show
  
  // Sell modal properties
  showSellModal = false;
  selectedHolding: any = null;
  sellQuantity = 0;

  // Buy More modal properties
  showBuyModal = false;
  selectedBuyBusiness: FriendBusiness | null = null;
  buyQuantity = 0;

  // Reminder tracking properties
  dailyReminders: { [businessId: string]: string } = {}; // businessId -> date sent
  habitCompletionStatus: { [businessId: string]: boolean } = {}; // businessId -> completed status
  
  // Filter properties
  selectedOwnerFilter: string = '';
  streakSortDirection: 'asc' | 'desc' | null = null;

  constructor(
    private habitBusinessService: HabitBusinessService,
    private habitIntervalService: HabitIntervalService,
    private socialService: SocialService,
    private authService: AuthService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    // Register icons
    addIcons({funnel,closeCircle,settings,trendingUpOutline,pieChartOutline,swapHorizontal,helpCircle,trendingUp,close,addCircle,pieChart,wallet,trendingDown,removeCircle,helpCircleOutline,chevronBack,chevronForward,remove,add,arrowBack,star,business,cash,checkmarkCircle,alertCircle,people,arrowUp,arrowDown});
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

    // Load saved streak sort direction from localStorage
    const savedStreakSort = localStorage.getItem('stocks-streak-sort');
    if (savedStreakSort === 'asc' || savedStreakSort === 'desc') {
      this.streakSortDirection = savedStreakSort;
    }

    // Check initial screen size
    this.checkScreenSize();

    await this.loadCurrentUser();
    await this.loadData();
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
    } else if (this.isMediumSmallScreen) {
      this.weeksToShow = 17; // 4 months for small-medium screens (17 weeks = ~4 months)
    } else if (this.isMediumLargeScreen) {
      this.weeksToShow = 26; // 6 months for medium-large screens (26 weeks = ~6 months)
    } else {
      this.weeksToShow = 53; // Full year for large screens (53 weeks = full year)
    }
  }

  selectTab(tab: 'available' | 'portfolio') {
    this.selectedTab = tab;
    localStorage.setItem('stocks-active-tab', tab);
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
        this.profileChanged.emit();
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
    } catch (error) {
      console.error('Error loading stocks data:', error);
    }
    this.isLoading = false;
  }

  async loadFriendBusinesses() {
    if (!this.currentUser?.id) {
      return;
    }

    try {
      this.friendBusinesses = await this.habitBusinessService.getFriendBusinesses(this.currentUser.id);
    } catch (error) {
      console.error('Error loading friend businesses:', error);
      this.friendBusinesses = [];
    }
  }

  async loadPortfolio() {
    if (!this.currentUser?.id) {
      return;
    }

    try {
      this.portfolio = await this.habitBusinessService.getUserStockPortfolio(this.currentUser.id);

      // Load today's actual dividends
      this.todaysActualDividends = await this.habitBusinessService.getTodaysStockDividends(this.currentUser.id);
    } catch (error) {
      console.error('❌ Error loading portfolio:', error);
      this.portfolio = [];
      this.todaysActualDividends = 0;
    }
  }

  async sendHabitPoke(friendId: string, businessName: string) {
    if (!this.currentUser?.id) {
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
      return;
    }

    try {
      // Get current user's name for the notification
      const currentUserName = this.userProfile?.name || this.currentUser?.email || 'A stockholder';

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

  absValue(value: number): number {
    return Math.abs(value || 0);
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

  // Portfolio stat numbers abbreviate (1K, 1M, 1T...) once they hit this size.
  // Kept low (matching the home-page stat threshold) because the stat cards
  // are only ~1/3 of the screen wide with overflow:hidden - an un-abbreviated
  // value like "$75,062.03" is wider than the card and gets clipped.
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
    return `${display}${units[unitIndex]}`;
  }

  /**
   * Format a currency amount with thousands separators (e.g. $1,234.56),
   * abbreviating to $101K / $1.2M / $1T once it crosses the threshold.
   * Negative amounts render as "-$X" (not "$-X").
   */
  formatStatCurrency(amount: number, decimals: number = 1): string {
    const value = amount || 0;
    const sign = value < 0 ? '-' : '';
    if (this.isStatAbbreviated(value)) {
      return sign + '$' + this.abbreviateStatNumber(value, decimals);
    }
    return sign + '$' + Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Show the exact value behind an abbreviated portfolio stat in a popup.
   */
  async showExactStatValue(label: string, value: number, isCurrency: boolean) {
    if (!this.isStatAbbreviated(value)) return;
    const exact = value || 0;
    const sign = exact < 0 ? '-' : '';
    const message = isCurrency
      ? sign + '$' + Math.abs(exact).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : exact.toLocaleString('en-US');
    const alert = await this.alertController.create({
      header: label,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  /**
   * Sell stocks from portfolio
   */
  async sellStocks(holding: Portfolio, quantityOrPercentage: number = 0.5) {
    try {
      // Shares can't be sold until 48h after purchase (server-enforced too —
      // this just avoids a round trip and gives a friendlier message).
      const VESTING_PERIOD_MS = 48 * 60 * 60 * 1000;
      if (holding.lastPurchaseAt) {
        const msSincePurchase = Date.now() - new Date(holding.lastPurchaseAt).getTime();
        const msRemaining = VESTING_PERIOD_MS - msSincePurchase;
        if (msRemaining > 0) {
          const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));
          const toast = await this.toastController.create({
            message: `⏳ These shares are still vesting — sellable in ${hoursRemaining}h.`,
            duration: 3000,
            color: 'warning'
          });
          await toast.present();
          return;
        }
      }

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
              try {
                await this.executeSale(holding, sharesToSell);
                const successToast = await this.toastController.create({
                  message: `✅ Successfully sold ${sharesToSell} shares!`,
                  duration: 3000,
                  color: 'success'
                });
                await successToast.present();
              } catch (error: any) {
                console.error('Error selling shares:', error);
                const isOfflineQueued = error instanceof OfflineQueuedError;
                const toast = await this.toastController.create({
                  message: isOfflineQueued ? `📡 ${error.message}` : `❌ Failed to sell shares: ${error?.message || error}`,
                  duration: 3000,
                  color: isOfflineQueued ? 'warning' : 'danger'
                });
                await toast.present();
              }
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
        // Reload portfolio and user profile to reflect changes
        await this.loadPortfolio();
        await this.loadFriendBusinesses(); // Refresh available stocks too
        await this.loadCurrentUser(); // Refresh user profile (cash and net worth)
      } else {
        throw new Error(result.error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  getHalfShares(shares: number): number {
    return Math.floor(shares / 2);
  }

  /**
   * Find the live "available stocks" entry backing a portfolio holding,
   * which is where shares_available is tracked.
   */
  getBusinessForHolding(holding: Portfolio): FriendBusiness | undefined {
    return this.friendBusinesses.find(b => b.stockId === holding.stockId);
  }

  /**
   * Whether more shares of an already-owned stock can still be bought
   */
  canBuyMoreShares(holding: Portfolio): boolean {
    const business = this.getBusinessForHolding(holding);
    return !!business && business.sharesAvailable > 0;
  }

  /**
   * Open the buy-quantity modal for a stock, whether reached from the
   * Available Stocks list or the "Buy More" button on an existing holding
   */
  openBuyModal(business: FriendBusiness | undefined) {
    if (!business || !business.stockId) {
      return;
    }
    this.selectedBuyBusiness = business;
    this.buyQuantity = 1;
    this.showBuyModal = true;
  }

  /**
   * Close the "Buy More" modal
   */
  closeBuyModal() {
    this.showBuyModal = false;
    this.selectedBuyBusiness = null;
    this.buyQuantity = 0;
  }

  /**
   * Generate array of buy options from 1 to shares available, capped by
   * how many shares the user can actually afford with their current cash
   */
  getBuyOptions(): number[] {
    if (!this.selectedBuyBusiness) return [];
    const maxShares = this.selectedBuyBusiness.sharesAvailable;
    const cash = this.userProfile?.cash || 0;
    // If the price is missing/zero we can't determine affordability - default
    // to 0 rather than treating it as "free" and offering every share.
    const affordableShares = this.selectedBuyBusiness.stockPrice > 0
      ? Math.floor(cash / this.selectedBuyBusiness.stockPrice)
      : 0;
    const limit = Math.min(maxShares, affordableShares);
    return Array.from({ length: limit }, (_, i) => i + 1);
  }

  /**
   * Confirm and execute the purchase of additional shares from the "Buy More" modal
   */
  async confirmBuy() {
    if (!this.selectedBuyBusiness || !this.buyQuantity || this.buyQuantity <= 0) {
      return;
    }

    const business = this.selectedBuyBusiness;
    const shares = this.buyQuantity;

    try {
      this.isLoading = true;
      const result = await this.habitBusinessService.purchaseStockShares(business.stockId!, shares);

      this.closeBuyModal();

      const toast = await this.toastController.create({
        message: `✅ Purchased ${result.shares_purchased} shares for $${result.total_cost.toFixed(2)}!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();

      await this.loadData();
      await this.loadCurrentUser();
    } catch (error: any) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const toast = await this.toastController.create({
        message: isOfflineQueued ? `📡 ${error.message}` : `❌ ${error?.message || 'Failed to purchase shares'}`,
        duration: 3000,
        color: isOfflineQueued ? 'warning' : 'danger'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
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
   * True current streak for a friend's business, correcting for a stale
   * (not-yet-reset) streak column.
   */
  getEffectiveStreakForFriendBusiness(b: FriendBusiness): number {
    return this.habitIntervalService.getEffectiveStreak({
      streak: b.streak,
      last_completed_at: b.lastCompletedAt || undefined,
      recurrence_interval: (b.recurrenceInterval as any) || '24h',
      frequency: b.frequency as any,
      active_days: b.activeDays,
      goal_value: b.goalValue,
      current_progress: b.currentProgress
    });
  }

  /**
   * True current streak for a held stock's business, correcting for a stale
   * (not-yet-reset) streak column.
   */
  getEffectiveStreakForHolding(p: Portfolio): number {
    return this.habitIntervalService.getEffectiveStreak({
      streak: p.businessStreak,
      last_completed_at: p.lastCompletedAt || undefined,
      recurrence_interval: (p.recurrenceInterval as any) || '24h',
      active_days: p.activeDays,
      goal_value: p.goalValue,
      current_progress: p.currentProgress
    });
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
   * Show who owns shares of a business's stock, and how many each holds
   */
  async openStockOwnersModal(businessName: string, habitBusinessId: string) {
    const modal = await this.modalController.create({
      component: StockOwnersModalComponent,
      componentProps: {
        businessName,
        habitBusinessId,
        modalController: this.modalController
      },
      cssClass: 'stock-owners-modal'
    });
    await modal.present();
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

    const sharesToSell = this.sellQuantity;

    try {
      // Find the actual portfolio item
      const portfolioItem = this.portfolio.find(p => p.stockId === this.selectedHolding.stockId);
      if (!portfolioItem) {
        throw new Error('Portfolio item not found');
      }

      await this.executeSale(portfolioItem, sharesToSell);
      this.closeSellModal();
      
      const toast = await this.toastController.create({
        message: `✅ Successfully sold ${sharesToSell} shares!`,
        duration: 3000,
        color: 'success'
      });
      await toast.present();
    } catch (error: any) {
      console.error('Error selling shares:', error);
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const toast = await this.toastController.create({
        message: isOfflineQueued ? `📡 ${error.message}` : `❌ Failed to sell shares: ${error?.message || error}`,
        duration: 3000,
        color: isOfflineQueued ? 'warning' : 'danger'
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

    // current_progress/goal_value are already scoped to the business's
    // current period by the backend, regardless of recurrence frequency.
    return (holding.currentProgress || 0) >= (holding.goalValue || 1);
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
                // Send the reminder using the social service
                await this.socialService.sendStockholderReminder(
                  this.currentUser.id,
                  holding.ownerId,
                  holding.businessName,
                  this.userProfile?.name || this.currentUser.email || 'A fellow investor'
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
   * Get filtered (and optionally streak-sorted) businesses
   */
  getFilteredBusinesses(): FriendBusiness[] {
    let businesses = this.friendBusinesses;

    if (this.selectedOwnerFilter) {
      businesses = businesses.filter(business =>
        business.ownerName === this.selectedOwnerFilter
      );
    }

    if (this.streakSortDirection) {
      businesses = [...businesses].sort((a, b) => {
        const diff = this.getEffectiveStreakForFriendBusiness(a) - this.getEffectiveStreakForFriendBusiness(b);
        return this.streakSortDirection === 'asc' ? diff : -diff;
      });
    }

    return businesses;
  }

  /** *ngFor trackBy for the friend-business list — keeps DOM/mini-chart nodes stable across reloads instead of destroying/recreating every card. */
  trackByFriendBusinessId(_index: number, business: FriendBusiness): string {
    return business.id;
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
   * Toggle streak sort direction; clicking the active direction turns sorting off
   */
  setStreakSort(direction: 'asc' | 'desc'): void {
    this.streakSortDirection = this.streakSortDirection === direction ? null : direction;
    if (this.streakSortDirection) {
      localStorage.setItem('stocks-streak-sort', this.streakSortDirection);
    } else {
      localStorage.removeItem('stocks-streak-sort');
    }
  }

  /**
   * Whether any owner filter or streak sort is currently active
   */
  hasActiveFilters(): boolean {
    return !!this.selectedOwnerFilter || !!this.streakSortDirection;
  }

  /**
   * Clear the owner filter and streak sort
   */
  clearFilters(): void {
    this.selectedOwnerFilter = '';
    this.streakSortDirection = null;
    localStorage.removeItem('stocks-owner-filter');
    localStorage.removeItem('stocks-streak-sort');
  }

  /**
   * Format dividends earned for the portfolio list: exact below 1k,
   * abbreviated (1.1k, 20.4k, 100.2k, 2.4M, 1.2T) at or above 1k.
   */
  formatDividendsAbbreviated(amount: number): string {
    const value = amount || 0;
    if (value >= 1000000000000) {
      return `${(value / 1000000000000).toFixed(1)}T`;
    } else if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(2);
  }

  async showTotalDividendsEarned(holding: any) {
    const alert = await this.alertController.create({
      header: 'Total Dividends Earned',
      message: this.formatCurrency(holding.totalDividendsEarned || 0),
      buttons: ['OK']
    });
    await alert.present();
  }

}