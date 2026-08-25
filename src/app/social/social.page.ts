import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent, IonSegment, IonSegmentButton,
  IonButton, IonIcon, IonLabel, IonBadge, IonSkeletonText,
  IonAccordion, IonAccordionGroup, IonItem, IonToggle,
  ToastController, AlertController, ModalController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { SocialService, Friend } from '../services/social.service';
import { HabitBusinessService, HabitBusiness } from '../services/habit-business.service';
import { MarketplaceService, MarketplaceListing, MarketplacePurchase } from '../services/marketplace.service';
import { JointVentureService } from '../services/joint-venture.service';
import { CountdownTickService } from '../services/countdown-tick.service';
import { OfflineQueueService } from '../services/offline-queue.service';
import { WeeklyReceiptService } from '../services/weekly-receipt.service';
import { MarketplacePurchaseModalComponent, MarketplacePurchaseResolution } from './marketplace-purchase-modal/marketplace-purchase-modal.component';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { StocksContentComponent } from '../stocks/stocks-content/stocks-content.component';
import { BusinessIconPipe } from '../shared/pipes/business-icon.pipe';
import { JointVentureNotificationCardComponent } from '../shared/components/joint-venture-notification-card/joint-venture-notification-card.component';
import { AchievementReactionBarComponent } from '../shared/components/achievement-reaction-bar/achievement-reaction-bar.component';
import { addIcons } from 'ionicons';
import {
  people, personAdd, arrowBack, medalOutline, star, checkmarkCircle, business,
  notifications, checkmark, close, notificationsOutline, settings, trashOutline, storefront,
  helpCircleOutline, chevronBack, chevronForward } from 'ionicons/icons';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
    imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonSegment, IonSegmentButton,
    IonCardContent, IonButton, IonIcon, IonLabel, IonBadge, IonSkeletonText,
    IonAccordion, IonAccordionGroup, IonItem, IonToggle,
    BottomNavComponent, StocksContentComponent, CommonModule, RouterLink, BusinessIconPipe,
    JointVentureNotificationCardComponent, AchievementReactionBarComponent
  ],
})
export class SocialPage implements OnInit, OnDestroy {
  private isInitialized = false;
  private timeRefreshInterval: ReturnType<typeof setInterval> | null = null;
  // Incrementing tick makes Angular re-evaluate formatTimeAgo() bindings
  timeRefreshTick = 0;
  
  currentUser: any = null;
  userProfile: any = null;
  selectedSegment: 'friends' | 'notifications' | 'leaderboard' | 'marketplace' = 'leaderboard';
  marketplaceSubTab: 'marketplace' | 'stocks' = 'marketplace';

  // Social data
  friends: Friend[] = [];
  notifications: any[] = [];
  pendingRequests: any[] = [];
  sentRequests: any[] = [];
  friendsLeaderboard: any[] = [];

  // Marketplace data
  marketplaceListings: MarketplaceListing[] = [];
  unresolvedPurchase: MarketplacePurchase | null = null;
  isLoadingMarketplace = false;
  private marketplaceTickSubscription: Subscription | null = null;
  // Incrementing tick makes Angular re-evaluate getListingCountdown() bindings every second
  marketplaceTick = 0;

  // Leaderboard view state
  leaderboardView: 'networth' | 'cashearned' = 'networth';
  cashMetricFilter: 'cash' | 'completed' = 'cash';
  cashLeaderboard: any[] = [];
  completedLeaderboard: any[] = [];
  isLoadingCash = false;
  isLoadingCompleted = false;
  // Which Monday-anchored week the Weekly Leaderboard is currently showing —
  // navigable via previousLeaderboardWeek()/nextLeaderboardWeek(). Past weeks
  // are served from a frozen snapshot (see get_weekly_leaderboard_history);
  // the current week stays live.
  leaderboardWeekStart!: Date;
  
  // UI state
  isLoading = false;

  // Toggle states for the Net Worth / Habit Cash display above the Marketplace/Stocks sub-tabs
  showDetailedNetWorth = false;
  showDetailedCash = false;

  /** Friends/leaderboard/marketplace aren't cached locally (see HabitCacheService, which only covers habit tracking), so just surface connectivity instead. */
  get isOffline(): boolean {
    return this.offlineQueueService.isOffline();
  }


