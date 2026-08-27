import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, arrowBack, business } from 'ionicons/icons';
import { MarketplacePurchase } from '../../services/marketplace.service';
import { BusinessIconPipe } from '../../shared/pipes/business-icon.pipe';

@Component({
  selector: 'app-pending-purchases-modal',
  templateUrl: './pending-purchases-modal.component.html',
  styleUrls: ['./pending-purchases-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons,
    BusinessIconPipe
  ]
})
export class PendingPurchasesModalComponent {
  /** Every business this user has bought but not yet set up, oldest first. */
  @Input() purchases: MarketplacePurchase[] = [];
  @Input() modalController!: ModalController;

  constructor() {
    addIcons({ close, arrowBack, business });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  /** Hand the chosen purchase back to the caller, which opens the existing
   * merge/new-habit flow (MarketplacePurchaseModalComponent) for it. */
  choose(purchase: MarketplacePurchase) {
    this.modalController.dismiss(purchase);
  }

  timeAgo(createdAt: string): string {
    const ms = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
