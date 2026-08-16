import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
export class StockStatBreakdownModalComponent implements OnInit, OnDestroy {
  @Input() data!: StockStatBreakdownData;
  @Input() modalController: any;

  /** Wall-clock time this modal was opened, used to project the ramp forward. */
  private readonly loadedAt = Date.now();
  private nowMs = Date.now();
  private tickIntervalId: any;

  constructor() {
    addIcons({ close, statsChart, pricetag, trendingUp, wallet, gift, arrowUp, arrowDown, layers, hourglass });
  }

  ngOnInit() {
    // The countdown is only displayed to the nearest hour, so a minute-level
    // tick is enough to catch every hour boundary while the modal is open.
    this.tickIntervalId = setInterval(() => {
      this.nowMs = Date.now();
    }, 60_000);
  }

  ngOnDestroy() {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
    }
  }

  get isProfit(): boolean {
    return this.liveProfitLoss >= 0;
  }

  get profitLossPercent(): number {
    const invested = this.data?.totalInvested || 0;
    if (!invested) return 0;
    return (this.liveProfitLoss / invested) * 100;
  }

  /**
   * The stock's price as of right now, projected forward from the price/anchor
   * this modal loaded with. The ramp grows linearly with real elapsed time
   * (see update_stock_price_by_streak in the backend), so this stays accurate
   * without another data fetch: livePrice = current + 0.5/day * anchor * elapsed.
   * Equal to data.currentPrice whenever the stock isn't mid-ramp.
   */
  get livePrice(): number {
    const current = this.data?.currentPrice || 0;
    const base = this.data?.basePurchasePrice || 0;
    const anchor = this.data?.rampStartPrice || 0;
    if (!anchor) return current;
    const elapsedDays = (this.nowMs - this.loadedAt) / (1000 * 60 * 60 * 24);
    return Math.min(base, current + RAMP_DAILY_RATE * anchor * elapsedDays);
  }

  /** Current value of the holding, kept in sync with the live ramping price. */
  get liveCurrentValue(): number {
    return (this.data?.sharesOwned || 0) * this.livePrice;
  }

  /** Profit/loss, kept in sync with the live ramping price. */
  get liveProfitLoss(): number {
    const invested = this.data?.totalInvested || 0;
    return this.liveCurrentValue - invested;
  }

  /**
   * True while the stock is still ramping up toward its base price after a
   * business upgrade raised that base - current price stays capped below
   * it until enough real time has passed.
   */
  get isRampingToBase(): boolean {
    const base = this.data?.basePurchasePrice || 0;
    return !!this.data?.rampStartPrice && this.livePrice < base;
  }

  /** How far the current price has climbed toward the base price, 0-100. */
  get percentOfBase(): number {
    const base = this.data?.basePurchasePrice || 0;
    if (!base) return 100;
    return Math.min(100, Math.max(0, (this.livePrice / base) * 100));
  }

  /**
   * Days remaining until the price ramp reaches the base price, given the
   * +50%/day cap measured from the ramp anchor: days = (base - live) / (0.5 * anchor).
   */
  get daysToBase(): number {
    const base = this.data?.basePurchasePrice || 0;
    const anchor = this.data?.rampStartPrice || 0;
    const remaining = base - this.livePrice;
    if (!anchor || remaining <= 0) return 0;
    return remaining / (RAMP_DAILY_RATE * anchor);
  }

  formatDaysToBase(): string {
    const totalHours = this.daysToBase * 24;
    if (totalHours <= 0) return '';

    if (totalHours < 1) {
      const minutes = Math.max(1, Math.round(totalHours * 60));
      return `~${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    let days = Math.floor(totalHours / 24);
    let hours = Math.round(totalHours % 24);
    if (hours === 24) {
      days += 1;
      hours = 0;
    }

    if (days === 0) return `~${hours} hour${hours === 1 ? '' : 's'}`;
    if (hours === 0) return `~${days} day${days === 1 ? '' : 's'}`;
    return `~${days} day${days === 1 ? '' : 's'} ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  fmt(n: number): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