  constructor(
    private router: Router,
    private authService: AuthService,
    private socialService: SocialService,
    private habitBusinessService: HabitBusinessService,
    private marketplaceService: MarketplaceService,
    private countdownTickService: CountdownTickService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
    private offlineQueueService: OfflineQueueService,
    private jointVentureService: JointVentureService,
    private receiptService: WeeklyReceiptService
  ) {
    addIcons({settings,people,notificationsOutline,notifications,medalOutline,personAdd,trashOutline,checkmark,close,arrowBack,star,checkmarkCircle,business,storefront,helpCircleOutline,chevronBack,chevronForward});

    this.leaderboardWeekStart = this.receiptService.getWeekStart();

    // Restore the previously selected tab from localStorage (only if the user has explicitly chosen one)
    const savedTab = localStorage.getItem('social-selected-tab');
    if (savedTab && ['friends', 'notifications', 'leaderboard', 'marketplace'].includes(savedTab)) {
      this.selectedSegment = savedTab as 'friends' | 'notifications' | 'leaderboard' | 'marketplace';
    } else {
      this.selectedSegment = 'leaderboard';
    }

    const savedMarketplaceSubTab = localStorage.getItem('social-marketplace-sub-tab');
    if (savedMarketplaceSubTab === 'marketplace' || savedMarketplaceSubTab === 'stocks') {
      this.marketplaceSubTab = savedMarketplaceSubTab;
    }
  }

  async ionViewWillEnter() {
    // Tick every 60s so formatTimeAgo() bindings re-evaluate automatically
    if (!this.timeRefreshInterval) {
      this.timeRefreshInterval = setInterval(() => { this.timeRefreshTick++; }, 60_000);
    }

    // Shared 1s ticker so Marketplace countdowns stay live while this page is visible
    this.countdownTickService.register();
    if (!this.marketplaceTickSubscription) {
      this.marketplaceTickSubscription = this.countdownTickService.tick$.subscribe(() => {
        this.marketplaceTick++;
      });
    }

    // Always ensure data is loaded when entering the view
    if (!this.isInitialized) {
      await this.initializePage();
    } else {
      // Refresh data if already initialized
      await this.loadSocialData();
    }
  }

  async initializePage() {
    if (this.isInitialized) {
      return;
    }

    this.isLoading = true;

    try {
      await this.loadCurrentUser();

      if (this.currentUser) {
        await this.loadSocialData();
        this.isInitialized = true;
      } else {
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('❌ SocialPage: Error initializing social page:', error);
      // Don't redirect on initialization errors, just show empty state
    } finally {
      this.isLoading = false;
    }
  }

  async ngOnInit() {
    // Prevent double initialization
    if (this.isInitialized) {
      return;
    }

    // Always initialize when the component is created
    // The ionViewWillEnter will handle refreshing if needed
    await this.initializePage();
  }

  async loadCurrentUser() {
    try {
      const { data: { user }, error: userError } = await this.authService.getUser();

      if (userError) {
        console.error('❌ SocialPage: Error getting user from auth:', userError);
        this.currentUser = null;
        return;
      }

      this.currentUser = user;

      // Load user profile (but don't fail if this doesn't work)
      if (user) {
        try {
          const { data: profile, error } = await this.authService.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.log('⚠️ SocialPage: User profile not found, will use defaults:', error.message);
            this.userProfile = null;
          } else {
            this.userProfile = profile;
          }
        } catch (profileError) {
          console.log('Error loading user profile, continuing without it:', profileError);
          this.userProfile = null;
        }
      }
    } catch (error) {
      console.error('Error in loadCurrentUser:', error);
      this.currentUser = null;
    }
  }

