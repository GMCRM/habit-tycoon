import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-stock-chart-simple',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" style="position: relative; width: 100%; height: 250px; border: 2px solid #ffaa00; background: rgba(255,170,0,0.1); border-radius: 8px; padding: 10px;">
      <h3 style="color: #ffaa00; text-align: center; margin: 10px 0;">Habit Performance Chart</h3>
      <canvas 
        #chartCanvas 
        style="display: block; width: 100%; height: 180px; background-color: rgba(50,50,50,0.9); border-radius: 4px;">
      </canvas>
      <div style="color: #ffaa00; text-align: center; padding: 10px; font-size: 12px;">
        Business ID: {{ businessId || 'Not set' }} | Streak: {{ currentStreak || 0 }}
      </div>
    </div>
  `
})
export class StockChartSimpleComponent implements OnInit, AfterViewInit {
  @Input() businessId?: string;
  @Input() currentStreak?: number;
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngOnInit() {
    console.log('=== StockChartSimpleComponent - ngOnInit ===');
    console.log('Business ID:', this.businessId);
    console.log('Current Streak:', this.currentStreak);
  }

  ngAfterViewInit() {
    console.log('=== StockChartSimpleComponent - ngAfterViewInit ===');
    console.log('Canvas element:', this.chartCanvas?.nativeElement);
    
    setTimeout(() => {
      this.createTestChart();
    }, 500);
  }

  createTestChart() {
    console.log('=== Creating Test Chart ===');
    
    if (!this.chartCanvas?.nativeElement) {
      console.error('Canvas not found!');
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    console.log('Canvas:', canvas);
    console.log('Canvas 2D context:', canvas.getContext('2d'));

    try {
      // Simple test data
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = [65, 45, 80, 30, 90, 55, 75];

      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Habit Completion %',
            data: data,
            borderColor: '#ffaa00',
            backgroundColor: 'rgba(255, 170, 0, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ffaa00',
            pointBorderColor: '#ffaa00',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Weekly Performance',
              color: '#ffaa00',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              labels: {
                color: '#ffaa00'
              }
            }
          },
          scales: {
            x: {
              ticks: { 
                color: '#ffaa00' 
              },
              grid: { 
                color: 'rgba(255, 170, 0, 0.2)' 
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { 
                color: '#ffaa00',
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: { 
                color: 'rgba(255, 170, 0, 0.2)' 
              }
            }
          }
        }
      });

      console.log('✅ TEST CHART CREATED SUCCESSFULLY:', this.chart);
      
    } catch (error) {
      console.error('❌ Error creating test chart:', error);
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
