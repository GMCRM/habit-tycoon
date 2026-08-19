import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { receiptOutline, close, chevronUp, chevronDown } from 'ionicons/icons';

export interface EarningsBreakdown {
  baseEarnings: number;
  streakBonus: number;
  stockBoost: number;
  totalEarnings: number;
}

/** Per-completion earnings breakdown for a habit business, opened from the card's receipt button. */
@Component({
  selector: 'app-earnings-modal',
  templateUrl: './earnings-modal.component.html',
  styleUrls: ['./earnings-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons
  ]
})
export class EarningsModalComponent {
  @Input() businessName: string = '';
  @Input({ required: true }) breakdown!: EarningsBreakdown;
  @Input() modalController: any;

  showBreakdown = false;

  constructor() {
    addIcons({ receiptOutline, close, chevronUp, chevronDown });
  }

  toggleBreakdown() {
    this.showBreakdown = !this.showBreakdown;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
