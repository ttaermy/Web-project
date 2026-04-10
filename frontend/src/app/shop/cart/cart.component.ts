import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { LucideArrowLeft, LucideCircleCheck, LucideShoppingCart } from '@lucide/angular';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideArrowLeft, LucideCircleCheck, LucideShoppingCart],
  template: `
    <div class="cart-page">
      <div class="cart-header">
        <h2>Корзина</h2>
        <a routerLink="/shop/catalog" class="btn btn-ghost btn-sm">
          <svg lucideArrowLeft [size]="16"></svg> Продолжить покупки
        </a>
      </div>

      @if (items().length > 0) {
        <div class="cart-layout">

          <!-- Items -->
          <div class="cart-items">
            @for (item of items(); track item.product.id) {
              <div class="cart-item card">
                <div class="item-img">
                  {{ item.product.name.charAt(0) }}
                </div>
                <div class="item-info">
                  <p class="item-category">{{ item.product.category_name }}</p>
                  <h4 class="item-name">{{ item.product.name }}</h4>
                  <p class="item-price-unit">{{ formatPrice(item.product.price) }} за шт.</p>
                </div>
                <div class="item-controls">
                  <div class="qty-control">
                    <button (click)="decrement(item.product.id, item.quantity)">−</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="increment(item.product.id, item.quantity, item.product.stock)">+</button>
                  </div>
                  <p class="item-total">{{ formatPriceNum(+item.product.price * item.quantity) }}</p>
                  <button class="remove-btn" (click)="remove(item.product.id)">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Checkout -->
          <div class="checkout-block">
            <div class="card">
              <h3>Оформление заказа</h3>

              <div class="order-summary">
                <div class="summary-row">
                  <span>Товаров</span>
                  <span>{{ totalCount() }} шт.</span>
                </div>
                <div class="summary-row total">
                  <span>Итого</span>
                  <strong>{{ formatPriceNum(totalPrice()) }}</strong>
                </div>
              </div>

              <div class="checkout-form">
                <div class="form-group">
                  <label>Ваше имя *</label>
                  <input
                    type="text"
                    placeholder="Имя Фамилия"
                    [(ngModel)]="customerName"
                    name="name"
                  />
                </div>
                <div class="form-group">
                  <label>Телефон *</label>
                  <input
                    type="tel"
                    placeholder="+7 700 000 00 00"
                    [(ngModel)]="customerPhone"
                    name="phone"
                  />
                </div>
              </div>

              @if (orderError) {
                <div class="error-msg">{{ orderError }}</div>
              }

              @if (orderSuccess) {
                <div class="success-msg">
                  <svg lucideCircleCheck [size]="16"></svg> Заказ #{{ orderId }} оформлен! Мы свяжемся с вами.
                </div>
              }

              @if (!orderSuccess) {
                <button
                  class="btn btn-primary checkout-btn"
                  (click)="placeOrder()"
                  [disabled]="ordering"
                >
                  {{ ordering ? 'Оформляем...' : 'Оформить заказ' }}
                </button>
              }
            </div>
          </div>

        </div>
      } @else {
        <div class="empty-cart">
          <svg lucideShoppingCart [size]="48" style="opacity:.3"></svg>
          <p>Корзина пуста</p>
          <a routerLink="/shop/catalog" class="btn btn-primary">Перейти в каталог</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page { display: flex; flex-direction: column; gap: 20px; }

    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      h2 { font-size: 22px; font-weight: 700; }
    }

    .btn-sm { padding: 7px 14px; font-size: 13px; }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 20px;
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .item-img {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
      opacity: .4;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-category {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .item-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .item-price-unit {
      font-size: 12px;
      color: var(--text-muted);
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .qty-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;

      button {
        width: 32px;
        height: 32px;
        border: none;
        background: var(--bg);
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        color: var(--text);
        transition: background .15s;

        &:hover { background: var(--border); }
      }

      span {
        width: 36px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
      }
    }

    .item-total {
      font-size: 15px;
      font-weight: 700;
      min-width: 90px;
      text-align: right;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: all .15s;

      &:hover { background: #FEF2F2; color: var(--danger); }
    }

    /* Checkout */
    .checkout-block { position: sticky; top: 80px; }

    .checkout-block .card {
      display: flex;
      flex-direction: column;
      gap: 16px;

      h3 { font-size: 16px; font-weight: 600; }
    }

    .order-summary {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: var(--bg);
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--text-muted);

      &.total {
        padding-top: 8px;
        border-top: 1px solid var(--border);
        font-size: 15px;
        color: var(--text);

        strong { font-size: 18px; }
      }
    }

    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .checkout-btn {
      width: 100%;
      justify-content: center;
      padding: 12px;
      font-size: 15px;
    }

    .error-msg {
      background: #FEF2F2;
      color: var(--danger);
      border: 1px solid #FECACA;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
    }

    .success-msg {
      background: #F0FDF4;
      color: var(--success);
      border: 1px solid #BBF7D0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13px;
      font-weight: 500;
    }

    /* Empty */
    .empty-cart {
      text-align: center;
      padding: 80px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      span { font-size: 64px; }
      p    { font-size: 18px; color: var(--text-muted); }
    }
  `]
})
export class CartComponent {
  customerName  = '';
  customerPhone = '';
  ordering      = false;
  orderError    = '';
  orderSuccess  = false;
  orderId:      number | null = null;

  constructor(
    private cartService:  CartService,
    private orderService: OrderService,
  ) {}

  items      = computed(() => this.cartService.cartItems());
  totalCount = computed(() => this.cartService.totalCount());
  totalPrice = computed(() => this.cartService.totalPrice());

  increment(id: number, qty: number, stock: number) {
    if (qty < stock) this.cartService.updateQuantity(id, qty + 1);
  }

  decrement(id: number, qty: number) {
    this.cartService.updateQuantity(id, qty - 1);
  }

  remove(id: number) { this.cartService.remove(id); }

  placeOrder() {
    if (!this.customerName.trim() || !this.customerPhone.trim()) {
      this.orderError = 'Заполните имя и телефон';
      return;
    }

    this.ordering   = true;
    this.orderError = '';

    const payload = {
      customer_name:  this.customerName.trim(),
      customer_phone: this.customerPhone.trim(),
      items: this.items().map(i => ({
        product:        i.product.id,
        quantity:       i.quantity,
        price_at_order: i.product.price,
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: order => {
        this.orderSuccess = true;
        this.orderId      = order.id;
        this.cartService.clear();
        this.ordering     = false;
      },
      error: () => {
        this.orderError = 'Ошибка при оформлении заказа';
        this.ordering   = false;
      }
    });
  }

  formatPrice(price: string)    { return Number(price).toLocaleString('ru-RU') + ' ₸'; }
  formatPriceNum(price: number) { return price.toLocaleString('ru-RU') + ' ₸'; }
}