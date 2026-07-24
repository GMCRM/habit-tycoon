import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, people, trendingUp, home } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { SocialService } from '../../services/social.service';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class BottomNavComponent implements OnInit, OnDestroy {

  @Input() mainButton: 'add' | 'home' = 'add';
  notificationBadgeCount = 0;

  private badgeCountSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private socialService: SocialService
  ) {
    addIcons({ add, people, trendingUp, home });
  }

  async ngOnInit() {
    // Subscribe first so this instance (and any other bottom-nav instance on screen)
    // reflects reads/dismissals from the social page immediately, not just on next load.
    this.badgeCountSubscription = this.socialService.notificationBadgeCount$.subscribe(count => {
      this.notificationBadgeCount = count;
    });

    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        await this.socialService.refreshNotificationBadgeCount(user.id);
      }
    } catch (error) {
      console.error('❌ BottomNav: Failed to load notification badge count:', error);
    }
  }

  ngOnDestroy() {
    this.badgeCountSubscription?.unsubscribe();
  }


  addHabitBusiness() {
    if (this.mainButton === 'home') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/create-habit-business']);
    }
  }

  async openSocial() {
    console.log('🔍 BottomNav: Social button clicked');
    
    // Simple, direct navigation without complex checks
    try {
      await this.router.navigate(['/social']);
      console.log('✅ BottomNav: Navigated to social');
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }

  async openStocks() {
    console.log('🔍 BottomNav: Stocks button clicked - DEBUGGING');
    console.log('🔍 BottomNav: Stocks button clicked');
    
    // Navigate to stocks page
    try {
      await this.router.navigate(['/stocks']);
      console.log('✅ BottomNav: Navigated to stocks');
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }
}