  async loadSocialData() {
    if (!this.currentUser) {
      return;
    }

    try {
      // Settle any of this user's own joint-venture invites/upgrades/deletion
      // votes that passed their 24h window since the last visit — there's no
      // cron in this app, so expiry is always resolved lazily like this,
      // mirroring the existing Marketplace listing expiry pattern below.
      // Awaited before loading notifications so any resulting "expired"
      // resolution notification shows up in this same load.
      await this.jointVentureService.resolveAllExpired(this.currentUser.id);

      // Load friends, notifications, friend requests, and leaderboard data
      // Handle each request separately to avoid one failure breaking everything
      const [friends, notifications, pendingRequests, sentRequests, leaderboard] = await Promise.allSettled([
        this.socialService.getFriends(this.currentUser.id),
        this.socialService.getUserPokes(this.currentUser.id),
        this.socialService.getPendingRequests(this.currentUser.id),
        this.socialService.getSentRequests(this.currentUser.id),
        this.socialService.getFriendsLeaderboard(this.currentUser.id)
      ]);

      // Extract results or use fallbacks
      this.friends = friends.status === 'fulfilled' ? friends.value : [];
      this.notifications = notifications.status === 'fulfilled' ? notifications.value : [];
      this.pendingRequests = pendingRequests.status === 'fulfilled' ? pendingRequests.value : [];
      this.sentRequests = sentRequests.status === 'fulfilled' ? sentRequests.value : [];
      this.friendsLeaderboard = leaderboard.status === 'fulfilled' ? leaderboard.value : [];

      // Best-effort, doesn't block the rest of the page from loading
      this.loadMarketplaceData();

      // Keep the bottom-nav badge(s) in sync with the freshly loaded notifications/requests.
      this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);

      // If leaderboard failed or is empty, create a simple fallback with just the user
      if (leaderboard.status === 'rejected' || this.friendsLeaderboard.length === 0) {
        this.friendsLeaderboard = [{
          id: this.currentUser.id,
          name: 'You',
          net_worth: this.userProfile?.net_worth || 0,
          rank: 1
        }];
      }
      
    } catch (error) {
      console.error('Error loading social data:', error);
      // Set safe fallbacks instead of crashing
      this.friends = [];
      this.notifications = [];
      this.pendingRequests = [];
      this.sentRequests = [];
      this.friendsLeaderboard = [{
        id: this.currentUser.id,
        name: 'You',
        net_worth: this.userProfile?.net_worth || 0,
        rank: 1
      }];
    }
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    // Save the selected tab to localStorage
    localStorage.setItem('social-selected-tab', this.selectedSegment);

