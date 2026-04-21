import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuditService } from '../../core/services/audit.service';
import { AuditLog } from '../../shared/interfaces/audit.interface';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Журнал действий</h2>
      </div>

      <div class="filter-tabs">
        @for (tab of tabs; track tab.value) {
          <button
            class="tab"
            [class.active]="activeTab() === tab.value"
            (click)="setTab(tab.value)"
          >{{ tab.label }}</button>
        }
      </div>

      <div class="card" style="padding: 0; overflow: hidden">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              <th>Действие</th>
              <th>Объект</th>
              <th>Описание</th>
              <th>IP</th>
              <th>Пользователь</th>
            </tr>
          </thead>
          <tbody>
            @if (loading()) {
              @for (row of skeletonRows; track row) {
                <tr>
                  <td><app-skeleton height="14px" width="120px"></app-skeleton></td>
                  <td><app-skeleton height="22px" width="90px" borderRadius="999px"></app-skeleton></td>
                  <td><app-skeleton height="14px" width="70px"></app-skeleton></td>
                  <td><app-skeleton height="14px" width="200px"></app-skeleton></td>
                  <td><app-skeleton height="14px" width="90px"></app-skeleton></td>
                  <td><app-skeleton height="14px" width="70px"></app-skeleton></td>
                </tr>
              }
            } @else {
              @for (log of logs(); track log.id) {
                <tr>
                  <td class="time-cell">{{ formatDate(log.created_at) }}</td>
                  <td><span [class]="badgeClass(log.action)">{{ log.action }}</span></td>
                  <td>{{ log.entity }}</td>
                  <td class="desc-cell">{{ log.description }}</td>
                  <td><code class="ip">{{ log.ip_address }}</code></td>
                  <td>{{ log.user }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-row">Записи не найдены</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .page-header h2 { font-size: 22px; font-weight: 700; }

    .filter-tabs { display: flex; gap: 4px; margin-bottom: 16px; }

    .tab {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all .15s;
    }
    .tab:hover { background: var(--bg); }
    .tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

    .time-cell { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

    .action-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-green { background: #F0FDF4; color: #16A34A; }
    .badge-blue  { background: #EFF6FF; color: #2563EB; }
    .badge-red   { background: #FEF2F2; color: #DC2626; }
    .badge-gray  { background: var(--bg); color: var(--text-muted); }

    .desc-cell {
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ip {
      font-family: monospace;
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .empty-row {
      text-align: center;
      color: var(--text-muted);
      padding: 40px !important;
    }
  `]
})
export class AuditComponent implements OnInit, OnDestroy {
  logs      = signal<AuditLog[]>([]);
  loading   = signal(true);
  activeTab = signal('');
  skeletonRows = [1, 2, 3, 4, 5];

  tabs = [
    { label: 'Все',    value: '' },
    { label: 'Товары', value: 'product' },
    { label: 'Заказы', value: 'order' },
    { label: 'Вход',   value: 'login' },
  ];

  private refreshSub?: Subscription;

  constructor(private auditService: AuditService) {}

  ngOnInit() {
    this.fetchLogs();
    this.refreshSub = interval(30000).pipe(
      switchMap(() => this.auditService.getLogs(this.activeTab() || undefined))
    ).subscribe(data => this.logs.set(data));
  }

  ngOnDestroy() { this.refreshSub?.unsubscribe(); }

  setTab(value: string) {
    this.activeTab.set(value);
    this.fetchLogs();
  }

  fetchLogs() {
    this.loading.set(true);
    this.auditService.getLogs(this.activeTab() || undefined).subscribe({
      next: data => { this.logs.set(data); this.loading.set(false); },
      error: ()   => this.loading.set(false),
    });
  }

  badgeClass(action: string): string {
    if (action.endsWith('_created')) return 'action-badge badge-green';
    if (action.endsWith('_updated') || action.endsWith('_changed')) return 'action-badge badge-blue';
    if (action.endsWith('_deleted')) return 'action-badge badge-red';
    return 'action-badge badge-gray';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()} ${hh}:${mn}`;
  }
}
