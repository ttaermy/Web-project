import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { LucideStore } from '@lucide/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, LucideStore],
  template: `
    <div class="login-page">
      <div class="login-card">

        <div class="login-logo">
          <svg lucideStore class="logo-icon" [size]="40"></svg>
          <h1>Inventory Shop</h1>
          <p>Панель управления</p>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Логин</label>
            <input
              type="text"
              placeholder="Введите логин"
              [(ngModel)]="username"
              name="username"
              required
            />
          </div>

          <div class="form-group">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Введите пароль"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>

          @if (error) {
            <div class="error-msg">{{ error }}</div>
          }

          <button
            type="submit"
            class="btn btn-primary submit-btn"
            [disabled]="loading"
          >
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-card {
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .login-logo {
      text-align: center;
      margin-bottom: 32px;

      .logo-icon {
        display: block;
        margin: 0 auto 12px;
        color: var(--primary);
      }

      h1 {
        font-size: 22px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 4px;
      }

      p {
        color: var(--text-muted);
        font-size: 14px;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .error-msg {
      background: #FEF2F2;
      color: var(--danger);
      border: 1px solid #FECACA;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
    }

    .submit-btn {
      width: 100%;
      justify-content: center;
      padding: 11px;
      font-size: 15px;
      margin-top: 4px;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Заполните все поля';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/admin/dashboard']),
      error: () => {
        this.error   = 'Неверный логин или пароль';
        this.loading = false;
      }
    });
  }
}