    if (this.selectedSegment === 'marketplace') {
      this.markMarketplaceListingsSeen();
    }
  }

  selectMarketplaceSubTab(tab: 'marketplace' | 'stocks') {
    this.marketplaceSubTab = tab;
    localStorage.setItem('social-marketplace-sub-tab', tab);
  }

  /**
   * Format large numbers with abbreviations (K, M, B, T)
   */
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

  /**
   * Get displayed net worth (formatted or exact)
   */
  getDisplayedNetWorth(): string {
    const netWorth = this.userProfile?.net_worth || 0;
    if (netWorth >= 1000 && !this.showDetailedNetWorth) {
      return this.formatLargeNumber(netWorth);
    }
    return netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  /** Clears the "new listings" badge for this user and syncs the bottom-nav count. */
  private markMarketplaceListingsSeen() {
    if (!this.currentUser) return;
    this.marketplaceService.markListingsSeen(this.currentUser.id);
    this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);
  }

  async onLeaderboardViewChange(view: 'networth' | 'cashearned') {
    this.leaderboardView = view;
    if (view === 'cashearned' && this.cashLeaderboard.length === 0) {
      await this.loadCashLeaderboard();
    }
  }

  async onCashMetricChange(event: any) {
    this.cashMetricFilter = event.detail.value;
    if (this.cashMetricFilter === 'completed') {
      await this.loadCompletedLeaderboard();
    } else {
      await this.loadCashLeaderboard();
    }
  }

  async loadCashLeaderboard() {
    if (!this.currentUser) return;
    this.isLoadingCash = true;
    try {
      this.cashLeaderboard = this.isCurrentLeaderboardWeek
        ? await this.socialService.getFriendsCashLeaderboard(this.currentUser.id, this.leaderboardWeekStart)
        : await this.socialService.getFriendsCashLeaderboardHistory(
            this.currentUser.id,
            this.leaderboardWeekStart,
            this.receiptService.getWeekEnd(this.leaderboardWeekStart)
          );
    } catch (error) {
      console.error('Error loading cash leaderboard:', error);
      this.cashLeaderboard = [{ id: this.currentUser.id, name: 'You', cash_earned: 0, rank: 1 }];
    } finally {
      this.isLoadingCash = false;
    }
  }

  async loadCompletedLeaderboard() {
    if (!this.currentUser) return;
    this.isLoadingCompleted = true;
    try {
      this.completedLeaderboard = this.isCurrentLeaderboardWeek
        ? await this.socialService.getFriendsHabitsCompletedLeaderboard(this.currentUser.id, this.leaderboardWeekStart)
        : await this.socialService.getFriendsHabitsCompletedLeaderboardHistory(
            this.currentUser.id,
            this.leaderboardWeekStart,
            this.receiptService.getWeekEnd(this.leaderboardWeekStart)
          );
    } catch (error) {
      console.error('Error loading habits completed leaderboard:', error);
      this.completedLeaderboard = [{ id: this.currentUser.id, name: 'You', habits_completed: 0, rank: 1 }];
    } finally {
      this.isLoadingCompleted = false;
    }
  }

  /** Whether the Weekly Leaderboard is currently showing the in-progress current week (vs. a frozen past week). */
  get isCurrentLeaderboardWeek(): boolean {
    return this.leaderboardWeekStart.getTime() === this.receiptService.getWeekStart().getTime();
  }

  /** Display label for the week the Weekly Leaderboard is currently showing, e.g. "Aug 11 – Aug 17, 2026". */
  get leaderboardWeekRangeLabel(): string {
    const end = this.receiptService.getWeekEnd(this.leaderboardWeekStart);
    end.setDate(end.getDate() - 1); // display inclusive Sunday, not exclusive next Monday
    const startLabel = this.leaderboardWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }

  async previousLeaderboardWeek() {
    this.leaderboardWeekStart = this.receiptService.addWeeks(this.leaderboardWeekStart, -1);
    await this.reloadWeeklyLeaderboard();
  }

  async nextLeaderboardWeek() {
    if (this.isCurrentLeaderboardWeek) return;
    this.leaderboardWeekStart = this.receiptService.addWeeks(this.leaderboardWeekStart, 1);
    await this.reloadWeeklyLeaderboard();
  }

  private async reloadWeeklyLeaderboard() {
    if (this.cashMetricFilter === 'completed') {
      await this.loadCompletedLeaderboard();
    } else {
      await this.loadCashLeaderboard();
    }
  }

  // Formats the time remaining until the weekly leaderboards reset, e.g. "2d 5h 12m"
  // `_tick` is unused but forces Angular to re-evaluate this binding on each timeRefreshInterval tick
  getWeeklyResetCountdown(_tick = this.timeRefreshTick): string {
    const nextReset = new Date(this.receiptService.getWeekStart());
    nextReset.setDate(nextReset.getDate() + 7);

    const msRemaining = nextReset.getTime() - Date.now();
    const totalMinutes = Math.max(0, Math.ceil(msRemaining / 60_000));

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async addFriend() {
    const alert = await this.alertController.create({
      header: 'Add Friend',
      message: 'Enter your friend\'s username or email:',
      inputs: [
        {
          name: 'identifier',
          type: 'text',
          placeholder: 'Username or email',
          attributes: {
            enterkeyhint: 'send'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send Request',
          handler: async (data: any) => {
            if (!data.identifier.trim()) return;
            
            try {
              await this.socialService.sendFriendRequest(this.currentUser.id, data.identifier.trim());
              
              const toast = await this.toastController.create({
                message: '👥 Friend request sent!',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              
              // Refresh social data
              await this.loadSocialData();
              
            } catch (error) {
              console.error('Error sending friend request:', error);
              const toast = await this.toastController.create({
                message: error instanceof Error ? error.message : 'Failed to send friend request',
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

    // Add Enter key functionality after the alert is presented
    setTimeout(() => {
      const input = document.querySelector('ion-alert input[name="identifier"]') as HTMLInputElement;
      if (input) {
        input.addEventListener('keyup', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            const sendButton = document.querySelector('ion-alert .alert-button:not(.alert-button-role-cancel)') as HTMLButtonElement;
            if (sendButton) {
              sendButton.click();
            }
          }
        });
      }
    }, 100);
  }

  async acceptRequest(requestId: string) {
    try {
      await this.socialService.acceptFriendRequest(requestId);
      
      const toast = await this.toastController.create({
        message: '✅ Friend request accepted!',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      // Refresh social data
      await this.loadSocialData();
      
    } catch (error) {
      console.error('Error accepting friend request:', error);
      const toast = await this.toastController.create({
        message: 'Failed to accept friend request',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async declineRequest(requestId: string) {
    try {
      await this.socialService.declineFriendRequest(requestId);
      
      const toast = await this.toastController.create({
        message: '❌ Friend request declined',
        duration: 2000,
        color: 'medium'
      });
      await toast.present();
      
      // Refresh social data
      await this.loadSocialData();
      
    } catch (error) {
      console.error('Error declining friend request:', error);
      const toast = await this.toastController.create({
        message: 'Failed to decline friend request',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async removeFriend(friend: Friend) {
    const alert = await this.alertController.create({
      header: 'Remove Friend',
      message: `Remove ${friend.friend_profile?.name || 'this friend'} from your friends list?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            try {
              await this.socialService.removeFriend(this.currentUser.id, friend.friend_profile.id);

              this.friends = this.friends.filter(f => f.id !== friend.id);

              const toast = await this.toastController.create({
                message: '👋 Friend removed',
                duration: 2000,
                color: 'medium'
              });
              await toast.present();

            } catch (error) {
              console.error('Error removing friend:', error);
              const toast = await this.toastController.create({
                message: 'Failed to remove friend',
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
  }

  // show_stocks/show_marketplace only affect this specific friend's ability
  // to view/buy the current user's *single-owner* businesses going forward —
  // stocks already purchased are unaffected, and joint ventures (having
  // multiple co-owners) always stay visible to friends regardless of this
  // toggle. show_on_leaderboard is different: it's a viewer-side preference
  // that only changes what the current user sees on their own leaderboards —
  // the friend's stats stay saved either way, so switching it back on later
  // brings them right back.
  async onFriendVisibilityToggle(friend: Friend, field: 'show_stocks' | 'show_marketplace' | 'show_on_leaderboard', checked: boolean) {
    if (!this.currentUser) return;

    const previous = friend[field];
    friend[field] = checked;

    try {
      await this.socialService.setFriendVisibility(this.currentUser.id, friend.friend_profile.id, { [field]: checked });
    } catch (error) {
      console.error('Error updating friend visibility setting:', error);
      friend[field] = previous;

      const toast = await this.toastController.create({
        message: 'Failed to update setting',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  formatTimeAgo(date: string, _tick = this.timeRefreshTick): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  }

  private readonly jointVentureNotificationTypes = new Set([
    'joint_venture_invite', 'joint_venture_upgrade_request', 'joint_venture_deletion_vote', 'joint_venture_resolved'
  ]);

  isJointVentureNotification(notification: any): boolean {
    return this.jointVentureNotificationTypes.has(notification?.type);
  }

  /** Called after a joint-venture notification card's Accept/Decline/Pay/Vote action resolves. */
  async onJointVentureNotificationResolved() {
    await this.loadSocialData();
  }

  /** Called after a joint-venture notification card is deleted — the card already deleted itself server-side. */
  async onJointVentureNotificationDeleted(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      await this.socialService.markPokeAsRead(notificationId);

      // Update local state
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.is_read = true;
        this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);

        // Show success feedback
        const toast = await this.toastController.create({
          message: '✅ Notification marked as read',
          duration: 1500,
          color: 'success'
        });
        await toast.present();
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      const toast = await this.toastController.create({
        message: `Failed to mark notification as read: ${(error as any)?.message || 'Unknown error'}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const unreadNotifications = this.notifications.filter(n => !n.is_read);
      
      if (unreadNotifications.length === 0) {
        const toast = await this.toastController.create({
          message: '✅ All notifications are already read',
          duration: 2000,
          color: 'medium'
        });
        await toast.present();
        return;
      }
      
      // Mark all unread notifications as read with better error handling
      const results = await Promise.allSettled(
        unreadNotifications.map(notification => this.socialService.markPokeAsRead(notification.id))
      );
      
      // Count successes and failures
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          // Update local state for successful updates
          const notification = unreadNotifications[index];
          const localNotification = this.notifications.find(n => n.id === notification.id);
          if (localNotification) {
            localNotification.is_read = true;
          }
        } else {
          failureCount++;
          console.error(`❌ Failed to mark notification ${unreadNotifications[index].id} as read:`, result.reason);
        }
      });

      if (successCount > 0) {
        this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);
      }

      // Show appropriate toast message
      if (failureCount === 0) {
        const toast = await this.toastController.create({
          message: `✅ Marked ${successCount} notifications as read`,
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      } else if (successCount > 0) {
        const toast = await this.toastController.create({
          message: `⚠️ Marked ${successCount} as read, ${failureCount} failed`,
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
      } else {
        throw new Error(`All ${failureCount} notifications failed to update`);
      }
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      const toast = await this.toastController.create({
        message: `Failed to mark notifications as read: ${(error as any)?.message || 'Unknown error'}`,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      // Find the notification in the local array to verify it exists
      const notificationToDelete = this.notifications.find(n => n.id === notificationId);
      if (!notificationToDelete) {
        console.error('❌ Notification not found in local array');
        throw new Error('Notification not found in local array');
      }

      // Call the social service to delete the notification
      await this.socialService.deleteNotification(notificationId);

      // Remove the notification from the local array
      this.notifications = this.notifications.filter(n => n.id !== notificationId);

      // Show success message
      const toast = await this.toastController.create({
        message: '✅ Notification deleted',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('❌ SocialPage: Error deleting notification:', error);
      const toast = await this.toastController.create({
        message: `Failed to delete notification: ${(error as any)?.message || 'Unknown error'}`,
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async createCurrentUserProfile() {
    try {
      if (!this.currentUser) {
        throw new Error('No current user found');
      }
      
      // Check if profile already exists
      const { data: existingProfile } = await this.authService.supabase
        .from('user_profiles')
        .select('id')
        .eq('id', this.currentUser.id)
        .single();
      
      if (existingProfile) {
        const toast = await this.toastController.create({
          message: '✅ Profile already exists!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        return;
      }
      
      // Create profile for current user
      const { error } = await this.authService.supabase
        .from('user_profiles')
        .insert({
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.user_metadata?.['name'] || this.currentUser.email?.split('@')[0] || 'User',
          cash: 99, // Starting cash
          net_worth: 99
        });
      
      if (error) {
        throw error;
      }

      const toast = await this.toastController.create({
        message: '✅ Profile created successfully!',
        duration: 3000,
        color: 'success'
      });
      await toast.present();
      
      // Reload user profile
      await this.loadCurrentUser();
      
    } catch (error) {
      console.error('Error creating current user profile:', error);
      const toast = await this.toastController.create({
        message: 'Failed to create profile: ' + (error as any)?.message,
        duration: 4000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  async debugFriendRequests() {
    try {
      // Check all friendships in the database for current user
      const { data: allFriendships, error } = await this.authService.supabase
        .from('friendships')
        .select(`
          *,
          sender_profile:user_profiles!friendships_user_id_fkey(id, name, email),
          recipient_profile:user_profiles!friendships_friend_id_fkey(id, name, email)
        `)
        .or(`user_id.eq.${this.currentUser.id},friend_id.eq.${this.currentUser.id}`);

      let debugMessage = `🔍 FRIEND REQUESTS DEBUG\n`;
      debugMessage += `Current user: ${this.currentUser.email}\n`;
      debugMessage += `User ID: ${this.currentUser.id.substring(0, 8)}...\n\n`;
      
      if (error) {
        debugMessage += `❌ Error: ${error.message}\n`;
        debugMessage += `Code: ${error.code}\n`;
        debugMessage += `Details: ${error.details}`;
      } else if (allFriendships && allFriendships.length > 0) {
        debugMessage += `📊 Found ${allFriendships.length} friendship(s):\n\n`;
        
        allFriendships.forEach((friendship, index) => {
          const isIncoming = friendship.friend_id === this.currentUser.id;
          const isOutgoing = friendship.user_id === this.currentUser.id;
          
          debugMessage += `${index + 1}. ${friendship.status.toUpperCase()}\n`;
          debugMessage += `   ID: ${friendship.id}\n`;
          
          if (isIncoming) {
            debugMessage += `   Type: INCOMING REQUEST\n`;
            debugMessage += `   From: ${friendship.sender_profile?.name || 'Unknown'}\n`;
            debugMessage += `   Email: ${friendship.sender_profile?.email}\n`;
          } else if (isOutgoing) {
            debugMessage += `   Type: OUTGOING REQUEST\n`;
            debugMessage += `   To: ${friendship.recipient_profile?.name || 'Unknown'}\n`;
            debugMessage += `   Email: ${friendship.recipient_profile?.email}\n`;
          }
          
          debugMessage += `   Created: ${friendship.created_at}\n\n`;
        });
        
        // Show current arrays
        debugMessage += `\n📝 Current Data Arrays:\n`;
        debugMessage += `Pending Requests: ${this.pendingRequests.length}\n`;
        debugMessage += `Sent Requests: ${this.sentRequests.length}\n`;
        debugMessage += `Friends: ${this.friends.length}\n`;
        
      } else {
        debugMessage += `❌ No friendships found in database\n`;
        debugMessage += `This means no friend requests have been sent or received.`;
      }
      
      const debugAlert = await this.alertController.create({
        header: 'Friend Requests Debug',
        message: debugMessage,
        buttons: [
          'OK',
          {
            text: 'Refresh & Reload',
            handler: async () => {
              await this.loadSocialData();
              const toast = await this.toastController.create({
                message: '🔄 Social data reloaded!',
                duration: 1500,
                color: 'primary'
              });
              await toast.present();
            }
          }
        ]
      });
      await debugAlert.present();
      
    } catch (error) {
      console.error('Error debugging friend requests:', error);
      const errorAlert = await this.alertController.create({
        header: 'Debug Error',
        message: `Failed to debug friend requests: ${(error as any)?.message}`,
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }

  async loadMarketplaceData() {
    if (!this.currentUser) return;

    this.isLoadingMarketplace = true;
    try {
      // Lazy settlement: pay out any of the user's own expired "habit deletion"
      // listings (guaranteed) and close out expired "upgrade" listings (no payout).
      // No scheduled job exists in this app — this is the trigger for that logic.
      await this.marketplaceService.resolveExpiredListings(this.currentUser.id);

      const [listings, unresolvedPurchase] = await Promise.all([
        this.marketplaceService.getListings(this.currentUser.id),
        this.marketplaceService.getUnresolvedPurchase(this.currentUser.id)
      ]);

      this.marketplaceListings = listings;
      this.unresolvedPurchase = unresolvedPurchase;

      // If the Marketplace tab was already selected (e.g. restored from localStorage on
      // load), the listings we just fetched are about to be shown, so clear the badge for
      // them immediately instead of waiting for a segment change that won't happen.
      if (this.selectedSegment === 'marketplace') {
        this.markMarketplaceListingsSeen();
      } else {
        this.socialService.setNotificationBadgeCount(this.bottomNavBadgeCount);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      this.marketplaceListings = [];
    } finally {
      this.isLoadingMarketplace = false;
    }
  }

  /** Streak bonus shown on a listing card, e.g. 23 for "+23%" — capped the same way the listing price is. */
  getStreakBonusPercent(listing: MarketplaceListing): number {
    return Math.min(Math.max(listing.streak_at_listing, 0), 100);
  }

  /** Only a seller's own not-yet-live listing carries a future listed_at — friends never receive these rows at all. */
  isListingPending(listing: MarketplaceListing): boolean {
    return new Date(listing.listed_at).getTime() > Date.now();
  }

  private formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Live countdown shown on a listing card; ticks every second via marketplaceTick.
   * At most 2 of a seller's listings are ever live at once (staggered >=12h
   * apart — see create_marketplace_listing()), so a seller's own listing here
   * may still be queued and not yet visible to friends: show "Lists in..."
   * counting down to listed_at instead of the usual expiry countdown.
   */
  getListingCountdown(listing: MarketplaceListing, _tick = this.marketplaceTick): string {
    if (this.isListingPending(listing)) {
      const msUntilListed = new Date(listing.listed_at).getTime() - Date.now();
      return `Lists in ${this.formatDuration(Math.floor(msUntilListed / 1000))}`;
    }

    const msRemaining = new Date(listing.expires_at).getTime() - Date.now();
    if (msRemaining <= 0) return 'Expired';

    return `${this.formatDuration(Math.floor(msRemaining / 1000))} left`;
  }

  async buyListing(listing: MarketplaceListing) {
    if (listing.is_own || !this.currentUser) return;

    const alert = await this.alertController.create({
      header: '🛒 Buy Business',
      message: `Buy "${listing.business_name}" from ${listing.seller_name} for $${listing.listing_price.toFixed(2)}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Buy',
          handler: async () => {
            try {
              const result = await this.marketplaceService.purchaseListing(this.currentUser.id, listing.id);
              if (!result.success) {
                throw new Error(result.error || 'Purchase failed');
              }

              const toast = await this.toastController.create({
                message: `🎉 Bought "${listing.business_name}" for $${listing.listing_price.toFixed(2)}!`,
                duration: 3000,
                position: 'top',
                color: 'success'
              });
              await toast.present();

              await this.loadCurrentUser();
              await this.loadMarketplaceData();

              if (this.unresolvedPurchase) {
                await this.openResolvePurchaseModal(this.unresolvedPurchase);
              }
            } catch (error) {
              const toast = await this.toastController.create({
                message: error instanceof Error ? error.message : 'Failed to purchase listing',
                duration: 3000,
                position: 'top',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async openResolvePurchaseModal(purchase: MarketplacePurchase) {
    if (!this.currentUser) return;

    let eligibleBusinesses: HabitBusiness[] = [];
    try {
      const ownedBusinesses = await this.habitBusinessService.getUserHabitBusinesses(this.currentUser.id);
      eligibleBusinesses = ownedBusinesses.filter(
        // Joint ventures upgrade only via the group-payment flow (JointVentureService.proposeUpgrade()),
        // never this single-owner merge — see resolve_marketplace_purchase()'s own is_joint_venture guard.
        hb => !hb.is_joint_venture && (hb.business_types?.base_cost ?? hb.cost) <= purchase.base_cost
      );
    } catch (error) {
      console.error('Error loading businesses eligible for merge:', error);
    }

    const modal = await this.modalController.create({
      component: MarketplacePurchaseModalComponent,
      componentProps: {
        purchase,
        eligibleBusinesses,
        modalController: this.modalController
      },
      cssClass: 'marketplace-purchase-modal'
    });

    await modal.present();
    const { data } = await modal.onDidDismiss<MarketplacePurchaseResolution>();
    if (!data) return; // Dismissed without choosing — stays unresolved; the nudge banner will prompt again next visit.

    try {
      if (data.mode === 'merge') {
        await this.marketplaceService.resolvePurchaseIntoExisting(this.currentUser.id, purchase.id, data.targetHabitBusinessId);
      } else {
        // The habit_businesses insert trigger (create_stock_on_business_creation) creates
        // the stock listing automatically — no separate createBusinessStock call needed here.
        await this.marketplaceService.resolvePurchaseIntoNewHabit(
          this.currentUser.id,
          purchase.id,
          data.businessName,
          data.habitDescription,
          data.recurrenceInterval,
          data.goalValue,
          data.activeDays
        );
      }

      this.marketplaceService.clearUnresolvedPurchase();
      this.unresolvedPurchase = null;

      const resolvedName = data.mode === 'new' ? data.businessName : purchase.business_name;
      const toast = await this.toastController.create({
        message: `✅ "${resolvedName}" is set up and ready to go!`,
        duration: 2500,
        position: 'top',
        color: 'success'
      });
      await toast.present();

      await this.loadCurrentUser();
    } catch (error) {
      console.error('Error resolving marketplace purchase:', error);
      const toast = await this.toastController.create({
        message: error instanceof Error ? error.message : 'Failed to finish setting up your purchase',
        duration: 3000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  ionViewWillLeave() {
    if (this.timeRefreshInterval) {
      clearInterval(this.timeRefreshInterval);
      this.timeRefreshInterval = null;
    }
    this.unregisterMarketplaceTick();
  }

  ngOnDestroy() {
    if (this.timeRefreshInterval) {
      clearInterval(this.timeRefreshInterval);
      this.timeRefreshInterval = null;
    }
    this.unregisterMarketplaceTick();
  }

  /** *ngFor trackBy for id-keyed lists (friends, notifications, requests, leaderboards, listings) — keeps DOM nodes stable across reloads (fresh objects each fetch). */
  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  private unregisterMarketplaceTick() {
    if (this.marketplaceTickSubscription) {
      this.marketplaceTickSubscription.unsubscribe();
      this.marketplaceTickSubscription = null;
      this.countdownTickService.unregister();
    }
  }

  // Getter methods for template use
  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  get totalNotificationsBadgeCount(): number {
    return this.unreadNotificationsCount + this.pendingRequests.length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotificationsCount > 0;
  }

  /** Unresolved purchase (1) + friends' listings posted since this user last viewed the Marketplace tab. */
  get marketplaceBadgeCount(): number {
    if (!this.currentUser) return 0;
    const lastSeen = this.marketplaceService.getLastSeenTime(this.currentUser.id);
    const newListingsCount = this.marketplaceListings.filter(
      l => !l.is_own && new Date(l.created_at).getTime() > lastSeen
    ).length;
    return (this.unresolvedPurchase ? 1 : 0) + newListingsCount;
  }

  /** Combined count shown on the bottom-nav Social icon: notifications + marketplace signals. */
  get bottomNavBadgeCount(): number {
    return this.totalNotificationsBadgeCount + this.marketplaceBadgeCount;
  }
}
