import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonCard, IonCardContent, IonSegment, IonSegmentButton,
  IonButton, IonIcon, IonLabel, IonBadge, IonSpinner, ToastController, AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

import { SocialService, Friend } from '../services/social.service';
import { HabitBusinessService } from '../services/habit-business.service';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { addIcons } from 'ionicons';
import { 
  people, personAdd, arrowBack, medalOutline, star, checkmarkCircle, business,
  notifications, checkmark, close, notificationsOutline, logOut, settings, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
  standalone: true,
    imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonCard, IonSegment, IonSegmentButton,
    IonCardContent, IonButton, IonIcon, IonLabel, IonBadge, IonSpinner,
    BottomNavComponent, CommonModule, RouterLink
  ],
})
export class SocialPage implements OnInit {
  private isInitialized = false;
  
  currentUser: any = null;
  userProfile: any = null;
  selectedSegment: 'friends' | 'notifications' | 'requests' | 'leaderboard' = 'friends';
  
  // Social data
  friends: Friend[] = [];
  notifications: any[] = [];
  pendingRequests: any[] = [];
  sentRequests: any[] = [];
  friendsLeaderboard: any[] = [];
  
  // UI state
  isLoading = false;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private socialService: SocialService,
    private habitBusinessService: HabitBusinessService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({settings,logOut,people,notificationsOutline,notifications,medalOutline,personAdd,trashOutline,checkmark,close,arrowBack,star,checkmarkCircle,business});
    
