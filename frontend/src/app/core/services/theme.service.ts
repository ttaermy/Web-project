import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'light' | 'dark'>('light');
  isDark = computed(() => this.theme() === 'dark');

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      this.theme.set(saved);
      this.applyTheme(saved);
    }
  }

  toggleTheme() {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    localStorage.setItem('theme', next);
    this.applyTheme(next);
  }

  private applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
