import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, close } from 'ionicons/icons';
import { HabitGridComponent } from '../habit-grid/habit-grid.component';
import { StockChartComponent } from '../stock-chart/stock-chart.component';

/** Full year-long completion calendar + stock chart for a habit business, opened from the card's calendar button. */
@Component({
  selector: 'app-calendar-modal',
  templateUrl: './calendar-modal.component.html',
  styleUrls: ['./calendar-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, HabitGridComponent, StockChartComponent
  ]
})
export class CalendarModalComponent {
  @Input() businessId: string = '';
  @Input() businessName: string = '';
  @Input() businessEmoji: string = '';
  @Input() businessType: string = '';
  @Input() businessCreatedAt: string = '';
  @Input() currentStreak: number = 0;
  /** Cross-user data (a friend's business viewed from the Stocks page) instead of the current user's own. */
  @Input() isStockView: boolean = false;
  /** Hide the stock price chart when it's already shown inline elsewhere on the page (e.g. the Stocks page cards). */
  @Input() showStockChart: boolean = true;
  @Input() modalController: any;

  constructor() {
    addIcons({ calendarOutline, close });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
