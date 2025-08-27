import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { HabitBusinessService } from '../../../services/habit-business.service';
import { HabitUpdateService, HabitUpdateEvent } from '../../../services/habit-update.service';

export interface HabitGridDay {
  date: string;
  completed: boolean;
  streakDay: number;
  level: number; // 0 = no data, 1 = missed, 2 = completed, 3 = streak milestone
  isInCalendarYear?: boolean; // Flag for calendar year filtering
  isCreatedDate?: boolean; // Flag for when the habit-business was created
}

@Component({
  selector: 'app-habit-grid',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon],
  template: `
    <!-- Modal Header (only shows when used as modal) -->
    <ion-header *ngIf="isModal">
      <ion-toolbar class="custom-toolbar">
        <ion-title class="grid-title">
          <span class="business-emoji">{{ businessEmoji }}</span>
          {{ businessName }} - {{ currentYear }} Progress
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Content wrapper -->
    <div class="content-wrapper" [class.modal-content]="isModal">
      <div class="habit-grid-container">
        <!-- Standard Grid View -->
        <div>
          <!-- Header with month labels -->
          <div class="grid-header">
            <div class="month-labels" [style.grid-template-columns]="'repeat(' + weeks + ', 12px)'">
              <span 
                *ngFor="let month of monthLabels" 
                class="month-label"
                [style.grid-column]="month.column + ' / span ' + month.span">
                {{ month.name }}
              </span>
            </div>
          </div>
          
          <!-- Main grid -->
          <div class="habit-grid" [style.grid-template-columns]="getGridTemplateColumns()">
            <div
              *ngFor="let day of gridDays; trackBy: trackByDate"
              class="grid-day"
              [class.no-data]="day.level === 0"
              [class.missed]="day.level === 1"
              [class.completed]="day.level === 2"
              [class.streak-milestone]="day.level === 3"
              [class.is-today]="isToday(day.date)"
              [class.future-year]="isFutureYear(day.date)"
              [class.first-of-month]="isFirstOfMonth(day.date)"
              [style.background-color]="getDayColor(day)"
              [style.border-color]="getDayBorderColor(day)"
              [style.opacity]="day.level === 0 ? 0.2 : 1"
              (click)="onDayClick(day)">
            </div>
          </div>

          <!-- Stats summary -->
          <div class="grid-stats" *ngIf="showStats">
            <div class="stat">
              <span class="stat-value">{{ completedDays }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ (completionRate * 100).toFixed(0) }}%</span>
              <span class="stat-label">Success Rate</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ currentStreak }}</span>
              <span class="stat-label">Current Streak</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ longestStreak }}</span>
              <span class="stat-label">Longest Streak</span>
            </div>
          </div>
        </div>

        <!-- Debug info (only visible in development) -->
        <div class="debug-info" *ngIf="isDebugMode">
          <p>📊 Debug Info:</p>
          <p>Business ID: {{ businessId }}</p>
          <p>Data Points: {{ data.length }}</p>
          <p>Grid Days: {{ gridDays.length }}</p>
          <p>Using Real Data: {{ usingRealData ? '✅ Yes' : '❌ No (Mock)' }}</p>
        </div>

        <!-- Close Button at Bottom (like upgrade modal) -->
        <div class="modal-footer" *ngIf="isModal">
          <ion-button 
            expand="block" 
            fill="clear" 
            color="medium"
            (click)="closeModal()"
            class="close-button">
            Close
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Hide calendar completely on screens smaller than 1300px */
    @media (max-width: 1299px) {
      :host {
        display: none !important;
      }
    }

    /* Show calendar only on screens 1300px and larger */
    @media (min-width: 1300px) {
      :host {
        display: block;
      }
      
      .habit-grid-container {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-radius: 12px;
        padding: 8px;
        margin: 0;
        width: fit-content;
        max-width: none;
        overflow: visible;
        display: inline-block;
      }
      
      .month-labels {
        font-size: 11px;
      }
      
      .grid-day {
        width: 12px;
        height: 12px;
      }
    }

    /* Modal header styles */
    .custom-toolbar {
      --background: rgba(0, 0, 0, 0.95);
      --color: #fff;
      border-bottom: 1px solid rgba(255, 215, 0, 0.3);
    }

    .grid-title {
      font-size: 1.1rem;
      font-weight: bold;
      color: #fff;
    }

    .business-emoji {
      font-size: 1.3rem;
      margin-right: 8px;
    }

    .close-icon {
      color: #fff !important;
      font-size: 1.4rem;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
    }

    ion-button[fill="clear"] {
      --color: #fff !important;
      --background: rgba(255, 255, 255, 0.1);
      --border-radius: 8px;
    }

    ion-button[fill="clear"]:hover {
      --background: rgba(255, 255, 255, 0.2);
    }

    /* Content wrapper */
    .content-wrapper {
      padding: 8px;
    }

    .modal-content {
      padding: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: #fff;
      height: 100%;
      overflow-y: auto;
      overflow-x: auto;
    }
    
    .grid-header {
      margin-bottom: 8px;
    }
    
    .month-labels {
      display: grid;
      gap: 2px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 8px;
      overflow: visible;
      width: fit-content;
      align-items: baseline; /* Align all labels to the same baseline */
      height: 14px; /* Fixed height to ensure consistent alignment */
    }
    
    .month-label {
      text-align: center;
      font-weight: 500;
      line-height: 1; /* Consistent line height */
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%; /* Take full height of container */
    }
    
    .habit-grid {
      display: grid;
      grid-template-rows: repeat(7, 12px);
      grid-auto-flow: column;
      gap: 2px;
      margin-bottom: 12px;
      overflow: visible;
      width: fit-content;
    }
    
    .grid-day {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
    }
    
    .grid-day.future-year {
      visibility: hidden;
    }
    
    .grid-day:hover {
      transform: scale(1.3);
      z-index: 10;
      border-width: 2px;
    }

    .grid-day.is-today {
      border: 2px solid #FFD700;
      box-shadow: 0 0 4px rgba(255, 215, 0, 0.6);
    }

    .grid-day.first-of-month {
      border: 1px solid rgba(100, 149, 237, 0.5) !important;
      box-shadow: 0 0 2px rgba(100, 149, 237, 0.3);
    }
    
    /* Day Icons Styling */
    .day-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      font-weight: bold;
      z-index: 5;
      pointer-events: none;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
    }
    
    .debug-info {
      margin-top: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 8px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }

    .debug-info p {
      margin: 4px 0;
    }
    
    .grid-stats {
      display: flex;
      justify-content: space-around;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 215, 0, 0.2);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      margin-top: 8px;
      padding: 16px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: bold;
      color: #FFD700;
    }
    
    .stat-label {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

  `]
})
export class HabitGridComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: any[] = [];
  @Input() businessId: string = '';
  @Input() businessName: string = '';
  @Input() businessEmoji: string = '📈';
  @Input() businessType: string = '';
  @Input() businessCreatedAt: string = ''; // When the habit-business was created
  @Input() showStats: boolean = true;
  @Input() weeksToShow: number = 53; // ~1 year by default
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() isModal: boolean = false;
  @Input() modalController: any;
  @Input() isStockView: boolean = false; // New parameter to indicate this is for stock viewing
  @Input() useCalendarYear: boolean = false; // New parameter to show full calendar year Jan-Dec

  // Month navigation properties
  currentMonthOffset: number = 0; // 0 = current month, -1 = previous month, etc.
  showMonthView: boolean = true; // Start with month view as default

  gridDays: HabitGridDay[] = [];
  monthLabels: { name: string; column: number; span: number; row?: number }[] = [];
  weeks: number = 53;
  currentYear: number = new Date().getFullYear(); // Current year for display
  isMobileScreen: boolean = false; // Track if screen is mobile size
  
  // Stats
  totalDays: number = 0;
  completedDays: number = 0;
  completionRate: number = 0;
  currentStreak: number = 0;
  longestStreak: number = 0;

  // Debug info
  usingRealData: boolean = false;
  isDebugMode: boolean = false; // Set to true to see debug info

  private habitBusinessService = inject(HabitBusinessService);
  private habitUpdateService = inject(HabitUpdateService);
  
  // Real-time update subscription
  private updateSubscription?: Subscription;

  // Business color mapping based on emoji/type
  private businessColors: { [key: string]: string } = {
    '🍋': '#FFD700', // Lemonade Stand - bright yellow
    '📰': '#F5F5F5', // Paper Route - off-white
    '🧽': '#87CEEB', // Car Wash - sky blue
    '🛍️': '#FFB6C1', // Retail Store - light pink
    '🍕': '#FF6347', // Pizza Delivery - tomato red
    '🌱': '#90EE90', // Garden Service - light green
    '🎵': '#DDA0DD', // Music Lessons - plum
    '💻': '#00CED1', // Tech Support - dark turquoise
    '🏃': '#FF4500', // Fitness Training - orange red
    '📚': '#4169E1', // Tutoring - royal blue
    '🎨': '#DA70D6', // Art Classes - orchid
    '🐕': '#DEB887', // Pet Care - burlywood
    '🍰': '#F0E68C', // Baking Service - khaki
    '🧹': '#D3D3D3', // Cleaning Service - light gray
    '🚗': '#708090', // Driving Lessons - slate gray
  };

  ngOnInit() {
    console.log('🎯 HabitGrid ngOnInit - businessId:', this.businessId, 'data length:', this.data.length);
    
    // Check initial screen size
    this.checkScreenSize();
    
    // Set up real-time update subscription
    this.setupRealTimeUpdates();
    
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['businessId'] || changes['weeksToShow']) {
      console.log('🔄 HabitGrid data changed, regenerating grid');
      this.loadData();
    }
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  /**
   * Listen for window resize events to adjust grid for mobile
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  /**
   * Check if current screen size is mobile and regenerate grid if needed
   */
  private checkScreenSize() {
    const previousMobileState = this.isMobileScreen;
    this.isMobileScreen = window.innerWidth <= 768; // Mobile breakpoint
    
    // If mobile state changed, regenerate the grid
    if (previousMobileState !== this.isMobileScreen) {
      console.log('📱 Screen size changed - Mobile:', this.isMobileScreen);
      this.generateGrid();
    }
  }

  /**
   * Set up real-time updates for habit completions/undos
   */
  private setupRealTimeUpdates() {
    this.updateSubscription = this.habitUpdateService.updates$.subscribe((event: HabitUpdateEvent | null) => {
      if (!event || !this.businessId) return;
      
      // Only update if this event is for our specific habit business
      if (event.habitBusinessId === this.businessId) {
        console.log('🔥 Real-time update received for habit:', this.businessId, 'Type:', event.type);
        
        // Apply the update immediately to the grid
        this.applyRealTimeUpdate(event);
      }
    });
  }

  /**
   * Apply real-time updates directly to the grid without full reload
   */
  private applyRealTimeUpdate(event: HabitUpdateEvent) {
    const todayStr = this.getLocalDateString();
    const updateDate = event.completionDate || todayStr;
    
    console.log('📊 Applying real-time update:', { 
      type: event.type, 
      date: updateDate, 
      businessId: event.habitBusinessId,
      todayCalculated: todayStr,
      eventCompletionDate: event.completionDate
    });
    
    // Debug: Show what dates we have in the grid
    const gridDates = this.gridDays.map(d => d.date).slice(0, 10); // First 10 dates
    console.log('📅 First 10 grid dates:', gridDates);
    console.log('📅 Last 10 grid dates:', this.gridDays.map(d => d.date).slice(-10));
    
    // Debug: Find dates around today
    const todayIndex = this.gridDays.findIndex(d => d.date === todayStr);
    const updateIndex = this.gridDays.findIndex(d => d.date === updateDate);
    console.log('📍 Today index in grid:', todayIndex, 'Update date index:', updateIndex);
    
    if (todayIndex >= 0) {
      console.log('📅 Grid context around today:', {
        yesterday: this.gridDays[todayIndex - 1]?.date,
        today: this.gridDays[todayIndex]?.date,
        tomorrow: this.gridDays[todayIndex + 1]?.date
      });
    }
    
    // Find the grid cell for today/update date
    let updated = false;
    for (const day of this.gridDays) {
      if (day.date === updateDate) {
        console.log('🎯 Found matching grid cell:', {
          date: day.date,
          currentLevel: day.level,
          currentCompleted: day.completed
        });
        
        if (event.type === 'completion') {
          // Mark as completed
          day.completed = true;
          day.level = 2; // Completed level
          console.log('✅ Updated grid cell for completion:', updateDate);
        } else if (event.type === 'undo') {
          // Mark as not completed
          day.completed = false;
          day.level = 1; // Missed level (since we had data before)
          day.streakDay = 0;
          console.log('↩️ Updated grid cell for undo:', updateDate);
        }
        updated = true;
        break;
      }
    }
    
    if (updated) {
      // Recalculate stats after the update
      this.calculateStats();
      console.log('📈 Grid updated in real-time! Completed days:', this.completedDays);
    } else {
      console.warn('⚠️ Could not find grid cell for date:', updateDate);
      console.warn('⚠️ Available dates in grid:', this.gridDays.length, 'total dates');
      console.warn('⚠️ Date range:', this.gridDays[0]?.date, 'to', this.gridDays[this.gridDays.length - 1]?.date);
    }
  }

  /**
   * Get today's date in local timezone as YYYY-MM-DD string
   */
  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get local date string from any date object
   */
  private getLocalDateStringFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  trackByDate(index: number, day: HabitGridDay): string {
    return day.date;
  }

  isToday(dateStr: string): boolean {
    const todayStr = this.getLocalDateString();
    return dateStr === todayStr;
  }

  isFirstOfMonth(dateStr: string): boolean {
    const date = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
    return date.getDate() === 1;
  }

  isFutureYear(dateStr: string): boolean {
    if (this.isMobileScreen) {
      // Mobile: Hide dates outside 3-month range
      const dayDate = new Date(dateStr + 'T12:00:00');
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Calculate 3-month range (1 month before, current, 1 month after)
      let startMonth = currentMonth - 1;
      let startYear = currentYear;
      if (startMonth < 0) {
        startMonth += 12;
        startYear -= 1;
      }
      
      let endMonth = currentMonth + 1;
      let endYear = currentYear;
      if (endMonth > 11) {
        endMonth -= 12;
        endYear += 1;
      }
      
      const startDate = new Date(startYear, startMonth, 1);
      const endDate = new Date(endYear, endMonth + 1, 0); // Last day of end month
      
      return dayDate < startDate || dayDate > endDate;
    } else {
      // Desktop: Hide dates outside calendar year range
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1 of current year
      const endDate = new Date(currentYear, 11, 31); // December 31 of current year
      const dayDate = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
      
      return dayDate < startDate || dayDate > endDate;
    }
  }

  isFutureDate(dateStr: string): boolean {
    const dayDate = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today to include current day
    return dayDate > today;
  }

  isBeforeCreationDate(dateStr: string): boolean {
    if (!this.businessCreatedAt) return false;
    const dayDate = new Date(dateStr + 'T12:00:00');
    const creationDate = new Date(this.businessCreatedAt);
    return dayDate < creationDate;
  }

  onDayClick(day: HabitGridDay) {
    if (day.level === 0) return;
    console.log('📅 Clicked day:', day.date, 'Completed:', day.completed, 'Streak:', day.streakDay);
  }

  async closeModal() {
    if (this.modalController) {
      await this.modalController.dismiss();
    }
  }

  getCurrentMonthName(): string {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const date = new Date();
    date.setMonth(date.getMonth() + this.currentMonthOffset);
    return monthNames[date.getMonth()];
  }

  getCurrentYear(): number {
    const date = new Date();
    date.setMonth(date.getMonth() + this.currentMonthOffset);
    return date.getFullYear();
  }

  // Month navigation methods
  goToPreviousMonth(): void {
    this.currentMonthOffset--;
    this.loadData();
  }

  goToNextMonth(): void {
    this.currentMonthOffset++;
    this.loadData();
  }

  goToCurrentMonth(): void {
    this.currentMonthOffset = 0;
    this.loadData();
  }

  toggleView(): void {
    console.log('🔄 TOGGLE VIEW:', { 
      from: this.showMonthView ? 'Month' : 'Year', 
      to: !this.showMonthView ? 'Month' : 'Year'
    });
    
    this.showMonthView = !this.showMonthView;
    
    if (this.showMonthView) {
      this.currentMonthOffset = 0; // Reset to current month when switching to month view
      console.log('📅 Switched to MONTH view - should show current month');
    } else {
      console.log('📊 Switched to YEAR view - should show full year');
    }
    
    // Regenerate the grid for the new view
    this.loadData();
  }

  getYearMonths(): any[] {
    const currentYear = this.getCurrentYear();
    const months = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthStart = new Date(currentYear, monthIndex, 1);
      const monthEnd = new Date(currentYear, monthIndex + 1, 0);
      const daysInMonth = monthEnd.getDate();
      
      // Get first day of month (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = monthStart.getDay();
      
      // Create array of days for this month
      const days = [];
      
      // Add empty cells for days before month starts
      for (let i = 0; i < firstDayOfWeek; i++) {
        const prevMonthDay = new Date(currentYear, monthIndex, 0 - (firstDayOfWeek - 1 - i));
        days.push({
          dayNumber: prevMonthDay.getDate(),
          date: this.getLocalDateStringFromDate(prevMonthDay),
          inMonth: false,
          completed: false,
          level: 0
        });
      }
      
      // Add all days in the month
      let completedDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(currentYear, monthIndex, day);
        const dateStr = this.getLocalDateStringFromDate(dayDate);
        const dayData = this.data.find(d => d.date === dateStr);
        
        const isCompleted = dayData?.completed || false;
        if (isCompleted) completedDays++;
        
        days.push({
          dayNumber: day,
          date: dateStr,
          inMonth: true,
          completed: isCompleted,
          level: dayData ? (dayData.completed ? 2 : 1) : 0
        });
      }
      
      // Fill remaining cells to complete the grid (6 rows x 7 days = 42 cells)
      const totalCells = 42;
      const remainingCells = totalCells - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const nextMonthDay = new Date(currentYear, monthIndex + 1, i);
        days.push({
          dayNumber: i,
          date: this.getLocalDateStringFromDate(nextMonthDay),
          inMonth: false,
          completed: false,
          level: 0
        });
      }

      months.push({
        name: monthNames[monthIndex],
        days: days,
        completedDays: completedDays,
        totalDays: daysInMonth
      });
    }

    return months;
  }

  getGridTemplateColumns(): string {
    // Always use standard desktop grid
    return 'repeat(' + this.weeks + ', 12px)'; // Default year view
  }

  getDayNumber(dateStr: string): number {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDate();
  }

  isCurrentMonth(dateStr: string): boolean {
    const date = new Date(dateStr + 'T00:00:00');
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + this.currentMonthOffset);
    return date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear();
  }

  private getBusinessColor(): string {
    // Try to match by emoji first
    const color = this.businessColors[this.businessEmoji];
    if (color) return color;
    
    // Fallback to business type/name matching
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
    if (lowerName.includes('driv') || lowerName.includes('car')) return '#708090';
    
    return '#FFD700'; // Default to gold
  }

  getDayColor(day: HabitGridDay): string {
    if (day.level === 0) {
      return 'rgba(255, 255, 255, 0.05)';
    }
    
    // Check if this is the first day of a month
    if (this.isFirstOfMonth(day.date)) {
      if (day.level === 1) {
        // First of month + missed - subtle purple-gray
        return 'rgba(147, 112, 219, 0.15)'; // Much lighter since we have icons now
      } else if (day.level === 2) {
        // First of month + completed - mix habit color with blue
        const baseColor = this.getBusinessColor();
        return this.mixColors(baseColor, '#6495ED', 0.3); // Much lighter
      } else if (day.level === 3) {
        // First of month + streak milestone - enhanced color
        const baseColor = this.getBusinessColor();
        return this.mixColors(baseColor, '#4169E1', 0.4); // Lighter
      } else {
        // First of month + no data - subtle blue
        return 'rgba(100, 149, 237, 0.1)'; // Lighter
      }
    }
    
    // Default subtle backgrounds since icons now show the main state
    if (day.level === 1) {
      // Missed day - very subtle gray
      return 'rgba(150, 150, 150, 0.05)';
    }
    
    if (day.level === 2) {
      // Completed day - very subtle tint
      return 'rgba(255, 255, 255, 0.08)';
    } else if (day.level === 3) {
      // Streak milestone - slightly more tint
      return 'rgba(255, 255, 255, 0.12)';
    }
    
    return 'rgba(255, 255, 255, 0.05)';
  }

  getDayBorderColor(day: HabitGridDay): string {
    if (day.level === 0) {
      return 'rgba(255, 255, 255, 0.05)';
    }
    
    if (day.level === 1) {
      return 'rgba(150, 150, 150, 0.3)';
    }
    
    const baseColor = this.getBusinessColor();
    
    if (day.level === 2) {
      return this.hexToRgba(baseColor, 0.8);
    } else if (day.level === 3) {
      return baseColor;
    }
    
    return 'rgba(255, 255, 255, 0.1)';
  }

  private hexToRgba(hex: string, alpha: number): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private mixColors(color1: string, color2: string, alpha: number): string {
    // Convert both colors to RGB
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    // Mix the colors (weighted average)
    const weight1 = 0.7; // Weight for the base color
    const weight2 = 0.3; // Weight for the accent color
    
    const r = Math.round(rgb1.r * weight1 + rgb2.r * weight2);
    const g = Math.round(rgb1.g * weight1 + rgb2.g * weight2);
    const b = Math.round(rgb1.b * weight1 + rgb2.b * weight2);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  private async loadData() {
    try {
      console.log('🔍 Loading habit grid data for businessId:', this.businessId);
      console.log('🔍 BusinessId type:', typeof this.businessId, 'Length:', this.businessId?.length);
      console.log('🔍 Stock view mode:', this.isStockView);
      
      // Always try to fetch real data if we have a businessId
      if (this.businessId) {
        console.log('📡 Fetching real habit completion history...');
        
        let history;
        if (this.isStockView) {
          // Use stock-specific method for cross-user data
          console.log('📈 Using stock completion history method');
          history = await this.habitBusinessService.getHabitCompletionHistoryForStock(
            this.businessId, 
            365 // Get full year of data
          );
        } else {
          // Use regular method for own businesses
          console.log('� Using regular completion history method');
          history = await this.habitBusinessService.getHabitCompletionHistory(
            this.businessId, 
            365 // Get full year of data
          );
        }
        
        console.log('📥 Received completion history:', history.length, 'days');
        console.log('📊 Sample completion data:', history.slice(0, 10));
        
        if (history && history.length > 0) {
          this.data = history;
          this.usingRealData = true;
          console.log('✅ Using real data with', this.data.length, 'data points');
          const completedCount = this.data.filter(d => d.completed).length;
          console.log('🎯 Found', completedCount, 'completed days out of', this.data.length, 'total days');
        } else {
          console.warn('⚠️ No completion history found for business:', this.businessId);
          this.data = []; // Use empty data instead of mock
          this.usingRealData = false;
        }
      } else {
        console.log('🎲 No businessId provided - grid will show empty state');
        this.data = [];
        this.usingRealData = false;
      }

      this.generateGrid();
      this.calculateStats();
      
    } catch (error) {
      console.error('❌ Error loading habit grid data:', error);
      console.log('📝 Using empty data due to error');
      this.data = [];
      this.usingRealData = false;
      this.generateGrid();
      this.calculateStats();
    }
  }

  private generateMockData() {
    // Mock data generation removed - we only want to show real habit data
    console.log('🚫 Mock data generation disabled - use real habit completion data only');
    this.data = [];
  }

  private generateGrid() {
    console.log('🏗️ Generating habit grid with', this.data.length, 'data points');
    console.log('📱 Mobile screen:', this.isMobileScreen);
    console.log('⚙️ WeeksToShow input:', this.weeksToShow);
    
    this.gridDays = [];
    this.monthLabels = [];
    
    const currentYear = new Date().getFullYear();
    const today = new Date();
    const todayStr = this.getLocalDateString(today);
    
    // Use weeksToShow input to calculate date range
    let weeksNeeded = this.weeksToShow;
    
    let startDate: Date;
    let endDate: Date;
    
    if (this.useCalendarYear) {
      // Calendar year mode: Show from January 1st to December 31st
      const currentYear = today.getFullYear();
      startDate = new Date(currentYear, 0, 1); // January 1st of current year
      endDate = new Date(currentYear, 11, 31); // December 31st of current year
      
      // Adjust to show full weeks - find the Sunday before or on January 1st
      const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // For Sunday-first calendar, adjust to previous Sunday
      startDate.setDate(startDate.getDate() - startDayOfWeek);
      
      // Adjust end date to show full weeks - find the Saturday after or on December 31st
      const endDayOfWeek = endDate.getDay();
      const saturdayAdjustment = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
      endDate.setDate(endDate.getDate() + saturdayAdjustment);
      
      // Calculate actual weeks needed based on the full calendar year range
      const timeDiff = endDate.getTime() - startDate.getTime();
      weeksNeeded = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
      
      console.log('📅 Calendar year mode:', {
        calendarStart: new Date(currentYear, 0, 1).toDateString(),
        calendarEnd: new Date(currentYear, 11, 31).toDateString(),
        gridStart: startDate.toDateString(),
        gridEnd: endDate.toDateString(),
        weeksCalculated: weeksNeeded
      });
    } else {
      // Original mode: Center around today
      const totalDays = weeksNeeded * 7;
      const daysFromToday = Math.floor(totalDays / 2); // Center around today
      
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysFromToday);
      
      // Adjust startDate to begin on Monday
      const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const mondayAdjustment = (startDayOfWeek + 6) % 7; // Convert to Monday-first (Monday = 0)
      startDate.setDate(startDate.getDate() - mondayAdjustment);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (weeksNeeded * 7) - 1);
      
      console.log('📅 Dynamic range calculation:', {
        weeksToShow: this.weeksToShow,
        totalDays,
        startDate: this.getLocalDateStringFromDate(startDate),
        endDate: this.getLocalDateStringFromDate(endDate),
        mondayStart: startDate.getDay() === 1 ? 'Yes' : 'No (day: ' + startDate.getDay() + ')'
      });
    }
    
    // Check if we need to clear data for new year
    this.checkAndClearNewYearData(currentYear);
    
    console.log(`📅 Grid will show ${weeksNeeded} weeks (${this.weeksToShow} weeks requested)`);
    
    // Generate month labels for the calculated range
    this.generateMonthLabels(startDate, weeksNeeded, startDate, endDate);
    
    // Create grid data - fill column by column with Monday-first weeks
    for (let week = 0; week < weeksNeeded; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + (week * 7) + day);
        const dateStr = this.getLocalDateStringFromDate(currentDate);
        const dataPoint = this.data.find(d => d.date === dateStr);
        
        // Check if this date is within our target range
        const isInTargetRange = currentDate >= startDate && currentDate <= endDate;
        
        let level = 0;
        if (!isInTargetRange) {
          // Dates outside target range - don't show them
          level = 0;
        } else if (dataPoint) {
          if (dataPoint.completed) {
            level = dataPoint.streak_day >= 7 ? 3 : 2;
          } else {
            level = 1; // Missed
          }
        } else if (currentDate > today) {
          level = 0; // Future date
        } else {
          level = 0; // No data for this date
        }
        
        // Check if this date is the business creation date
        const isCreatedDate = this.businessCreatedAt && 
          dateStr === this.getLocalDateStringFromDate(new Date(this.businessCreatedAt));
        
        this.gridDays.push({
          date: dateStr,
          completed: dataPoint?.completed || false,
          streakDay: dataPoint?.streak_day || 0,
          level,
          isInCalendarYear: isInTargetRange, // Rename for clarity
          isCreatedDate: isCreatedDate || false
        } as HabitGridDay & { isInCalendarYear: boolean });
        
        // Debug first week alignment
        if (week === 0) {
          const expectedMonday = day === 0 && currentDate.getDay() === 1;
          console.log(`🔍 Week 0, Day ${day}: ${dateStr} = ${currentDate.toLocaleDateString('en-US', { weekday: 'short' })} (${currentDate.getDay()}) ${expectedMonday ? '✅ Monday start' : ''}`);
        }
      }
    }
    
    this.weeks = weeksNeeded;
    console.log('✅ Generated grid with', this.gridDays.length, 'days');
    console.log('📅 Grid covers:', startDate.toDateString(), 'to', endDate.toDateString());
  }

  /**
   * Check if it's a new year and clear data if needed
   */
  private checkAndClearNewYearData(currentYear: number) {
    const lastDataYear = this.data.length > 0 ? new Date(this.data[this.data.length - 1].date).getFullYear() : currentYear;
    
    if (lastDataYear < currentYear) {
      console.log('🗓️ New year detected! Clearing old year data for fresh start');
      // In a real app, you might want to archive old data instead of clearing
      this.data = [];
    }
  }

  private generateMonthLabels(startDate: Date, weeksToShow: number = this.weeksToShow, targetStartDate?: Date, targetEndDate?: Date) {
    this.monthLabels = [];
    
    // Use target dates if provided (for mobile), otherwise use current year
    const useTargetDates = targetStartDate && targetEndDate;
    
    if (useTargetDates) {
      // Mobile mode: Only show months within the target date range
      const startMonth = targetStartDate!.getMonth();
      const startYear = targetStartDate!.getFullYear();
      const endMonth = targetEndDate!.getMonth();
      const endYear = targetEndDate!.getFullYear();
      
      // Handle year boundary crossing
      let currentMonth = startMonth;
      let currentYear = startYear;
      
      while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
        const firstOfMonth = new Date(currentYear, currentMonth, 1);
        const firstOfMonthStr = this.getLocalDateStringFromDate(firstOfMonth);
        
        // Find which week this date appears in
        let weekColumn = -1;
        
        for (let week = 0; week < weeksToShow; week++) {
          for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + day);
            const currentDateStr = this.getLocalDateStringFromDate(currentDate);
            
            if (currentDateStr === firstOfMonthStr) {
              weekColumn = week + 1; // +1 for grid-column positioning
              break;
            }
          }
          if (weekColumn !== -1) break;
        }
        
        if (weekColumn !== -1) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          this.monthLabels.push({
            name: monthNames[currentMonth],
            column: weekColumn,
            span: 1
          });
        }
        
        // Move to next month
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
      }
    } else {
      // Desktop mode: Show all months for current year
      const currentYear = new Date().getFullYear();
      
      for (let month = 0; month < 12; month++) {
        const firstOfMonth = new Date(currentYear, month, 1);
        const firstOfMonthStr = this.getLocalDateStringFromDate(firstOfMonth);
        
        // Find which week this date appears in
        let weekColumn = -1;
        
        for (let week = 0; week < weeksToShow; week++) {
          for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + day);
            const currentDateStr = this.getLocalDateStringFromDate(currentDate);
            
            if (currentDateStr === firstOfMonthStr) {
              weekColumn = week + 1; // +1 for grid-column positioning
              break;
            }
          }
          if (weekColumn !== -1) break;
        }
        
        if (weekColumn !== -1) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          this.monthLabels.push({
            name: monthNames[month],
            column: weekColumn,
            span: 1
          });
        }
      }
    }
    
    console.log('📅 Month labels positioned above 1st day columns:', this.monthLabels);
  }

  private calculateStats() {
    const todayStr = this.getLocalDateString();
    const validData = this.data.filter(d => d.date <= todayStr);
    
    this.totalDays = validData.length;
    this.completedDays = validData.filter(d => d.completed).length;
    this.completionRate = this.totalDays > 0 ? this.completedDays / this.totalDays : 0;
    
    // Calculate current streak (from most recent day backwards)
    this.currentStreak = 0;
    for (let i = validData.length - 1; i >= 0; i--) {
      if (validData[i].completed) {
        this.currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    this.longestStreak = 0;
    let tempStreak = 0;
    for (const day of validData) {
      if (day.completed) {
        tempStreak++;
        this.longestStreak = Math.max(this.longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    console.log('📊 Grid stats calculated:', {
      totalDays: this.totalDays,
      completedDays: this.completedDays,
      completionRate: (this.completionRate * 100).toFixed(1) + '%',
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak
    });
  }
}
