import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, people, trophy, home } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { SocialService } from '../../services/social.service';

type NavSection = 'social' | 'center' | 'receipt';

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
  activeSection: NavSection = 'center';

  private badgeCountSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private socialService: SocialService
  ) {
    addIcons({ add, people, trophy, home });
  }

  async ngOnInit() {
    this.updateActiveSection(this.router.url);
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateActiveSection(event.urlAfterRedirects));

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
    this.routerSubscription?.unsubscribe();
  }

  private updateActiveSection(url: string) {
    if (url.startsWith('/social')) {
      this.activeSection = 'social';
    } else if (url.startsWith('/weekly-receipt')) {
      this.activeSection = 'receipt';
    } else {
      this.activeSection = 'center';
    }
  }


  async addHabitBusiness() {
    if (this.mainButton === 'home') {
      this.router.navigate(['/home']);
      return;
    }

    this.router.navigate(['/create-habit']);
  }

  async openSocial() {
    // Simple, direct navigation without complex checks
    try {
      await this.router.navigate(['/social']);
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }

  async openWeeklyReceipt() {
    try {
      await this.router.navigate(['/weekly-receipt']);
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }
}
