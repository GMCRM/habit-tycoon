import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import {
  close, statsChart, pricetag, trendingUp, wallet, gift,
  arrowUp, arrowDown, layers, hourglass
} from 'ionicons/icons';

export interface StockStatBreakdownData {
  businessName: string;
  businessIcon: string;
  sharesOwned: number;
  basePurchasePrice: number;
  rampStartPrice?: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  totalDividendsEarned: number;
}

/** Stock price gains are capped at +50% of the ramp anchor per 24h. */
const RAMP_DAILY_RATE = 0.5;

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
    addIcons({ close, statsChart, pricetag, trendingUp, wallet, gift, arrowUp, arrowDown, layers, hourglass });
  }

  get isProfit(): boolean {
    return (this.data?.profitLoss || 0) >= 0;
  }

  get profitLossPercent(): number {
    const invested = this.data?.totalInvested || 0;
    if (!invested) return 0;
    return ((this.data?.profitLoss || 0) / invested) * 100;
  }

  /**
   * True while the stock is still ramping up toward its base price after a
   * business upgrade raised that base - current price stays capped below
   * it until enough real time has passed.
   */
  get isRampingToBase(): boolean {
    const current = this.data?.currentPrice || 0;
    const base = this.data?.basePurchasePrice || 0;
    return current < base && !!this.data?.rampStartPrice;
  }

  get growthNeededPercent(): number {
    const current = this.data?.currentPrice || 0;
    const base = this.data?.basePurchasePrice || 0;
    if (!current) return 0;
    return ((base - current) / current) * 100;
  }

  /**
   * Days until the price ramp reaches the base price, given the +50%/day
   * cap measured from the ramp anchor (see update_stock_price_by_streak in
   * the backend): days = (base - current) / (0.5 * anchor).
   */
  get daysToBase(): number {
    const current = this.data?.currentPrice || 0;
    const base = this.data?.basePurchasePrice || 0;
    const anchor = this.data?.rampStartPrice || 0;
    if (!anchor || base <= current) return 0;
    return (base - current) / (RAMP_DAILY_RATE * anchor);
  }

  formatDaysToBase(): string {
    const days = this.daysToBase;
    if (days <= 0) return '';
    if (days < 1) {
      const hours = Math.max(1, Math.round(days * 24));
      return `~${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const rounded = Math.round(days * 10) / 10;
    return `~${rounded} day${rounded === 1 ? '' : 's'}`;
  }

  fmt(n: number): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
