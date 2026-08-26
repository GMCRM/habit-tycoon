import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { HabitBusiness, HabitBusinessService } from './habit-business.service';
import { JointVentureService } from './joint-venture.service';
import { HabitIntervalService } from './habit-interval.service';
import { HabitUpdateService } from './habit-update.service';
import { SoundService } from './sound.service';
import { OfflineQueuedError } from './offline-queue.service';

export interface HabitCompletionResult {
  /** True once the habit is marked done — either confirmed by the server or queued offline. */
  completed: boolean;
  /** True if `completed` happened by queuing the action for later sync rather than an immediate server confirmation. */
  offlineQueued: boolean;
}

const NOT_COMPLETED: HabitCompletionResult = { completed: false, offlineQueued: false };

/**
 * Single-tap habit completion — regular complete, joint-venture check-in, and
 * the "missed yesterday" backdating prompt. Shared by every one-tap complete
 * button (the Home screen's habit-card and the Pending Habits modal) so they
 * can't drift apart.
 */
@Injectable({ providedIn: 'root' })
export class HabitCompletionService {
  constructor(
    private habitBusinessService: HabitBusinessService,
    private jointVentureService: JointVentureService,
    private habitIntervalService: HabitIntervalService,
    private habitUpdateService: HabitUpdateService,
    private soundService: SoundService,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  /** Complete `hb` via a single tap, routing to the right flow for its type/state. */
  async complete(hb: HabitBusiness): Promise<HabitCompletionResult> {
    if (hb.is_joint_venture) {
      return this.runJointVentureCheckIn(hb);
    }
    if (this.habitIntervalService.didMissYesterday(hb)) {
      return this.showMissedYesterdayAlert(hb);
    }
    return this.completeHabitBusiness(hb);
  }

  private async toast(message: string, color: string, duration = 3000) {
    const toast = await this.toastController.create({ message, duration, position: 'top', color });
    await toast.present();
  }

  private async completeHabitBusiness(hb: HabitBusiness): Promise<HabitCompletionResult> {
    try {
      const { earnings } = await this.habitBusinessService.completeHabit(hb.id);
      this.soundService.playComplete();
      await this.toast(`🎉 Habit "${hb.business_name}" completed! +$${earnings.toFixed(2)} earned`, 'success');
      this.habitUpdateService.emitHabitCompletion(hb.id);
      return { completed: true, offlineQueued: false };
    } catch (error) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = (error as any)?.message || 'Unknown error occurred';
      await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed to complete habit: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
      if (isOfflineQueued) {
        this.habitUpdateService.emitHabitCompletion(hb.id);
        return { completed: true, offlineQueued: true };
      }
      return NOT_COMPLETED;
    }
  }

  private async runJointVentureCheckIn(hb: HabitBusiness): Promise<HabitCompletionResult> {
    const occurredAt = new Date();
    try {
      const result = await this.jointVentureService.checkIn(hb.id, occurredAt);
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
      this.habitUpdateService.emitHabitCompletion(hb.id);
      return { completed: true, offlineQueued: false };
    } catch (error: any) {
      const isOfflineQueued = error instanceof OfflineQueuedError;
      const errorMessage = error?.message || 'Failed to check in';
      await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
      if (isOfflineQueued) {
        this.habitUpdateService.emitHabitCompletion(hb.id);
        return { completed: true, offlineQueued: true };
      }
      return NOT_COMPLETED;
    }
  }

  /** Prompt for a habit not yet completed today whose last completion wasn't yesterday either — let the user backdate to yesterday or complete today instead. */
  private showMissedYesterdayAlert(hb: HabitBusiness): Promise<HabitCompletionResult> {
    return new Promise<HabitCompletionResult>((resolve) => {
      let resolved = false;
      const done = (result: HabitCompletionResult) => {
        if (!resolved) {
          resolved = true;
          resolve(result);
        }
      };

      const showTodayOption = this.habitIntervalService.isTodayActiveDay(hb);

      const buttons: any[] = [
        { text: 'Cancel', role: 'cancel', handler: () => done(NOT_COMPLETED) },
        {
          text: 'Yesterday',
          handler: () => {
            (async () => {
              try {
                await this.habitBusinessService.completeHabitYesterday(hb.id);
                this.soundService.playComplete();
                await this.toast(`✅ "${hb.business_name}" marked complete for yesterday! Earnings added.`, 'success');
                this.habitUpdateService.emitHabitCompletion(hb.id);
                done({ completed: true, offlineQueued: false });
              } catch (error) {
                const isOfflineQueued = error instanceof OfflineQueuedError;
                const errorMessage = (error as any)?.message || 'Unknown error occurred';
                await this.toast(isOfflineQueued ? `📡 ${errorMessage}` : `❌ Failed: ${errorMessage}`, isOfflineQueued ? 'warning' : 'danger');
                if (isOfflineQueued) {
                  this.habitUpdateService.emitHabitCompletion(hb.id);
                  done({ completed: true, offlineQueued: true });
                } else {
                  done(NOT_COMPLETED);
                }
              }
            })();
          }
        }
      ];

      if (showTodayOption) {
        buttons.push({
          text: 'Today',
          handler: () => {
            (async () => done(await this.completeHabitBusiness(hb)))();
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
}
