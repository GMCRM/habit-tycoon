import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ToastController, AlertController, ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle, arrowUndo, arrowBack, chevronUp, chevronDown, trash,
  receiptOutline, calendarOutline, trendingUp, people, create, informationCircleOutline
} from 'ionicons/icons';
import { HabitBusiness, HabitBusinessService } from '../../../services/habit-business.service';
import { JointVentureService, JointVentureStatusRow } from '../../../services/joint-venture.service';
import { OfflineQueuedError } from '../../../services/offline-queue.service';
import { HabitUpdateService } from '../../../services/habit-update.service';
import { HabitIntervalService } from '../../../services/habit-interval.service';
import { CountdownTickService } from '../../../services/countdown-tick.service';
import { SoundService } from '../../../services/sound.service';
import { HabitGridComponent } from '../habit-grid/habit-grid.component';
import { StockChartComponent } from '../stock-chart/stock-chart.component';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { UpgradeModalComponent } from '../../../home/upgrade-modal/upgrade-modal.component';
import { EditHabitModalComponent } from '../../../home/edit-habit-modal/edit-habit-modal.component';
import { StockOwnersModalComponent } from '../stock-owners-modal/stock-owners-modal.component';
import { JvParticipantsModalComponent } from '../jv-participants-modal/jv-participants-modal.component';

/**
 * The habit-business card shown on the home screen — reused as-is (same
 * markup, styles and fully working icons) by the onboarding "complete your
 * habit" step, so the two never drift apart. One instance = one habit;
 * per-item UI state (earnings/grid toggles, in-flight complete/undo) lives
 * locally here instead of being keyed by id in a parent component.
 */
