import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http
      .post<{ token: string; username: string }>(`${this.API}/auth/login/`, {
        username,
        password,
      })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
        })
      );
  }

  logout() {
    this.http.post(`${this.API}/auth/logout/`, {}).subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }
}