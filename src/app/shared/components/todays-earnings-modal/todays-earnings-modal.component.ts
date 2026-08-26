import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonSpinner
} from '@ionic/angular/standalone';
import { WeeklyReceiptService, ReceiptLineItem } from '../../../services/weekly-receipt.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import { logoUsd, close } from 'ionicons/icons';

@Component({
  selector: 'app-todays-earnings-modal',
  templateUrl: './todays-earnings-modal.component.html',
  styleUrls: ['./todays-earnings-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, IonSpinner, BusinessIconPipe
  ]
})
export class TodaysEarningsModalComponent implements OnInit {
  /** Initial total from the home screen stat card, shown only as a seed so
   *  there's no flash of $0 before this modal's own fetch resolves — always
   *  superseded by the live sum computed in load() below. */
  @Input() todaysEarnings: number = 0;
  @Input() modalController: any;

  /** Live total, derived from the fetched items — see load(). */
  liveTodaysEarnings = 0;

  /** Every source that added to habit cash today — habit completions,
   *  stock dividends, stock sales, business/marketplace sales, and joint
   *  venture refunds — filtered from the full today's receipt to amount > 0
   *  since this popup is only interested in money coming in. */
  items: ReceiptLineItem[] = [];
  isLoading = true;

  constructor(private weeklyReceiptService: WeeklyReceiptService) {
    addIcons({ logoUsd, close });
  }

  async ngOnInit() {
    this.liveTodaysEarnings = this.todaysEarnings;
    await this.load();
  }

  private async load() {
    try {
      const todaysItems = await this.weeklyReceiptService.getTodaysReceiptItems();
      this.items = todaysItems.filter(item => item.amount > 0);
      this.liveTodaysEarnings = this.items.reduce((total, item) => total + item.amount, 0);
    } finally {
      this.isLoading = false;
    }
  }

  fmt(n: number | undefined): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByItemId(_index: number, item: ReceiptLineItem): string {
    return item.id;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