    // Restore the previously selected tab from localStorage
    const savedTab = localStorage.getItem('social-selected-tab');
    if (savedTab && ['friends', 'notifications', 'requests', 'leaderboard'].includes(savedTab)) {
      this.selectedSegment = savedTab as 'friends' | 'notifications' | 'requests' | 'leaderboard';
    }
  }

  async ionViewWillEnter() {
    console.log('🔍 SocialPage: ionViewWillEnter');
    
    // Always ensure data is loaded when entering the view
    if (!this.isInitialized) {
      await this.initializePage();
    } else {
      // Refresh data if already initialized
      await this.loadSocialData();
    }
  }

  async initializePage() {
    console.log('🔍 SocialPage: initializePage started');
    
    if (this.isInitialized) {
      console.log('🔍 SocialPage: Already initialized in initializePage, skipping');
      return;
    }
    
    this.isLoading = true;
    
    try {
      console.log('🔍 SocialPage: Loading current user...');
      await this.loadCurrentUser();
      
      if (this.currentUser) {
        console.log('✅ SocialPage: User found, loading social data...');
        await this.loadSocialData();
        console.log('✅ SocialPage: Social data loaded successfully');
        this.isInitialized = true;
      } else {
        console.log('❌ SocialPage: No user found, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('❌ SocialPage: Error initializing social page:', error);
      // Don't redirect on initialization errors, just show empty state
    } finally {
      this.isLoading = false;
      console.log('✅ SocialPage: Initialization complete');
    }
  }

  async ngOnInit() {
    console.log('🔍 SocialPage: ngOnInit started');
    
    // Prevent double initialization
    if (this.isInitialized) {
      console.log('🔍 SocialPage: Already initialized, skipping');
      return;
    }
    
    // Always initialize when the component is created
    // The ionViewWillEnter will handle refreshing if needed
    await this.initializePage();
  }

  async loadCurrentUser() {
    try {
      console.log('🔍 SocialPage: Loading current user...');
      const { data: { user }, error: userError } = await this.authService.getUser();
      
      if (userError) {
        console.error('❌ SocialPage: Error getting user from auth:', userError);
        this.currentUser = null;
        return;
      }
      
      this.currentUser = user;
      console.log('✅ SocialPage: User loaded successfully:', user?.id);
      
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
            console.log('User profile loaded:', profile.name);
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
      console.log('No current user, skipping social data load');
      return;
    }
    
    console.log('Loading social data for user:', this.currentUser.id);
    
    try {
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
      
      console.log('Social data loaded:', { 
        friends: this.friends.length, 
        notifications: this.notifications.length,
        pendingRequests: this.pendingRequests.length, 
        sentRequests: this.sentRequests.length, 
        leaderboard: this.friendsLeaderboard.length 
      });

      // Debug: Check notification structure
      if (this.notifications.length > 0) {
        console.log('🔍 First notification structure:', this.notifications[0]);
        console.log('🔍 All notification IDs:', this.notifications.map(n => ({ id: n.id, hasId: !!n.id })));
      }

      // Debug: Check what profiles actually exist in the database
      try {
        const { data: allProfiles, error: profilesError } = await this.authService.supabase
          .rpc('debug_user_profiles');
        
        console.log('🔍 All user profiles in database:', allProfiles);
        if (profilesError) {
          console.error('❌ Error fetching all profiles:', profilesError);
        }
      } catch (debugError) {
        console.log('Debug function not available yet:', debugError);
      }      // If leaderboard failed or is empty, create a simple fallback with just the user
      if (leaderboard.status === 'rejected' || this.friendsLeaderboard.length === 0) {
        console.log('Creating fallback leaderboard with current user');
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

  formatTimeAgo(date: string): string {
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

  async markNotificationAsRead(notificationId: string) {
    try {
      console.log('🔍 Marking notification as read:', notificationId);
      
      await this.socialService.markPokeAsRead(notificationId);
      console.log('✅ Database update completed');
      
      // Update local state
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        console.log('🔍 Before update - is_read:', notification.is_read);
        notification.is_read = true;
        console.log('✅ After update - is_read:', notification.is_read);
        
        // Show success feedback
        const toast = await this.toastController.create({
          message: '✅ Notification marked as read',
          duration: 1500,
          color: 'success'
        });
        await toast.present();
      } else {
        console.log('❌ Notification not found in local array');
      }
      
      console.log(`✅ Marked notification ${notificationId} as read`);
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
      
      console.log(`🔍 Marking ${unreadNotifications.length} notifications as read...`);
      console.log('🔍 Unread notifications structure:', unreadNotifications.map(n => ({
        id: n.id,
        message: n.message?.substring(0, 50) + '...',
        is_read: n.is_read,
        hasId: !!n.id,
        idType: typeof n.id
      })));
      
      // Mark all unread notifications as read with better error handling
      const results = await Promise.allSettled(
        unreadNotifications.map(notification => {
          console.log(`🔍 Marking notification ${notification.id} as read`);
          return this.socialService.markPokeAsRead(notification.id);
        })
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
      
      console.log(`✅ Mark all complete: ${successCount} success, ${failureCount} failures`);
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
      console.log('🗑️ SocialPage: Deleting notification:', notificationId);
      console.log('🔍 Notification ID type:', typeof notificationId);
      console.log('🔍 Current notifications array:', this.notifications.map(n => ({ id: n.id, message: n.message?.substring(0, 30) + '...' })));
      
      // Find the notification in the local array to verify it exists
      const notificationToDelete = this.notifications.find(n => n.id === notificationId);
      if (!notificationToDelete) {
        console.error('❌ Notification not found in local array');
        throw new Error('Notification not found in local array');
      }
      
      console.log('🔍 Found notification to delete:', {
        id: notificationToDelete.id,
        message: notificationToDelete.message?.substring(0, 50) + '...',
        created_at: notificationToDelete.created_at
      });
      
      // Call the social service to delete the notification
      await this.socialService.deleteNotification(notificationId);
      
      // Remove the notification from the local array
      const originalLength = this.notifications.length;
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      const newLength = this.notifications.length;
      
      console.log(`🔍 Local array update: ${originalLength} → ${newLength} notifications`);
      
      // Show success message
      const toast = await this.toastController.create({
        message: '✅ Notification deleted',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
      
      console.log('✅ SocialPage: Notification deleted successfully');
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
      
      console.log('Creating profile for current user...');
      
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
          cash: 100, // Starting cash
          net_worth: 100
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Created profile for ${this.currentUser.email}`);
      
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
      console.log('🔍 Debug: Checking friend requests...');
      
      // Check all friendships in the database for current user
      const { data: allFriendships, error } = await this.authService.supabase
        .from('friendships')
        .select(`
          *,
          sender_profile:user_profiles!friendships_user_id_fkey(id, name, email),
          recipient_profile:user_profiles!friendships_friend_id_fkey(id, name, email)
        `)
        .or(`user_id.eq.${this.currentUser.id},friend_id.eq.${this.currentUser.id}`);
      
      console.log('All friendships for user:', allFriendships);
      
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

  // Getter methods for template use
  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  get hasUnreadNotifications(): boolean {
    return this.unreadNotificationsCount > 0;
  }
}
