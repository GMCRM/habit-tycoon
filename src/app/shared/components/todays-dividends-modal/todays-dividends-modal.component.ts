import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { HabitBusinessService, DividendStatusItem } from '../../../services/habit-business.service';
import { SocialService } from '../../../services/social.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import { trendingUp, close, checkmarkCircle, timeOutline, moonOutline, refresh } from 'ionicons/icons';

/** How often to silently re-fetch while the modal stays open, so a co-owner
 *  checking in elsewhere (or the backend reconciliation sweep — see
 *  reconcile_missed_stock_dividends in
 *  20260825050000_todays_dividend_status_and_reconciliation.sql) shows up
 *  here without the user having to close and reopen the popup. */
const REFRESH_INTERVAL_MS = 60_000;

@Component({
  selector: 'app-todays-dividends-modal',
  templateUrl: './todays-dividends-modal.component.html',
  styleUrls: ['./todays-dividends-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, IonSpinner, BusinessIconPipe
  ]
})
export class TodaysDividendsModalComponent implements OnInit, OnDestroy {
  @Input() userId: string = '';
  /** This viewer's display name, used as the "from" name on a reminder sent from here. */
  @Input() userName: string = '';
  /** Exact "already received today" total from the home screen stat card
   *  the user tapped — shown as the hero figure so the popup's headline
   *  number always matches what they clicked on. */
  @Input() todaysStockEarnings: number = 0;
  @Input() modalController: any;

  items: DividendStatusItem[] = [];
  isLoading = true;
  isRefreshing = false;
  lastUpdatedAt = new Date();
  private refreshIntervalId: any;

  // businessId -> date (toDateString()) a reminder was last sent for it,
  // capped at one per business per day. Scoped by userId below since
  // localStorage is shared across accounts on the same device.
  private dailyReminders: { [businessId: string]: string } = {};

  constructor(
    private habitBusinessService: HabitBusinessService,
    private socialService: SocialService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ trendingUp, close, checkmarkCircle, timeOutline, moonOutline, refresh });
  }

  async ngOnInit() {
    await this.load();
    this.refreshIntervalId = setInterval(() => this.load(true), REFRESH_INTERVAL_MS);
  }

  ngOnDestroy() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
    }
  }

  private async load(silent: boolean = false) {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }
    if (silent) {
      this.isRefreshing = true;
    }
    try {
      this.items = await this.habitBusinessService.getTodaysDividendStatus(this.userId);
      this.lastUpdatedAt = new Date();
      this.syncReminderHistory();
    } finally {
      this.isLoading = false;
      this.isRefreshing = false;
    }
  }

  /** Pulls in today's already-sent reminders (per business) from localStorage. */
  private syncReminderHistory() {
    const today = new Date().toDateString();
    for (const item of this.items) {
      const stored = localStorage.getItem(this.getReminderStorageKey(item.businessId));
      if (stored === today) {
        this.dailyReminders[item.businessId] = stored;
      }
    }
  }

  private getReminderStorageKey(businessId: string): string {
    return `reminder_${this.userId}_${businessId}`;
  }

  hasAlreadyRemindedToday(businessId: string): boolean {
    return this.dailyReminders[businessId] === new Date().toDateString();
  }

  /** Only businesses still due today and not yet completed can be reminded. */
  canRemind(item: DividendStatusItem): boolean {
    return this.statusFor(item) === 'pending';
  }

  async sendReminder(item: DividendStatusItem) {
    if (!this.userId || this.hasAlreadyRemindedToday(item.businessId)) return;

    const alert = await this.alertController.create({
      header: 'Send Reminder',
      message: `Send a reminder to ${item.ownerName} to complete their ${item.businessName} habit?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Send Reminder',
          handler: async () => {
            try {
              await this.socialService.sendStockholderReminder(
                this.userId,
                item.ownerId,
                item.businessName,
                this.userName || 'A fellow investor'
              );

              const today = new Date().toDateString();
              this.dailyReminders[item.businessId] = today;
              localStorage.setItem(this.getReminderStorageKey(item.businessId), today);

              const toast = await this.toastController.create({
                message: `✅ Reminder sent to ${item.ownerName}!`,
                duration: 3000,
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('❌ Error sending stockholder reminder:', error);
              const toast = await this.toastController.create({
                message: `❌ Failed to send reminder: ${(error as any)?.message || 'Please try again.'}`,
                duration: 4000,
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

  async manualRefresh() {
    if (this.isRefreshing) return;
    await this.load(true);
  }

  /** UI status for a row: 'completed' (checkmark), 'resting' (nothing due
   *  today, shown before "not yet completed" so a rest-day business doesn't
   *  read as behind), or 'pending' (not yet completed, due today). */
  statusFor(item: DividendStatusItem): 'completed' | 'resting' | 'pending' {
    if (item.completedToday) return 'completed';
    if (!item.isActiveToday) return 'resting';
    return 'pending';
  }

  /** "Owned by X" for a single owner, "Owned by X & N others" for a joint venture. */
  ownerLabel(item: DividendStatusItem): string {
    const others = (item.coOwnerCount || 1) - 1;
    if (item.isJointVenture && others > 0) {
      return `${item.ownerName} & ${others} other${others === 1 ? '' : 's'}`;
    }
    return item.ownerName;
  }

  get completedCount(): number {
    return this.items.filter(i => i.completedToday).length;
  }

  fmt(n: number | undefined): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByHoldingId(_index: number, item: DividendStatusItem): string {
    return item.holdingId;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
