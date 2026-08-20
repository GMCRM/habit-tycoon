import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { HabitBusinessService } from '../../../services/habit-business.service';
import { HabitUpdateService, HabitUpdateEvent } from '../../../services/habit-update.service';

interface MonthCalendarDay {
  date: string;
  dayNumber: number;
  inMonth: boolean;
  level: number; // 0 = no data, 1 = missed, 2 = completed, 3 = streak milestone
}

/** Typical Sunday-first monthly calendar showing which days a habit was completed this month. */
@Component({
  selector: 'app-month-calendar',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="month-calendar-container">
      <div class="month-calendar-header">{{ monthName }} {{ year }}</div>

      <div class="weekday-row">
        <span class="weekday-label" *ngFor="let d of weekdayLabels">{{ d }}</span>
      </div>

      <div class="month-grid">
        <div
          *ngFor="let day of monthDays"
          class="month-day"
          [class.out-of-month]="!day.inMonth"
          [class.missed]="day.level === 1"
          [class.completed]="day.level === 2"
          [class.streak-milestone]="day.level === 3"
          [class.is-today]="isToday(day.date)"
          [style.background-color]="getDayColor(day)"
          [style.border-color]="getDayBorderColor(day)">
          <span class="day-number">{{ day.dayNumber }}</span>
          <ion-icon *ngIf="day.level === 2 || day.level === 3" name="checkmark-circle" class="day-check"></ion-icon>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .month-calendar-container {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 12px;
      padding: 12px;
      width: 100%;
      box-sizing: border-box;
    }

    .month-calendar-header {
      text-align: center;
      font-size: 1rem;
      font-weight: bold;
      color: #FFD700;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    .weekday-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: 6px;
    }

    .weekday-label {
      text-align: center;
      font-size: 10px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .month-day {
      position: relative;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: transform 0.15s ease;
    }

    .month-day.out-of-month {
      opacity: 0.25;
    }

    .month-day.is-today {
      border: 2px solid #FFD700;
      box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);
    }

    .month-day.streak-milestone {
      box-shadow: 0 0 6px rgba(255, 215, 0, 0.4);
    }

    .day-number {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.85);
    }

    .month-day.missed .day-number {
      color: rgba(255, 255, 255, 0.4);
    }

    .day-check {
      position: absolute;
      bottom: 2px;
      right: 2px;
      font-size: 10px;
      color: #FFD700;
    }

    @media (max-width: 480px) {
      .day-number {
        font-size: 10px;
      }

      .day-check {
        font-size: 8px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthCalendarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() businessId: string = '';
  @Input() businessEmoji: string = '📈';
  @Input() businessName: string = '';
  @Input() businessType: string = '';
  @Input() businessCreatedAt: string = '';
  @Input() isStockView: boolean = false;

  monthDays: MonthCalendarDay[] = [];
  monthName: string = '';
  year: number = new Date().getFullYear();
  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private data: { date: string; completed: boolean; streakDay: number }[] = [];

  private habitBusinessService = inject(HabitBusinessService);
  private habitUpdateService = inject(HabitUpdateService);
  private cdr = inject(ChangeDetectorRef);
  private updateSubscription?: Subscription;

  private businessColors: { [key: string]: string } = {
    '🍋': '#FFD700', '📰': '#F5F5F5', '🧽': '#87CEEB', '🛍️': '#FFB6C1',
    '🍕': '#FF6347', '🌱': '#90EE90', '🎵': '#DDA0DD', '💻': '#00CED1',
    '🏃': '#FF4500', '📚': '#4169E1', '🎨': '#DA70D6', '🐕': '#DEB887',
    '🍰': '#F0E68C', '🧹': '#D3D3D3', '🚗': '#708090',
  };

  constructor() {
    addIcons({ checkmarkCircle });
  }

  ngOnInit() {
    this.updateSubscription = this.habitUpdateService.updates$.subscribe((event: HabitUpdateEvent | null) => {
      if (!event || !this.businessId || event.habitBusinessId !== this.businessId) return;
      this.loadData();
    });

    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['businessId']) {
      this.loadData();
    }
  }

  ngOnDestroy() {
    this.updateSubscription?.unsubscribe();
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.getLocalDateString();
  }

  getDayColor(day: MonthCalendarDay): string {
    if (day.level === 0) {
      return 'rgba(255, 255, 255, 0.05)';
    }
    if (day.level === 1) {
      return 'rgba(150, 150, 150, 0.08)';
    }
    const baseColor = this.getBusinessColor();
    if (day.level === 3) {
      return this.hexToRgba(baseColor, 0.35);
    }
    return this.hexToRgba(baseColor, 0.2);
  }

  getDayBorderColor(day: MonthCalendarDay): string {
    if (day.level === 0) {
      return 'rgba(255, 255, 255, 0.08)';
    }
    if (day.level === 1) {
      return 'rgba(150, 150, 150, 0.3)';
    }
    const baseColor = this.getBusinessColor();
    return this.hexToRgba(baseColor, day.level === 3 ? 1 : 0.7);
  }

  private getBusinessColor(): string {
    const color = this.businessColors[this.businessEmoji];
    if (color) return color;

    const lowerName = this.businessName.toLowerCase();
    const lowerType = this.businessType.toLowerCase();

    if (lowerName.includes('lemon') || lowerType.includes('lemon')) return '#FFD700';
    if (lowerName.includes('paper') || lowerType.includes('paper')) return '#F5F5F5';
    if (lowerName.includes('car') || lowerName.includes('wash')) return '#87CEEB';
    if (lowerName.includes('retail') || lowerName.includes('store')) return '#FFB6C1';
    if (lowerName.includes('pizza') || lowerName.includes('food')) return '#FF6347';
    if (lowerName.includes('garden') || lowerName.includes('plant')) return '#90EE90';
    if (lowerName.includes('music') || lowerName.includes('lesson')) return '#DDA0DD';
    if (lowerName.includes('tech') || lowerName.includes('computer')) return '#00CED1';
    if (lowerName.includes('fitness') || lowerName.includes('gym')) return '#FF4500';
    if (lowerName.includes('tutor') || lowerName.includes('teach')) return '#4169E1';
    if (lowerName.includes('art') || lowerName.includes('paint')) return '#DA70D6';
    if (lowerName.includes('pet') || lowerName.includes('dog')) return '#DEB887';
    if (lowerName.includes('bak') || lowerName.includes('cake')) return '#F0E68C';
    if (lowerName.includes('clean')) return '#D3D3D3';
    if (lowerName.includes('driv')) return '#708090';

    return '#FFD700';
  }

  private hexToRgba(hex: string, alpha: number): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async loadData() {
    if (!this.businessId) {
      this.data = [];
      this.generateMonth();
      this.cdr.markForCheck();
      return;
    }

    try {
      this.data = this.isStockView
        ? await this.habitBusinessService.getHabitCompletionHistoryForStock(this.businessId, 365)
        : await this.habitBusinessService.getHabitCompletionHistory(this.businessId, 365);
    } catch (error) {
      console.error('Error loading month calendar data:', error);
      this.data = [];
    }

    this.generateMonth();
    this.cdr.markForCheck();
  }

  private generateMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.monthName = monthNames[currentMonth];
    this.year = currentYear;

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = monthEnd.getDate();
    const firstDayOfWeek = monthStart.getDay(); // 0 = Sunday

    const days: MonthCalendarDay[] = [];

    // Leading days from the previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth, -i);
      days.push({
        date: this.getLocalDateString(prevDate),
        dayNumber: prevDate.getDate(),
        inMonth: false,
        level: 0
      });
    }

    // Days in the current month
    const todayStr = this.getLocalDateString(today);
    const createdStr = this.businessCreatedAt ? this.getLocalDateString(new Date(this.businessCreatedAt)) : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(currentYear, currentMonth, day);
      const dateStr = this.getLocalDateString(dayDate);
      const dataPoint = this.data.find(d => d.date === dateStr);

      let level = 0;
      if (dateStr > todayStr) {
        level = 0; // Future date
      } else if (createdStr && dateStr < createdStr) {
        level = 0; // Before the habit-business existed
      } else if (dataPoint?.completed) {
        level = dataPoint.streakDay >= 7 ? 3 : 2;
      } else {
        level = 1; // Missed
      }

      days.push({ date: dateStr, dayNumber: day, inMonth: true, level });
    }

    // Trailing days from the next month to fill out complete weeks
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: this.getLocalDateString(nextDate),
        dayNumber: nextDate.getDate(),
        inMonth: false,
        level: 0
      });
    }

    this.monthDays = days;
  }
}
