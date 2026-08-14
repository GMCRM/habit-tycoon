import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonBadge, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { people, close, personCircle, checkmarkCircle, timeOutline, notificationsOutline, checkmark } from 'ionicons/icons';
import { JointVentureService, JointVentureStatusRow } from '../../../services/joint-venture.service';

/**
 * Opened by tapping the "Joint Venture" chip on a habit card. Shows every
 * co-owner's check-in status for today (from the status rows the home page
 * already loaded — no extra fetch) and lets the current user nudge anyone
 * who hasn't checked in yet via a per-person reminder notification.
 */
@Component({
  selector: 'app-jv-participants-modal',
  templateUrl: './jv-participants-modal.component.html',
  styleUrls: ['./jv-participants-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, IonBadge, IonSpinner
  ]
})
export class JvParticipantsModalComponent {
  @Input() businessName = '';
  @Input() habitBusinessId = '';
  @Input() statusRows: JointVentureStatusRow[] = [];
  @Input() currentUserId: string | null = null;
  @Input() modalController: any;

  private sendingIds = new Set<string>();
  private sentIds = new Set<string>();

  constructor(
    private jointVentureService: JointVentureService,
    private toastController: ToastController
  ) {
    addIcons({ people, close, personCircle, checkmarkCircle, timeOutline, notificationsOutline, checkmark });
  }

  /** Checked-in first is less useful than surfacing who still needs a nudge, so pending rows sort to the top; "you" pins first among equals. */
  sortedRows(): JointVentureStatusRow[] {
    return [...this.statusRows].sort((a, b) => {
      if (a.checked_in_today !== b.checked_in_today) return a.checked_in_today ? 1 : -1;
      if (a.co_owner_id === this.currentUserId) return -1;
      if (b.co_owner_id === this.currentUserId) return 1;
      return a.co_owner_name.localeCompare(b.co_owner_name);
    });
  }

  checkedInCount(): number {
    return this.statusRows.filter(r => r.checked_in_today).length;
  }

  progressPercent(): number {
    return this.statusRows.length ? Math.round((this.checkedInCount() / this.statusRows.length) * 100) : 0;
  }

  isSending(id: string): boolean {
    return this.sendingIds.has(id);
  }

  isSent(id: string): boolean {
    return this.sentIds.has(id);
  }

  async sendReminder(row: JointVentureStatusRow) {
    if (!this.currentUserId || this.isSending(row.co_owner_id) || this.isSent(row.co_owner_id)) return;
    this.sendingIds.add(row.co_owner_id);
    try {
      const result = await this.jointVentureService.sendReminder(this.currentUserId, row.co_owner_id, this.habitBusinessId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reminder');
      }
      this.sentIds.add(row.co_owner_id);
      await this.toast(`🤝 Reminder sent to ${row.co_owner_name}!`, 'success');
    } catch (error: any) {
      await this.toast(`❌ ${error?.message || 'Failed to send reminder'}`, 'danger');
    } finally {
      this.sendingIds.delete(row.co_owner_id);
    }
  }

  private async toast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'top', color });
    await toast.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
