import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, people, trophy, home } from 'ionicons/icons';
import { Device } from '@capacitor/device';
import { TabsBar } from 'stay-liquid';
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
  useNativeTabs = false;

  private badgeCountSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private nativeTabListener?: { remove: () => void };

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
      .subscribe(event => {
        this.updateActiveSection(event.urlAfterRedirects);
        if (this.useNativeTabs) {
          TabsBar.select({ id: this.activeSection }).catch(() => {});
        }
      });

    // Subscribe first so this instance (and any other bottom-nav instance on screen)
    // reflects reads/dismissals from the social page immediately, not just on next load.
    this.badgeCountSubscription = this.socialService.notificationBadgeCount$.subscribe(count => {
      this.notificationBadgeCount = count;
      if (this.useNativeTabs) {
        TabsBar.setBadge({ id: 'social', value: count > 0 ? count : null }).catch(() => {});
      }
    });

    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        await this.socialService.refreshNotificationBadgeCount(user.id);
      }
    } catch (error) {
      console.error('❌ BottomNav: Failed to load notification badge count:', error);
    }

    await this.setupNativeTabs();
  }

  ngOnDestroy() {
    this.badgeCountSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.nativeTabListener?.remove();
  }

  // iOS 26+ gets the real native Liquid Glass tab bar via the stay-liquid plugin;
  // everything else (older iOS, Android, web) keeps the existing CSS glass bar.
  private async setupNativeTabs() {
    try {
      const deviceInfo = await Device.getInfo();
      if (deviceInfo.platform !== 'ios' || !deviceInfo.iOSVersion || deviceInfo.iOSVersion < 260000) {
        return;
      }

      await TabsBar.configure({
        visible: true,
        initialId: this.activeSection,
        items: [
          {
            id: 'social',
            title: 'Social',
            systemIcon: 'person.2.fill',
            badge: this.notificationBadgeCount > 0 ? this.notificationBadgeCount : null
          },
          {
            id: 'center',
            systemIcon: this.mainButton === 'home' ? 'house.fill' : 'plus.circle.fill'
          },
          {
            id: 'receipt',
            title: 'Awards',
            systemIcon: 'trophy.fill'
          }
        ],
        selectedIconColor: '#FFDB1A',
        unselectedIconColor: 'rgba(255, 219, 26, 0.55)'
      });

      this.nativeTabListener = await TabsBar.addListener('selected', ({ id }) => {
        if (id === 'social') {
          this.openSocial();
        } else if (id === 'receipt') {
          this.openWeeklyReceipt();
        } else {
          this.addHabitBusiness();
        }
      });

      this.useNativeTabs = true;
    } catch (error) {
      console.error('❌ BottomNav: Failed to initialize native Liquid Glass tab bar:', error);
      this.useNativeTabs = false;
    }
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
