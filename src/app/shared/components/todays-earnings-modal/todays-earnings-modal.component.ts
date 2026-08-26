import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonSpinner
} from '@ionic/angular/standalone';
import { HabitBusinessService, TodaysEarningsBreakdownItem } from '../../../services/habit-business.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';
import { addIcons } from 'ionicons';
import { logoUsd, close, checkmarkCircle } from 'ionicons/icons';

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
  @Input() userId: string = '';
  /** Initial total from the home screen stat card, shown only as a seed so
   *  there's no flash of $0 before this modal's own fetch resolves — always
   *  superseded by the live per-habit sum computed in load() below. */
  @Input() todaysEarnings: number = 0;
  @Input() modalController: any;

  /** Live total, derived from the fetched breakdown — see load(). */
  liveTodaysEarnings = 0;

  items: TodaysEarningsBreakdownItem[] = [];
  isLoading = true;

  constructor(private habitBusinessService: HabitBusinessService) {
    addIcons({ logoUsd, close, checkmarkCircle });
  }

  async ngOnInit() {
    this.liveTodaysEarnings = this.todaysEarnings;
    await this.load();
  }

  private async load() {
    if (!this.userId) {
      this.isLoading = false;
      return;
    }
    try {
      this.items = await this.habitBusinessService.getTodaysEarningsBreakdown(this.userId);
      this.liveTodaysEarnings = this.items.reduce((total, item) => total + item.totalEarnings, 0);
    } finally {
      this.isLoading = false;
    }
  }

  get totalCompletions(): number {
    return this.items.reduce((total, item) => total + item.completionsCount, 0);
  }

  fmt(n: number | undefined): string {
    return Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByHabitId(_index: number, item: TodaysEarningsBreakdownItem): string {
    return item.habitBusinessId;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
