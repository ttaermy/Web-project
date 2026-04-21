import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../shared/interfaces/order.interface';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="track-page">
      <div class="track-header">
        <a routerLink="/shop/catalog" class="back-link">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Вернуться в каталог
        </a>
        <h2>Отслеживание заказа</h2>
        <p class="subtitle">Введите код отслеживания, чтобы узнать статус заказа</p>
      </div>

      <div class="search-card card">
        <div class="search-row">
          <input
            type="text"
            placeholder="Введите код отслеживания (например: XXXX-XXXX)"
            [(ngModel)]="code"
            name="code"
            (keydown.enter)="trackOrder()"
            style="flex:1"
          />
          <button class="btn btn-primary" (click)="trackOrder()" [disabled]="loading() || !code.trim()">
            {{ loading() ? 'Поиск...' : 'Найти заказ' }}
          </button>
        </div>
        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }
      </div>

      @if (order(); as o) {
        <div class="order-card card">
          <div class="order-top">
            <div>
              <h3>Заказ #{{ o.id }}</h3>
              <p class="order-date">{{ formatDate(o.created_at) }}</p>
            </div>
            <span class="badge badge-{{ o.status }}">{{ statusLabel(o.status) }}</span>
          </div>

          <div class="order-items">
            <p class="section-title">Состав заказа</p>
            @for (item of o.items; track item.id) {
              <div class="item-row">
                <span class="item-name">{{ item.product_name }}</span>
                <span class="item-qty">× {{ item.quantity }}</span>
                <span class="item-price">{{ formatPrice(item.price_at_order) }}</span>
              </div>
            }
          </div>

          <div class="order-total">
            <span>Итого:</span>
            <strong>{{ formatPrice(o.total) }}</strong>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .track-page {
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .track-header {
      display: flex;
      flex-direction: column;
      gap: 8px;

      h2 { font-size: 24px; font-weight: 700; }
      .subtitle { color: var(--text-muted); font-size: 14px; }
    }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-muted); text-decoration: none; font-size: 13px;
      transition: color .15s;
      &:hover { color: var(--primary); }
    }

    .search-card {
      display: flex; flex-direction: column; gap: 12px;
    }

    .search-row { display: flex; gap: 10px; align-items: center; }

    .error-msg {
      background: #FEF2F2; color: var(--danger);
      border: 1px solid #FECACA; border-radius: 8px;
      padding: 10px 14px; font-size: 13px;
    }

    .order-card {
      display: flex; flex-direction: column; gap: 20px;
    }

    .order-top {
      display: flex; align-items: flex-start; justify-content: space-between;

      h3 { font-size: 18px; font-weight: 700; }
      .order-date { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    }

    .section-title {
      font-size: 13px; font-weight: 600; color: var(--text-muted);
      margin-bottom: 10px;
    }

    .order-items { display: flex; flex-direction: column; gap: 8px; }

    .item-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; background: var(--bg);
      border-radius: 8px;
    }

    .item-name  { flex: 1; font-weight: 500; font-size: 14px; }
    .item-qty   { color: var(--text-muted); font-size: 13px; }
    .item-price { font-weight: 600; font-size: 14px; min-width: 90px; text-align: right; }

    .order-total {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 16px; border-top: 1px solid var(--border);
      font-size: 15px; color: var(--text-muted);

      strong { font-size: 20px; font-weight: 800; color: var(--text); }
    }
  `]
})
export class TrackComponent implements OnInit {
  code    = '';
  loading = signal(false);
  error   = signal('');
  order   = signal<Order | null>(null);

  constructor(
    private route:        ActivatedRoute,
    private orderService: OrderService,
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.code = code;
      this.trackOrder();
    }
  }

  trackOrder() {
    if (!this.code.trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.order.set(null);

    this.orderService.trackOrder(this.code.trim()).subscribe({
      next: o  => { this.order.set(o); this.loading.set(false); },
      error: () => { this.error.set('Заказ не найден. Проверьте код и попробуйте ещё раз.'); this.loading.set(false); }
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      new: 'Новый', confirmed: 'Подтверждён',
      delivered: 'Доставлен', cancelled: 'Отменён',
    };
    return map[status] || status;
  }

  formatPrice(price: string) { return Number(price).toLocaleString('ru-RU') + ' ₸'; }

  formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
