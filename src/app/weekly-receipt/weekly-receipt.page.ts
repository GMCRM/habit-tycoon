import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
} from '@ionic/angular/standalone';
import { WeeklyReceiptService, WeeklyReceipt, ReceiptDay } from '../services/weekly-receipt.service';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  chevronBack,
  chevronForward,
  receiptOutline,
  trendingUpOutline,
  trendingDownOutline,
  walletOutline,
  alertCircleOutline,
  documentTextOutline,
  close,
} from 'ionicons/icons';

@Component({
  selector: 'app-weekly-receipt',
  templateUrl: './weekly-receipt.page.html',
  styleUrls: ['./weekly-receipt.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonSpinner, IonModal],
})
export class WeeklyReceiptPage implements OnInit {
  loading = true;
  error: string | null = null;
  receipt: WeeklyReceipt | null = null;
  weekStart!: Date;
  isCurrentWeek = false;
  showSummaryModal = false;

  constructor(private receiptService: WeeklyReceiptService, private router: Router) {
    addIcons({
      arrowBack,
      chevronBack,
      chevronForward,
      receiptOutline,
      trendingUpOutline,
      trendingDownOutline,
      walletOutline,
      alertCircleOutline,
      documentTextOutline,
      close,
    });
  }

  async ngOnInit() {
    this.weekStart = this.receiptService.getWeekStart();
    await this.loadWeek();
  }

  async loadWeek() {
    this.loading = true;
    this.error = null;
    try {
      this.receipt = await this.receiptService.getWeeklyReceipt(this.weekStart);
      const currentWeekStart = this.receiptService.getWeekStart();
      this.isCurrentWeek = this.weekStart.getTime() === currentWeekStart.getTime();
    } catch (e) {
      console.error('Failed to load weekly receipt', e);
      this.error = 'Could not load your receipt. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async previousWeek() {
    this.weekStart = this.receiptService.addWeeks(this.weekStart, -1);
    await this.loadWeek();
  }

  async nextWeek() {
    if (this.isCurrentWeek) return;
    this.weekStart = this.receiptService.addWeeks(this.weekStart, 1);
    await this.loadWeek();
  }

  get weekRangeLabel(): string {
    if (!this.receipt) return '';
    const end = new Date(this.receipt.weekEnd);
    end.setDate(end.getDate() - 1); // display inclusive Sunday, not exclusive next Monday
    const startLabel = this.receipt.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
  }

  hasAnyItems(day: ReceiptDay): boolean {
    return day.items.length > 0;
  }

  timeLabel(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  amountLabel(amount: number): string {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${this.formatMoney(Math.abs(amount))}`;
  }

  formatMoney(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
