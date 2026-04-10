import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LucideStore } from '@lucide/angular';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, LucideStore],
  template: `
    <div class="shop-shell">

      <header class="shop-header">
        <div class="header-inner">
          <a routerLink="/shop/catalog" class="shop-logo">
            <svg lucideStore [size]="20"></svg>
            <span>Inventory Shop</span>
          </a>

          <nav class="header-nav">
            <a routerLink="/shop/catalog" class="nav-link">Каталог</a>
          </nav>

          <div class="header-actions">
            <a routerLink="/shop/cart" class="cart-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              @if (totalCount() > 0) {
                <span class="cart-badge">{{ totalCount() }}</span>
              }
            </a>
            <a routerLink="/login" class="btn btn-ghost btn-sm">Войти</a>
          </div>
        </div>
      </header>

      <main class="shop-main">
        <router-outlet />
      </main>

      <footer class="shop-footer">
        <p>© 2026 Inventory Shop</p>
      </footer>

    </div>
  `,
  styles: [`
    .shop-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .shop-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }

    .shop-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }

    .header-nav {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .nav-link {
      padding: 6px 14px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all .15s;

      &:hover {
        background: var(--bg);
        color: var(--text);
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--bg);
      color: var(--text);
      text-decoration: none;
      transition: all .15s;

      &:hover { background: var(--border); }
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--primary);
      color: #fff;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-sm { padding: 7px 14px; font-size: 13px; }

    .shop-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .shop-footer {
      background: var(--surface);
      border-top: 1px solid var(--border);
      padding: 20px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }
  `]
})
export class ShopLayoutComponent {
  constructor(private cartService: CartService) {}
  totalCount = computed(() => this.cartService.totalCount());
}