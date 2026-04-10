import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-shell">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-text">Inventory</span>
        </div>

        <nav class="sidebar-nav">
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Дашборд
          </a>

          <a
            routerLink="/admin/products"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            Товары
          </a>

          <a
            routerLink="/admin/orders"
            routerLinkActive="active"
            class="nav-item"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            Заказы
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ initial }}</div>
            <span class="user-name">{{ username }}</span>
          </div>
          <button class="logout-btn" (click)="logout()" title="Выйти">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="admin-main">
        <router-outlet />
      </main>

    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar-w);
      min-height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0;
      z-index: 100;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
      font-size: 18px;

      .logo-text {
        font-weight: 700;
        font-size: 16px;
        color: var(--text);
      }
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 12px 10px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all .15s;

      &:hover {
        background: var(--bg);
        color: var(--text);
      }

      &.active {
        background: var(--primary-light);
        color: var(--primary);

        svg { stroke: var(--primary); }
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: all .15s;

      &:hover {
        background: #FEF2F2;
        color: var(--danger);
      }
    }

    /* ── Main ── */
    .admin-main {
      margin-left: var(--sidebar-w);
      flex: 1;
      padding: 28px;
      min-height: 100vh;
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService) {}

  get username() { return this.auth.getUsername(); }
  get initial()  { return this.username.charAt(0).toUpperCase(); }

  logout() { this.auth.logout(); }
}