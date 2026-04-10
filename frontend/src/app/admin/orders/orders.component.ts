import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/interfaces/order.interface';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">

      <div class="page-header">
        <div>
          <h2>Заказы</h2>
          <p class="subtitle">{{ filtered().length }} заказов</p>
        </div>
      </div>

      <!-- Фильтр по статусу -->
      <div class="status-tabs">
        @for (tab of tabs; track tab.value) {
          <button
            class="tab"
            [class.active]="statusFilter() === tab.value"
            (click)="statusFilter.set(tab.value)"
          >
            {{ tab.label }}
            <span class="tab-count">{{ countByStatus(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- Таблица -->
      <div class="card" style="padding: 0; overflow: hidden">
        <table>
          <thead>
            <tr>
              <th>№ Заказа</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            @for (order of filtered(); track order.id) {
              <tr class="order-row" [class.expanded]="expandedId() === order.id">
                <td><strong>#{{ order.id }}</strong></td>
                <td>{{ order.customer_name }}</td>
                <td>{{ order.customer_phone }}</td>
                <td><strong>{{ formatPrice(order.total) }}</strong></td>
                <td>
                  <span class="badge badge-{{ order.status }}">
                    {{ statusLabel(order.status) }}
                  </span>
                </td>
                <td>{{ formatDate(order.created_at) }}</td>
                <td>
                  <div class="actions">
                    <button class="btn btn-ghost btn-sm" (click)="toggleExpand(order.id)">
                      {{ expandedId() === order.id ? 'Скрыть' : 'Детали' }}
                    </button>
                    <select
                      class="status-select"
                      [ngModel]="order.status"
                      (ngModelChange)="updateStatus(order, $event)"
                    >
                      <option value="new">Новый</option>
                      <option value="confirmed">Подтверждён</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </div>
                </td>
              </tr>

              @if (expandedId() === order.id) {
                <tr class="details-row">
                  <td colspan="7">
                    <div class="order-items">
                      <p class="items-title">Состав заказа:</p>
                      <div class="items-list">
                        @for (item of order.items; track item.id) {
                          <div class="item-row">
                            <span class="item-name">{{ item.product_name }}</span>
                            <span class="item-qty">× {{ item.quantity }}</span>
                            <span class="item-price">{{ formatPrice(item.price_at_order) }}</span>
                          </div>
                        }
                      </div>
                      <div class="items-total">
                        Итого: <strong>{{ formatPrice(order.total) }}</strong>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr>
                <td colspan="7" class="empty-row">Заказов нет</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;

      h2 { font-size: 22px; font-weight: 700; }
      .subtitle { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
    }

    .status-tabs { display: flex; gap: 4px; margin-bottom: 16px; }

    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      transition: all .15s;

      &:hover { background: var(--bg); }

      &.active {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);

        .tab-count { background: rgba(255,255,255,.25); color: #fff; }
      }
    }

    .tab-count {
      background: var(--bg);
      padding: 1px 7px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
    }

    .actions { display: flex; gap: 8px; align-items: center; }
    .btn-sm  { padding: 6px 10px; font-size: 12px; }

    .status-select { width: auto; padding: 6px 10px; font-size: 12px; border-radius: 8px; }

    .empty-row {
      text-align: center;
      color: var(--text-muted);
      padding: 40px !important;
    }

    .details-row td { background: var(--bg); padding: 0 !important; }

    .order-items { padding: 16px 24px; }

    .items-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .items-list { display: flex; flex-direction: column; gap: 6px; }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: var(--surface);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .item-name  { flex: 1; font-weight: 500; font-size: 13px; }
    .item-qty   { color: var(--text-muted); font-size: 13px; }
    .item-price { font-weight: 600; font-size: 13px; min-width: 100px; text-align: right; }

    .items-total {
      margin-top: 10px;
      text-align: right;
      font-size: 14px;
      color: var(--text-muted);

      strong { color: var(--text); font-size: 16px; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders       = signal<Order[]>([]);
  statusFilter = signal('');
  expandedId   = signal<number | null>(null);

  tabs = [
    { label: 'Все',         value: '' },
    { label: 'Новые',       value: 'new' },
    { label: 'Подтверждён', value: 'confirmed' },
    { label: 'Доставлен',   value: 'delivered' },
    { label: 'Отменён',     value: 'cancelled' },
  ];

  filtered = computed(() => {
    const sf = this.statusFilter();
    return sf ? this.orders().filter(o => o.status === sf) : this.orders();
  });

  constructor(private orderService: OrderService) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: data => this.orders.set(data),
      error: err  => console.error(err)
    });
  }

  countByStatus(status: string): number {
    return status
      ? this.orders().filter(o => o.status === status).length
      : this.orders().length;
  }

  toggleExpand(id: number) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  updateStatus(order: Order, status: string) {
    this.orderService.updateStatus(order.id, status).subscribe({
      next: updated => this.orders.update(list => list.map(o => o.id === order.id ? updated : o)),
      error: err    => console.error(err)
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      new:       'Новый',
      confirmed: 'Подтверждён',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return map[status] || status;
  }

  formatPrice(price: string) {
    return Number(price).toLocaleString('ru-RU') + ' ₸';
  }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
