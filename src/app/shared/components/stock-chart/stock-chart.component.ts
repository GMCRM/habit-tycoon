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
    <div class="chart-container">
      <canvas 
        #chartCanvas 
        style="display: block; width: 100%; height: 200px; background-color: rgba(0,255,0,0.1); border: 2px solid #ffaa00;">
      </canvas>
      <div *ngIf="data.length === 0" class="chart-placeholder">
        📊 Loading habit chart...
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 80px;
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
  @Input() height: number = 120;

  private chart: Chart | null = null;
  private habitBusinessService = inject(HabitBusinessService);

  async ngOnInit() {
    console.log('🔄 StockChart ngOnInit - businessId:', this.businessId, 'existing data length:', this.data.length);
    
    // Only load data if we have a businessId and no existing data
    if (this.businessId && this.data.length === 0) {
      console.log('📡 Loading real completion data for business:', this.businessId);
      await this.loadCompletionData();
    }
    
    console.log('✅ ngOnInit complete - data length:', this.data.length);
  }

  ngAfterViewInit() {
    console.log('=== StockChartComponent - ngAfterViewInit START ===');
    console.log('Chart canvas element:', this.chartCanvas);
    console.log('Chart canvas nativeElement:', this.chartCanvas?.nativeElement);
    
    // Add a delay to ensure DOM is ready, then create the real chart
    setTimeout(() => {
      console.log('=== AFTER TIMEOUT - Creating real habit chart ===');
      this.createChart();
    }, 200);
    
    console.log('=== StockChartComponent - ngAfterViewInit END ===');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('=== StockChartComponent - ngOnChanges ===');
    console.log('Changes:', changes);
    
    // If businessId changes, load new data
    if (changes['businessId'] && this.businessId && this.chartCanvas?.nativeElement) {
      console.log('Business ID changed to:', this.businessId);
      setTimeout(async () => {
        await this.loadCompletionData();
        this.createChart();
      }, 100);
    }
    
    // If data changes after component is initialized, recreate the chart
    if (changes['data'] && !changes['data'].firstChange && this.chartCanvas?.nativeElement) {
      console.log('🔄 Data changed, recreating chart...');
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

  private generateMockCompletionData() {
    console.log('🎲 Generating mock completion data');
    
    // For demo purposes, create data for the last 30 days but start from a random point
    // to simulate businesses of different ages
    const maxDays = 30;
    const businessAge = Math.floor(Math.random() * 25) + 5; // 5-30 days old
    const mockData: HabitCompletionPoint[] = [];
    const today = new Date();
    let currentStreak = 0;
    
    console.log(`📅 Simulating business that's ${businessAge} days old`);
    
    // Fill in "no data" for days before business existed
    for (let i = maxDays - 1; i >= businessAge; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        completed: false,
        streakDay: 0
      });
    }
    
    // Generate realistic data for the business's actual lifetime
    for (let i = businessAge - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic habit completion pattern
      // Start with lower success rate, improve over time (learning curve)
      const daysSinceStart = businessAge - i;
      const experienceBonus = Math.min(daysSinceStart * 0.02, 0.2); // Max 20% bonus
      const streakBonus = Math.min(currentStreak * 0.05, 0.15); // Max 15% streak bonus
      const baseCompletionRate = 0.6; // 60% base rate
      const completionProbability = Math.min(
        baseCompletionRate + experienceBonus + streakBonus, 
        0.9
      );
      
      const completed = Math.random() < completionProbability;
      
      if (completed) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        completed,
        streakDay: currentStreak
      });
    }
    
    this.data = mockData;
    console.log('✅ Generated mock data with', mockData.length, 'points');
    console.log('📊 Business created:', mockData.find(d => d.completed || d.streakDay > 0)?.date || 'unknown');
  }

  private async loadCompletionData() {
    try {
      console.log('🔍 Fetching habit completion history for business:', this.businessId);
      const history = await this.habitBusinessService.getHabitCompletionHistory(this.businessId, 30);
      console.log('📥 Received completion history:', history.length, 'days');
      
      if (history && history.length > 0) {
        this.data = history;
        console.log('✅ Using real habit completion data with', this.data.length, 'data points');
      } else {
        console.warn('⚠️ No completion history returned for business:', this.businessId);
        this.data = []; // Use empty data instead of mock data
      }
    } catch (error) {
      console.error('❌ Error loading habit completion history:', error);
      this.data = []; // Use empty data instead of mock data
    }
  }

  private createChart() {
    console.log('📊 Creating chart with data:', this.data.length, 'points');
    
    if (!this.chartCanvas?.nativeElement) {
      console.error('❌ Chart canvas not found');
      return;
    }
    
    // If no data available, show empty chart
    if (this.data.length === 0) {
      console.warn('⚠️ No data available for chart - showing empty state');
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    console.log('Canvas context available:', !!canvas.getContext('2d'));

    try {
      // Destroy existing chart if it exists
      if (this.chart) {
        console.log('Destroying existing chart');
        this.chart.destroy();
      }

      // Find when the business actually started (first completion or non-zero data)
      const businessStartIndex = this.data.findIndex(d => d.completed || d.streakDay > 0);
      const hasBusinessStarted = businessStartIndex !== -1;
      const businessAge = hasBusinessStarted ? this.data.length - businessStartIndex : 0;
      
      console.log('📅 Business started at index:', businessStartIndex, 'Age:', businessAge, 'days');

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
      
      console.log('📊 Business age:', businessAge, 'Completion rate:', (completionRate * 100).toFixed(1) + '%', 'Trend:', trendText);

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
          pointRadius: streakData.map((_, index) => index === businessStartIndex ? 4 : 1),
          pointHoverRadius: 6,
          pointBackgroundColor: streakData.map((_, index) => 
            index === businessStartIndex ? '#FFD700' : trendColor
          ),
          pointBorderColor: streakData.map((_, index) => 
            index === businessStartIndex ? '#FF8C00' : '#fff'
          ),
          pointBorderWidth: streakData.map((_, index) => 
            index === businessStartIndex ? 3 : 1
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
                  
                  if (point.completed) {
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

      console.log('✅ ENHANCED HABIT CHART CREATED SUCCESSFULLY!', this.chart);
      
    } catch (error) {
      console.error('❌ Error creating habit chart:', error);
    }
  }
}