@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon, HabitGridComponent, StockChartComponent, BusinessIconPipe],
})
export class HabitCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) hb!: HabitBusiness;
  @Input() isFirst = true;
  @Input() isLast = true;
  /** Only one card's inline 365-day grid is open at a time — the parent owns that exclusivity. */
  @Input() gridExpanded = false;
  @Input() stockBoostPercent = 0;
  @Input() jvStatusRows: JointVentureStatusRow[] = [];
  @Input() currentUserId: string | null = null;
  @Input() userCash = 0;
  @Input() canDelete = true;

  @Output() reorder = new EventEmitter<'up' | 'down'>();
  @Output() toggleGrid = new EventEmitter<void>();
  /** Fires after any successful action that changes cash/dashboard data (complete, undo, delete, upgrade, edit, JV actions). */
  @Output() changed = new EventEmitter<void>();
  /** Fires when an action was queued offline instead of completing immediately. */
  @Output() offlineQueued = new EventEmitter<void>();

  completing = false;
  undoing = false;
  showEarningsSection = false;
  showEarningsBreakdown = false;
  countdown = '...';

  /** How long after a joint-venture check-in the undo button stays available. */
  private readonly JV_UNDO_WINDOW_MS = 60 * 1000;

  readonly allDows = [0, 1, 2, 3, 4, 5, 6];
  readonly dayChipLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly today = new Date();

  private tickSub?: Subscription;

  constructor(
    private habitBusinessService: HabitBusinessService,
    private jointVentureService: JointVentureService,
    private habitUpdateService: HabitUpdateService,
    private habitIntervalService: HabitIntervalService,
    private countdownTickService: CountdownTickService,
    private soundService: SoundService,
    private toastController: ToastController,
    private alertController: AlertController,
    private modalController: ModalController,
  ) {
    addIcons({ checkmarkCircle, arrowUndo, arrowBack, chevronUp, chevronDown, trash, receiptOutline, calendarOutline, trendingUp, people, create, informationCircleOutline });
  }

  ngOnInit() {
    this.countdownTickService.register();
    this.updateCountdown();
    this.tickSub = this.countdownTickService.tick$.subscribe(() => this.updateCountdown());
  }

  ngOnDestroy() {
    this.tickSub?.unsubscribe();
    this.countdownTickService.unregister();
  }

  private updateCountdown() {
    if (this.hb.is_joint_venture) {
      const secs = this.jointVentureService.getJvSecondsUntilReset(this.hb.joint_venture_timezone || 'UTC');
      this.countdown = this.habitIntervalService.formatCountdown(secs, '24h');
      return;
    }
    const interval = this.habitIntervalService.resolveInterval(this.hb);
    const secs = this.habitIntervalService.getSecondsUntilReset(interval, new Date(), this.hb.active_days);
    this.countdown = this.habitIntervalService.formatCountdown(secs, interval);
  }

  isGoalCompleted(): boolean {
    return this.habitIntervalService.isHabitCompleteForCurrentPeriod(this.hb);
  }

  isTodayActiveDay(): boolean {
    return this.habitIntervalService.isTodayActiveDay(this.hb);
  }

  getNextActiveDayLabel(): string {
    return this.habitIntervalService.getNextActiveDayLabel(this.hb.active_days || []);
  }

  getEffectiveStreak(): number {
    return this.habitIntervalService.getEffectiveStreak(this.hb);
  }

  // ─── Joint venture helpers — pure reads of the status rows the parent loaded ───

  isJvCheckedInToday(): boolean {
    const mine = this.jvStatusRows.find(r => r.co_owner_id === this.currentUserId);
    return !!mine?.checked_in_today;
  }

  jvCheckedInCount(): number {
    return this.jvStatusRows.filter(r => r.checked_in_today).length;
  }

  jvTotalCoOwners(): number {
    return this.jvStatusRows.length;
  }

  jvWaitingOnNames(): string {
    return this.jvStatusRows
      .filter(r => !r.checked_in_today && r.co_owner_id !== this.currentUserId)
      .map(r => r.co_owner_name)
      .join(', ');
  }

  isJvCreator(): boolean {
    return this.hb.user_id === this.currentUserId;
  }

  private jvMyStatusRow(): JointVentureStatusRow | undefined {
    return this.jvStatusRows.find(r => r.co_owner_id === this.currentUserId);
  }

  /** Seconds left in the undo grace window, 0 once it's expired or there's nothing to undo. */
  jvUndoSecondsRemaining(): number {
    const checkedInAt = this.jvMyStatusRow()?.checked_in_at;
    if (!checkedInAt) return 0;
    const elapsedMs = Date.now() - new Date(checkedInAt).getTime();
    return Math.max(0, Math.ceil((this.JV_UNDO_WINDOW_MS - elapsedMs) / 1000));
  }

  canUndoJvCheckIn(): boolean {
    return this.isJvCheckedInToday() && this.jvUndoSecondsRemaining() > 0;
  }

  moveUp() {
    this.reorder.emit('up');
  }

  moveDown() {
    this.reorder.emit('down');
  }

  onToggleGrid() {
    this.toggleGrid.emit();
  }

  private async toast(message: string, color: string, duration = 3000) {
    const toast = await this.toastController.create({ message, duration, position: 'top', color });
    await toast.present();
  }

  /** Instantly complete a habit on a single tap */
  async handleCompleteTap(event: Event) {
    event.preventDefault();
    if (this.completing) return;
    this.completing = true;
    try {
      await this.runCompleteHabit();
    } finally {
      this.completing = false;
    }
  }

  /** Instantly undo a habit completion on a single tap */
  async handleUndoTap(event: Event) {
    event.preventDefault();
    if (this.undoing) return;
    this.undoing = true;
    try {
      await this.undoHabitCompletion();
    } finally {
      this.undoing = false;
    }
  }

  /** Undo a joint-venture check-in on a single tap, while still inside the grace window. */
  async handleJvUndoTap(event: Event) {
    event.preventDefault();
    if (this.undoing) return;
    this.undoing = true;
    try {
      await this.undoJvCheckIn();
    } finally {
      this.undoing = false;
    }
  }

  private async runCompleteHabit() {
    if (this.hb.is_joint_venture) {
      // No "missed yesterday" backdating for joint ventures — retroactively
      // flipping whether a past day was "full attendance" for a shared
      // streak is a correctness minefield with unclear UX value.
      await this.runJointVentureCheckIn();
      return;
    }
    const missedYesterday = this.habitIntervalService.didMissYesterday(this.hb);
    if (missedYesterday) {
      await this.showMissedYesterdayAlert();
    } else {
      await this.completeHabitBusiness();
    }
  }

  private async completeHabitBusiness() {
    try {
      const { earnings } = await this.habitBusinessService.completeHabit(this.hb.id);
      this.soundService.playComplete();
      await this.toast(`🎉 Habit "${this.hb.business_name}" completed! +$${earnings.toFixed(2)} earned`, 'success');
      this.habitUpdateService.emitHabitCompletion(this.hb.id);
      this.changed.emit();
    } catch (error) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to complete habit: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
      if (isOfflineQueued) {
        this.habitUpdateService.emitHabitCompletion(this.hb.id);
        this.offlineQueued.emit();
      }
    }
  }

  private async runJointVentureCheckIn() {
    try {
      const result = await this.jointVentureService.checkIn(this.hb.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to check in');
      }
      const earnings = (result.earnings || 0).toFixed(2);
      const remaining = (result.total || 0) - (result.checked_in || 0);
      const message = result.finalized
        ? `🎉 Everyone checked in! +$${earnings} earned — streak now ${result.streak} day${result.streak === 1 ? '' : 's'}!`
        : `✅ You're in! +$${earnings} earned — waiting on ${remaining} more co-owner${remaining === 1 ? '' : 's'} for today's streak bonus.`;
      this.soundService.playComplete();
      await this.toast(message, 'success', 4000);
      this.habitUpdateService.emitHabitCompletion(this.hb.id);
      this.changed.emit();
    } catch (error: any) {
      await this.toast(`❌ ${error?.message || 'Failed to check in'}`, 'danger');
    }
  }

  private async undoJvCheckIn() {
    try {
      const result = await this.jointVentureService.undoCheckIn(this.hb.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to undo check-in');
      }
      this.soundService.playUndo();
      await this.toast(`↩️ Check-in undone for "${this.hb.business_name}"! -$${(result.earnings || 0).toFixed(2)} removed`, 'warning');
      this.habitUpdateService.emitHabitUndo(this.hb.id);
      this.changed.emit();
    } catch (error: any) {
      await this.toast(`❌ ${error?.message || 'Failed to undo check-in'}`, 'danger');
    }
  }

  /**
   * Show a prompt when the user tries to complete a habit they missed yesterday.
   * Lets them choose to mark yesterday or today as complete.
   */
  private async showMissedYesterdayAlert(): Promise<void> {
    return new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const showTodayOption = this.isTodayActiveDay();

      const buttons: any[] = [
        { text: 'Cancel', role: 'cancel', handler: () => done() },
        {
          text: 'Yesterday',
          handler: () => {
            (async () => {
              try {
                await this.habitBusinessService.completeHabitYesterday(this.hb.id);
                this.soundService.playComplete();
                await this.toast(`✅ "${this.hb.business_name}" marked complete for yesterday! Earnings added.`, 'success');
                this.habitUpdateService.emitHabitCompletion(this.hb.id);
                this.changed.emit();
              } catch (error) {
                const isOfflineQueued = error instanceof OfflineQueuedError;
                const errorMessage = (error as any)?.message || 'Unknown error occurred';
                await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
                if (isOfflineQueued) {
                  this.habitUpdateService.emitHabitCompletion(this.hb.id);
                  this.offlineQueued.emit();
                }
              } finally {
                done();
              }
            })();
          }
        }
      ];

      if (showTodayOption) {
        buttons.push({
          text: 'Today',
          handler: () => {
            (async () => {
              try {
                await this.completeHabitBusiness();
              } finally {
                done();
              }
            })();
          }
        });
      }

      this.alertController.create({
        header: '⏰ Forgot to mark your habit yesterday?',
        message: 'You missed marking this habit yesterday. Did you complete it? You can still mark it as complete.\n\nSelect which day to complete:',
        buttons
      }).then(alert => alert.present());
    });
  }

  private async undoHabitCompletion() {
    try {
      const { earnings } = await this.habitBusinessService.undoHabitCompletion(this.hb.id);
      this.soundService.playUndo();
      await this.toast(`↩️ Completion undone for "${this.hb.business_name}"! -$${earnings.toFixed(2)} removed`, 'warning');
      this.habitUpdateService.emitHabitUndo(this.hb.id);
      this.changed.emit();
    } catch (error) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to undo completion: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
      if (isOfflineQueued) {
        this.habitUpdateService.emitHabitUndo(this.hb.id);
        this.offlineQueued.emit();
      }
    }
  }

  /** Undo the last completion for multi-completion habits (the small back-arrow button). */
  async undoLastCompletion() {
    try {
      await this.habitBusinessService.undoHabitCompletion(this.hb.id);
      this.soundService.playUndo();
      await this.toast(`↩️ Undid completion for "${this.hb.business_name}"`, 'warning', 2000);
      this.habitUpdateService.emitHabitCompletion(this.hb.id);
      this.changed.emit();
    } catch (error) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error';
      await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to undo completion: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
      if (isOfflineQueued) {
        this.habitUpdateService.emitHabitCompletion(this.hb.id);
        this.offlineQueued.emit();
      }
    }
  }

  /** Routes the upgrade button to the group-payment flow for a joint venture, or the single-owner flow otherwise. */
  async onUpgradeClick() {
    if (this.hb.is_joint_venture) {
      await this.proposeJvUpgrade();
    } else {
      await this.upgradeHabitBusiness();
    }
  }

  /** Routes the delete button to the majority-vote flow for a joint venture, or the single-owner Marketplace-listing flow otherwise. */
  async onDeleteClick() {
    if (this.hb.is_joint_venture) {
      await this.initiateJvDeletion();
    } else {
      await this.deleteHabitBusiness();
    }
  }

  private async proposeJvUpgrade() {
    const UPGRADE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    if (this.hb.last_upgraded_at) {
      const msRemaining = UPGRADE_COOLDOWN_MS - (Date.now() - new Date(this.hb.last_upgraded_at).getTime());
      if (msRemaining > 0) {
        await this.toast(`⏳ This business was just upgraded — you can upgrade it again in ${Math.ceil(msRemaining / (60 * 60 * 1000))}h.`, 'warning');
        return;
      }
    }

    try {
      const businessTypes = await this.habitBusinessService.getBusinessTypes();
      const upgradeOptions = businessTypes.filter(bt => bt.base_cost > (this.hb.cost || 0) && bt.id !== this.hb.business_type_id);
      if (upgradeOptions.length === 0) {
        await this.toast('🎉 You already have the best business type available!', 'success');
        return;
      }

      const costDivisor = this.jvTotalCoOwners() || 1;
      const modal = await this.modalController.create({
        component: UpgradeModalComponent,
        componentProps: {
          habitBusiness: this.hb,
          upgradeOptions,
          userCash: this.userCash,
          currentBusinessValue: 0, // no trade-in credit for a joint venture — see propose_joint_venture_upgrade
          costDivisor,
          isJointVenture: true,
          modalController: this.modalController,
          toastController: this.toastController
        },
        cssClass: 'upgrade-modal'
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (!data?.selectedBusinessType || !this.currentUserId) return;

      const result = await this.jointVentureService.proposeUpgrade(this.currentUserId, this.hb.id, data.selectedBusinessType.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to propose upgrade');
      }

      await this.toast(`🤝 Upgrade proposed! Your $${(result.initiator_share || 0).toFixed(2)} share is paid — waiting on the other co-owners.`, 'success', 4000);
      this.changed.emit();
    } catch (error: any) {
      await this.toast(`❌ ${error?.message || 'Failed to propose upgrade'}`, 'danger');
    }
  }

  /** Joint venture deletion: any co-owner can start a majority vote; their own click auto-counts as a "yes" ballot. */
  private async initiateJvDeletion() {
    const totalCoOwners = this.jvTotalCoOwners();
    const alert = await this.alertController.create({
      header: 'Start a Deletion Vote?',
      message: `"${this.hb.business_name}" is co-owned by ${totalCoOwners || 'several'} people. More than half must agree within 24 hours, or the vote expires and nothing changes. Your own vote counts as a "yes".`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Start Vote',
          role: 'destructive',
          handler: () => {
            (async () => {
              try {
                if (!this.currentUserId) return;
                const result = await this.jointVentureService.initiateDeletionVote(this.currentUserId, this.hb.id);
                if (!result.success) {
                  throw new Error(result.error || 'Failed to start deletion vote');
                }
                const message = result.executed
                  ? `🗑️ "${this.hb.business_name}" has been deleted — it's on the Marketplace, and proceeds will split evenly.`
                  : `🗳️ Deletion vote started (1/${result.total_co_owners}) — waiting on the other co-owners.`;
                await this.toast(message, 'success', 4000);
                this.changed.emit();
              } catch (error: any) {
                await this.toast(`❌ ${error?.message || 'Failed to start deletion vote'}`, 'danger');
              }
            })();
          }
        }
      ]
    });
    await alert.present();
  }

  private async upgradeHabitBusiness() {
    // Businesses can only be upgraded once every 24h (server-enforced too —
    // this just avoids a round trip and gives a friendlier message).
    const UPGRADE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    if (this.hb.last_upgraded_at) {
      const msSinceUpgrade = Date.now() - new Date(this.hb.last_upgraded_at).getTime();
      const msRemaining = UPGRADE_COOLDOWN_MS - msSinceUpgrade;
      if (msRemaining > 0) {
        const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));
        await this.toast(`⏳ This business was just upgraded — you can upgrade it again in ${hoursRemaining}h.`, 'warning');
        return;
      }
    }

    try {
      const businessTypes = await this.habitBusinessService.getBusinessTypes();
      const upgradeOptions = businessTypes.filter(bt =>
        bt.base_cost > (this.hb.cost || 0) &&
        bt.id !== this.hb.business_type_id
      );

      if (upgradeOptions.length === 0) {
        await this.toast('🎉 You already have the best business type available!', 'success');
        return;
      }

      const currentBusinessValue = this.habitBusinessService.getMarketplaceListingPrice(this.hb);

      const modal = await this.modalController.create({
        component: UpgradeModalComponent,
        componentProps: {
          habitBusiness: this.hb,
          upgradeOptions,
          userCash: this.userCash,
          currentBusinessValue,
          modalController: this.modalController,
          toastController: this.toastController
        },
        cssClass: 'upgrade-modal'
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data && data.selectedBusinessType) {
        await this.performUpgrade(data.selectedBusinessType, data.upgradeCost);
      }
    } catch (error) {
      await this.toast(`❌ Failed to load upgrade options: ${error}`, 'danger');
    }
  }

  private async performUpgrade(newBusinessType: any, upgradeCost: number) {
    try {
      const { listedAt } = await this.habitBusinessService.upgradeHabitBusiness(this.hb.id, newBusinessType.id, upgradeCost);

      const isQueued = listedAt ? new Date(listedAt).getTime() > Date.now() + 60000 : false;
      await this.toast(
        isQueued
          ? `🎉 Upgraded to ${newBusinessType.icon} ${newBusinessType.name}! Your old "${this.hb.business_name}" is queued for the Marketplace${this.describeListingDelay(new Date(listedAt!))}.`
          : `🎉 Upgraded to ${newBusinessType.icon} ${newBusinessType.name}! Your old "${this.hb.business_name}" is now listed on the Marketplace for friends to buy.`,
        'success', 4500
      );
      this.changed.emit();
    } catch (error) {
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      await this.toast(`❌ Failed to upgrade business: ${errorMessage}`, 'danger');
    }
  }

  async editHabitBusiness() {
    try {
      const modal = await this.modalController.create({
        component: EditHabitModalComponent,
        componentProps: {
          habitBusiness: this.hb,
          modalController: this.modalController
        },
        breakpoints: [0, 1],
        initialBreakpoint: 1
      });

      await modal.present();
      const { data, role } = await modal.onWillDismiss();

      if (role !== 'save' || !data) return;

      try {
        await this.habitBusinessService.updateHabitBusiness(this.hb.id, {
          business_name: data.businessName,
          habit_description: data.habitDescription,
          recurrence_interval: data.recurrenceInterval,
          goal_value: data.goalValue,
          active_days: data.activeDays
        });

        await this.toast(`✅ "${data.businessName}" updated successfully!`, 'success', 2000);
        this.changed.emit();
      } catch (error) {
        await this.toast(`❌ Failed to update: ${(error as any)?.message || 'Unknown error'}`, 'danger');
      }
    } catch (error) {
      console.error('Error opening edit modal:', error);
    }
  }

  /** Show every co-owner's check-in status for today, with a per-person "Remind" nudge for anyone who hasn't checked in. */
  async openJvParticipantsModal() {
    const modal = await this.modalController.create({
      component: JvParticipantsModalComponent,
      componentProps: {
        businessName: this.hb.business_name,
        habitBusinessId: this.hb.id,
        statusRows: this.jvStatusRows,
        currentUserId: this.currentUserId,
        modalController: this.modalController
      },
      cssClass: 'jv-participants-modal'
    });
    await modal.present();
  }

  /** Show who owns shares of this business's stock, and how many each holds */
  async openStockOwnersModal() {
    const modal = await this.modalController.create({
      component: StockOwnersModalComponent,
      componentProps: {
        businessName: this.hb.business_name,
        habitBusinessId: this.hb.id,
        modalController: this.modalController
      },
      cssClass: 'stock-owners-modal'
    });
    await modal.present();
  }

  /**
   * A seller can only have a couple of Marketplace listings live at once
   * (see create_marketplace_listing() — new listings queue >=12h apart
   * behind the seller's other recent ones). Returns "" when a new listing
   * would appear immediately, or a parenthetical like
   * " (queued — appears in ~12h)" to embed in a sentence otherwise.
   */
  private describeListingDelay(listedAt: Date): string {
    const msRemaining = listedAt.getTime() - Date.now();
    if (msRemaining <= 60000) {
      return '';
    }
    const totalMinutes = Math.round(msRemaining / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return ` (queued — appears in ~${parts.join(' ')})`;
  }

  /** Delete (sell) a habit business with loss penalty */
  private async deleteHabitBusiness() {
    try {
      if (!this.canDelete) {
        await this.toast('⚠️ Cannot delete your only habit business! You must have at least one active business.', 'warning', 4000);
        return;
      }

      const listingPrice = this.habitBusinessService.getMarketplaceListingPrice(this.hb);

      const previewListedAt = this.currentUserId
        ? await this.habitBusinessService.previewNextListingTime(this.currentUserId)
        : new Date();
      const queueNotice = this.describeListingDelay(previewListedAt);

      const alert = await this.alertController.create({
        header: '🗑️ Delete Habit',
        message: `Are you sure you want to delete "${this.hb.business_name}"?\n\n🏪 It will be listed on the Marketplace for $${listingPrice.toFixed(2)} for 24 hours so a friend can buy it${queueNotice}.\n💰 You're guaranteed that $${listingPrice.toFixed(2)} either way — sooner if a friend buys it, otherwise automatically 24 hours after it lands on the Marketplace.\n\nThis action cannot be undone.`,
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Delete & List',
            role: 'destructive',
            handler: async () => {
              try {
                const { listingPrice, listedAt } = await this.habitBusinessService.deleteHabitBusiness(this.hb.id);

                const isQueued = listedAt ? new Date(listedAt).getTime() > Date.now() + 60000 : false;
                await this.toast(
                  isQueued
                    ? `📦 "${this.hb.business_name}" is queued — it'll hit the Marketplace for $${listingPrice.toFixed(2)}${this.describeListingDelay(new Date(listedAt!))}.`
                    : `🏪 "${this.hb.business_name}" is listed on the Marketplace for $${listingPrice.toFixed(2)}!`,
                  'success', 4000
                );
                this.changed.emit();
              } catch (error) {
                const errorMessage = (error as any)?.message || 'Unknown error occurred';
                await this.toast(`❌ Failed to sell habit business: ${errorMessage}`, 'danger');
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error creating delete alert:', error);
    }
  }

  /** Calculate earnings breakdown for this habit business */
  getEarningsBreakdown(): { baseEarnings: number; streakBonus: number; stockBoost: number; totalEarnings: number } {
    const baseEarnings = this.hb.earnings_per_completion;
    const currentStreak = this.habitIntervalService.getEffectiveStreak(this.hb);
    const nextStreak = currentStreak + 1;

    const stockBoost = baseEarnings * (this.stockBoostPercent / 100);
    const boostedBaseEarnings = baseEarnings + stockBoost;

    const streakMultiplier = nextStreak === 1
      ? 0
      : this.hb.is_joint_venture
        ? Math.min((nextStreak - 1) * 0.2, 2)
        : Math.min((nextStreak - 1) * 0.1, 1);
    const baseTotal = boostedBaseEarnings + (boostedBaseEarnings * streakMultiplier);
    const streakBonus = baseTotal - boostedBaseEarnings;

    return { baseEarnings, streakBonus, stockBoost, totalEarnings: baseTotal };
  }

  toggleEarningsBreakdown() {
    this.showEarningsBreakdown = !this.showEarningsBreakdown;
  }

  toggleEarningsVisibility() {
    this.showEarningsSection = !this.showEarningsSection;
  }

  /** Format large numbers for display (1.1K, 1.1M, 1.1B, 1.1T, etc.) */
  formatLargeNumber(amount: number): string {
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

  /** Show this habit-business's description in a popup (the description text itself is hidden on the card). */
  async showHabitDescription() {
    const alert = await this.alertController.create({
      header: this.hb.business_name,
      message: this.hb.habit_description || 'No description provided.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
