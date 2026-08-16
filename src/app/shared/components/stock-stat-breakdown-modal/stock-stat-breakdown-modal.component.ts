import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import {
  close, statsChart, pricetag, trendingUp, wallet, gift,
  arrowUp, arrowDown, layers
} from 'ionicons/icons';

export interface StockStatBreakdownData {
  businessName: string;
  businessIcon: string;
  sharesOwned: number;
  basePurchasePrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  totalDividendsEarned: number;
}

@Component({
  selector: 'app-stock-stat-breakdown-modal',
  templateUrl: './stock-stat-breakdown-modal.component.html',
  styleUrls: ['./stock-stat-breakdown-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, BusinessIconPipe
  ]
})
export class StockStatBreakdownModalComponent {
  @Input() data!: StockStatBreakdownData;
  @Input() modalController: any;

  constructor() {
    addIcons({ close, statsChart, pricetag, trendingUp, wallet, gift, arrowUp, arrowDown, layers });
  }

  get isProfit(): boolean {
    return (this.data?.profitLoss || 0) >= 0;
  }

  get profitLossPercent(): number {
    const invested = this.data?.totalInvested || 0;
    if (!invested) return 0;
    return ((this.data?.profitLoss || 0) / invested) * 100;
  }

  fmt(n: number): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
