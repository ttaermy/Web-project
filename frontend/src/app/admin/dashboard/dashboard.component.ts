import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../core/services/stats.service';
import { Stats } from '../../shared/interfaces/stats.interface';
import { Chart, registerables } from 'chart.js';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Дашборд</h2>
        <span class="date">{{ today }}</span>
      </div>

      <!-- Stat Cards -->
      @if (stats(); as stats) {
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div>
              <p class="stat-label">Выручка</p>
              <p class="stat-value">{{ formatMoney(stats.total_revenue) }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
              </svg>
            </div>
            <div>
              <p class="stat-label">Всего заказов</p>
              <p class="stat-value">{{ stats.total_orders }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orange">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div>
              <p class="stat-label">Новые заказы</p>
              <p class="stat-value">{{ stats.new_orders }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon red">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              </svg>
            </div>
            <div>
              <p class="stat-label">Мало на складе</p>
              <p class="stat-value">{{ stats.low_stock_count }}</p>
            </div>
          </div>
        </div>

        <!-- Sales Chart -->
        <div class="card chart-card" style="margin-top: 24px">
          <div class="card-header">
            <h3>Продажи за 30 дней</h3>
          </div>
          <div class="chart-wrap">
            <canvas #salesChart></canvas>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card" style="margin-top: 24px">
          <div class="card-header">
            <h3>Топ товаров по продажам</h3>
            <a routerLink="/admin/products" class="btn btn-ghost">Все товары</a>
          </div>

          @if (stats.top_products.length > 0) {
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Товар</th>
                  <th>Продано</th>
                  <th>Доля</th>
                </tr>
              </thead>
              <tbody>
                @for (p of stats.top_products; track p.id; let i = $index) {
                  <tr>
                    <td><span class="rank">{{ i + 1 }}</span></td>
                    <td>{{ p.name }}</td>
                    <td><strong>{{ p.sold }} шт.</strong></td>
                    <td>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          [style.width.%]="getPercent(p.sold)"
                        ></div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="empty">Продаж пока нет</p>
          }
        </div>
      } @else {
        <div class="stat-grid">
          @for (s of [1,2,3,4]; track s) {
            <div class="stat-card">
              <app-skeleton width="44px" height="44px" borderRadius="10px"></app-skeleton>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px">
                <app-skeleton width="80px" height="12px"></app-skeleton>
                <app-skeleton width="100px" height="28px"></app-skeleton>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;

      h2 { font-size: 22px; font-weight: 700; }
      .date { color: var(--text-muted); font-size: 13px; }
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.blue   { background: #EFF6FF; color: #2563EB; svg { stroke: #2563EB; } }
      &.green  { background: #F0FDF4; color: #16A34A; svg { stroke: #16A34A; } }
      &.orange { background: #FFFBEB; color: #D97706; svg { stroke: #D97706; } }
      &.red    { background: #FEF2F2; color: #DC2626; svg { stroke: #DC2626; } }
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--text);
    }

    .chart-card { padding: 24px; }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      h3 { font-size: 16px; font-weight: 600; }
    }

    .chart-wrap {
      position: relative;
      height: 260px;
    }

    .rank {
      width: 24px;
      height: 24px;
      background: var(--bg);
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .progress-bar {
      width: 120px;
      height: 6px;
      background: var(--bg);
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 999px;
      transition: width .3s;
    }

    .loading { color: var(--text-muted); padding: 40px; text-align: center; }
    .empty   { color: var(--text-muted); padding: 24px; text-align: center; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  stats = signal<Stats | null>(null);
  chartData: { date: string; revenue: number }[] = [];
  private chart: Chart | null = null;
  private chartReady = false;
  private dataReady  = false;

  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;

  get today() {
    return new Date().toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  constructor(private statsService: StatsService) {}

  ngOnInit() {
    this.statsService.getStats().subscribe({
      next: data => {
        this.stats.set(data);
        // Canvas is inside @if(stats()) — it enters the DOM here.
        // Defer one tick so Angular updates the ViewChild reference first.
        setTimeout(() => this.maybeDrawChart(), 0);
      },
      error: err => console.error(err)
    });
    this.statsService.getChartData().subscribe({
      next: data => {
        this.chartData = data;
        this.dataReady = true;
        setTimeout(() => this.maybeDrawChart(), 0);
      },
      error: err => console.error(err)
    });
  }

  ngAfterViewInit() {
    this.chartReady = true;
    this.maybeDrawChart();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private maybeDrawChart() {
    if (this.chart) return;                          // already drawn
    if (!this.chartReady || !this.dataReady) return;
    if (!this.salesChartRef) return;
    if (!this.chartData.length) return;

    const labels = this.chartData.map(d => {
      const date = new Date(d.date);
      return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const values = this.chartData.map(d => d.revenue);

    this.chart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Выручка',
          data: values,
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.08)',
          tension: 0.4,
          pointRadius: 3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  formatMoney(val: string) {
    return Number(val).toLocaleString('ru-RU') + ' ₸';
  }

  getPercent(sold: number): number {
    const max = Math.max(...(this.stats()?.top_products.map((p: { sold: number }) => p.sold) || [1]));
    return max > 0 ? (sold / max) * 100 : 0;
  }
}
