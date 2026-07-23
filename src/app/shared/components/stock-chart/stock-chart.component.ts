import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { HabitBusinessService } from '../../../services/habit-business.service';

Chart.register(...registerables);

export interface HabitCompletionPoint {
  date: string;
  completed: boolean;
  streakDay: number;
}

@Component({
  selector: 'app-stock-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" [style.height.px]="height">
      <canvas #chartCanvas></canvas>
      <div *ngIf="data.length === 0" class="chart-placeholder">
        📊 Loading habit chart...
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      margin: 8px 0;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 8px;
      overflow: hidden;
      min-height: 80px;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      border-radius: 8px;
    }

    .chart-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      text-align: center;
    }
  `]
})
export class StockChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() data: HabitCompletionPoint[] = [];
  @Input() businessId: string = '';
  @Input() currentStreak: number = 0;
  @Input() height: number = 80;
  /** When true, fetches history via the cross-user (friend/stock) RPC instead of the owner-scoped query. */
  @Input() isStockView: boolean = false;
  /** Rolling window size in days. Keep this modest — a long window is unreadable as a line and
   *  (for isStockView's 365-day calendar-year mode) would pick up future-dated placeholder entries. */
  @Input() days: number = 30;

  private chart: Chart | null = null;
  private habitBusinessService = inject(HabitBusinessService);

  async ngOnInit() {
    if (this.businessId && this.data.length === 0) {
      await this.loadCompletionData();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createChart();
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['businessId'] || changes['isStockView'] || changes['days']) && this.businessId && this.chartCanvas?.nativeElement) {
      setTimeout(async () => {
        await this.loadCompletionData();
        this.createChart();
      }, 100);
    }

    // If data changes after component is initialized, recreate the chart
    if (changes['data'] && !changes['data'].firstChange && this.chartCanvas?.nativeElement) {
      setTimeout(() => {
        this.createChart();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private async loadCompletionData() {
    try {
      const history = this.isStockView
        ? await this.habitBusinessService.getHabitCompletionHistoryForStock(this.businessId, this.days)
        : await this.habitBusinessService.getHabitCompletionHistory(this.businessId, this.days);
      this.data = history && history.length > 0 ? history : [];
    } catch (error) {
      console.error('Error loading habit completion history:', error);
      this.data = [];
    }
  }

  private createChart() {
    if (!this.chartCanvas?.nativeElement) {
      return;
    }

    // If no data available, show empty chart
    if (this.data.length === 0) {
      return;
    }

    const canvas = this.chartCanvas.nativeElement;

    try {
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      // Find when the business actually started (first completion or non-zero data)
      const businessStartIndex = this.data.findIndex(d => d.completed || d.streakDay > 0);
      const hasBusinessStarted = businessStartIndex !== -1;
      const businessAge = hasBusinessStarted ? this.data.length - businessStartIndex : 0;

      // Today's "in progress" point: not yet completed, but the day isn't over —
      // the streak line correctly holds flat here rather than dropping (see
      // HabitBusinessService's getHabitCompletionHistory), so mark it distinctly
      // rather than letting it render identically to a hard miss.
      const todayStr = this.getLocalDateString(new Date());
      const todayIndex = this.data.findIndex(d => d.date === todayStr && !d.completed);

      // Prepare chart data
      const chartLabels = this.data.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      const streakData = this.data.map(d => d.streakDay);
      const maxStreak = Math.max(...streakData, 5);

      // Calculate trend based on actual business performance
      const businessData = hasBusinessStarted ? this.data.slice(businessStartIndex) : this.data;
      const recentBusinessData = businessData.slice(-Math.min(7, businessData.length)); // Last 7 days or less
      const recentCompletions = recentBusinessData.filter(d => d.completed).length;
      const recentDays = recentBusinessData.length;
      const completionRate = recentDays > 0 ? recentCompletions / recentDays : 0;

      // More nuanced color coding
      let trendColor: string;
      let trendEmoji: string;
      let trendText: string;

      if (businessAge < 3) {
        // Very new business - neutral blue
        trendColor = '#4A90E2';
        trendEmoji = '🆕';
        trendText = 'New Business';
      } else if (completionRate >= 0.8) {
        // Excellent performance - bright green
        trendColor = '#00C851';
        trendEmoji = '🚀';
        trendText = 'Excellent Performance';
      } else if (completionRate >= 0.6) {
        // Good performance - moderate green
        trendColor = '#00d4aa';
        trendEmoji = '📈';
        trendText = 'Good Performance';
      } else if (completionRate >= 0.4) {
        // Average performance - yellow/orange
        trendColor = '#FF8800';
        trendEmoji = '⚠️';
        trendText = 'Needs Improvement';
      } else {
        // Poor performance - red
        trendColor = '#FF4444';
        trendEmoji = '📉';
        trendText = 'Poor Performance';
      }

      // Create chart datasets
      const datasets: any[] = [
        {
          label: 'Habit Streak',
          data: streakData,
          borderColor: trendColor,
          backgroundColor: this.hexToRgba(trendColor, 0.2),
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: streakData.map((_, index) =>
            index === businessStartIndex || index === todayIndex ? 4 : 1
          ),
          pointHoverRadius: 6,
          pointBackgroundColor: streakData.map((_, index) => {
            if (index === businessStartIndex) return '#FFD700';
            if (index === todayIndex) return 'transparent';
            return trendColor;
          }),
          pointBorderColor: streakData.map((_, index) => {
            if (index === businessStartIndex) return '#FF8C00';
            if (index === todayIndex) return trendColor;
            return '#fff';
          }),
          pointBorderWidth: streakData.map((_, index) =>
            index === businessStartIndex || index === todayIndex ? 3 : 1
          )
        }
      ];

      // Add a vertical line for business creation if visible
      if (hasBusinessStarted && businessStartIndex < this.data.length - 1) {
        datasets.push({
          label: 'Business Created',
          data: Array(this.data.length).fill(null).map((_, index) =>
            index === businessStartIndex ? maxStreak * 0.8 : null
          ),
          borderColor: '#FFD700',
          backgroundColor: 'transparent',
          borderWidth: 3,
          pointRadius: [4],
          pointBackgroundColor: '#FFD700',
          pointBorderColor: '#FF8C00',
          pointBorderWidth: 2,
          showLine: false,
          tension: 0
        });
      }

      // Create chart with enhanced configuration
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${trendEmoji} ${trendText} (${businessAge} days)`,
              color: trendColor,
              font: {
                size: 11,
                weight: 'bold'
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              titleColor: '#fff',
              bodyColor: '#fff',
              borderColor: trendColor,
              borderWidth: 2,
              cornerRadius: 8,
              callbacks: {
                title: (context: any) => {
                  const index = context[0].dataIndex;
                  const point = this.data[index];
                  const date = new Date(point.date);
                  return date.toLocaleDateString();
                },
                label: (context: any) => {
                  const dataIndex = context.dataIndex;
                  const point = this.data[dataIndex];
                  const labels = [`Streak: ${point.streakDay} days`];

                  if (dataIndex === businessStartIndex) {
                    labels.unshift('🏢 Business Created');
                  }

                  if (dataIndex === todayIndex) {
                    labels.push('⏳ In progress — day not over yet');
                  } else if (point.completed) {
                    labels.push('✅ Habit Completed');
                  } else if (dataIndex >= businessStartIndex) {
                    labels.push('❌ Habit Missed');
                  } else {
                    labels.push('⚫ Before Business');
                  }

                  return labels;
                }
              }
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false,
              beginAtZero: true,
              max: Math.max(maxStreak + 1, 5)
            }
          }
        }
      });

    } catch (error) {
      console.error('Error creating habit chart:', error);
    }
  }

  /**
   * Get local date string in YYYY-MM-DD format (consistent with other components)
   */
  private getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
