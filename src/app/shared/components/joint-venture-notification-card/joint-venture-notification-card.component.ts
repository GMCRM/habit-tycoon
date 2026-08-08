import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton, IonSpinner, IonBadge, ToastController, AlertController } from '@ionic/angular/standalone';
import { JointVentureService } from '../../../services/joint-venture.service';
import { SocialService } from '../../../services/social.service';
import { AuthService } from '../../../services/auth.service';
import { CountdownTickService } from '../../../services/countdown-tick.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, cashOutline, trashOutline, peopleCircle, timeOutline } from 'ionicons/icons';

/**
 * Renders the four joint-venture notification types (invite, upgrade
 * payment request, deletion vote, generic resolution) in the app's
 * home-card visual language — icon large and centered up top, then name,
 * then the message/question underneath — rather than the horizontal row
 * style the other four (pre-existing) notification types use in
 * social.page.html. Deliberately a separate component/style so the existing
 * notification row is left completely untouched.
 */
@Component({
  selector: 'app-joint-venture-notification-card',
  templateUrl: './joint-venture-notification-card.component.html',
  styleUrls: ['./joint-venture-notification-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton, IonSpinner, IonBadge, BusinessIconPipe]
})
export class JointVentureNotificationCardComponent implements OnInit, OnDestroy {
  @Input() notification: any;
  /** Emitted after any action resolves successfully — parent should reload its notifications list + badge count. */
  @Output() resolved = new EventEmitter<void>();

  acting = false;
  now = Date.now();

  constructor(
    private jointVentureService: JointVentureService,
    private socialService: SocialService,
    private authService: AuthService,
    private countdownTick: CountdownTickService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ checkmarkCircle, closeCircle, cashOutline, trashOutline, peopleCircle, timeOutline });
  }

  ngOnInit() {
    this.countdownTick.register();
    this.countdownTick.tick$.subscribe(t => this.now = t);
  }

  ngOnDestroy() {
    this.countdownTick.unregister();
  }

  get metadata(): any {
    return this.notification?.metadata || {};
  }

  get icon(): string {
    return this.metadata.new_business_icon || this.metadata.business_icon || '🤝';
  }

  get businessName(): string {
    return this.metadata.business_name || 'Joint Venture';
  }

  get isActionable(): boolean {
    return ['joint_venture_invite', 'joint_venture_upgrade_request', 'joint_venture_deletion_vote'].includes(this.notification?.type);
  }

  get expiresInLabel(): string | null {
    const expiresAt = this.metadata.expires_at;
    if (!expiresAt) return null;
    const remainingMs = new Date(expiresAt).getTime() - this.now;
    if (remainingMs <= 0) return 'Expired';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `Expires in ${hours}h ${minutes}m` : `Expires in ${minutes}m`;
  }

  get resolvedOutcomeLabel(): string {
    switch (this.metadata.outcome) {
      case 'funded': return '✅ Funded and live';
      case 'expired': return '⌛ Expired — refunded';
      case 'declined': return '🚫 Declined — refunded';
      case 'upgraded': return '⬆️ Upgrade applied';
      case 'upgrade_expired': return '⌛ Upgrade expired — refunded';
      case 'upgrade_declined': return '🚫 Upgrade declined — refunded';
      case 'deleted': return '🗑️ Deleted';
      case 'vote_failed': return '🚫 Vote failed — business stays';
      case 'vote_expired': return '⌛ Vote expired — business stays';
      default: return '';
    }
  }

  private async currentUserId(): Promise<string | null> {
    const { data: { user } } = await this.authService.getUser();
    return user?.id ?? null;
  }

  private async finishAction(success: boolean, errorMessage?: string) {
    this.acting = false;
    if (success) {
      await this.socialService.markPokeAsRead(this.notification.id);
      this.resolved.emit();
    } else if (errorMessage) {
      const toast = await this.toastController.create({ message: errorMessage, duration: 3000, color: 'danger', position: 'top' });
      await toast.present();
    }
  }

  async onAcceptInvite() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.acceptInvite(userId, this.metadata.proposal_id);
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to accept invite');
    }
  }

  async onDeclineInvite() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    const confirmed = await this.confirmDecline('Decline this invite? Anyone who already paid will be refunded immediately.');
    if (!confirmed) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.declineInvite(userId, this.metadata.proposal_id);
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to decline invite');
    }
  }

  async onPayUpgrade() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.payUpgradeShare(userId, this.metadata.upgrade_proposal_id);
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to pay upgrade share');
    }
  }

  async onDeclineUpgrade() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    const confirmed = await this.confirmDecline('Decline this upgrade? Anyone who already paid will be refunded immediately.');
    if (!confirmed) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.declineUpgrade(userId, this.metadata.upgrade_proposal_id);
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to decline upgrade');
    }
  }

  async onAffirmDeletion() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.castDeletionBallot(userId, this.metadata.vote_id, 'yes');
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to cast vote');
    }
  }

  async onDeclineDeletion() {
    const userId = await this.currentUserId();
    if (!userId || this.acting) return;
    this.acting = true;
    try {
      const result = await this.jointVentureService.castDeletionBallot(userId, this.metadata.vote_id, 'no');
      await this.finishAction(result.success, result.error);
    } catch (e: any) {
      await this.finishAction(false, e?.message || 'Failed to cast vote');
    }
  }

  private async confirmDecline(message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Decline?',
        message,
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => resolve(false) },
          { text: 'Decline', role: 'destructive', handler: () => resolve(true) }
        ]
      });
      await alert.present();
    });
  }
}
