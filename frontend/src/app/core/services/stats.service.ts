import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stats } from '../../shared/interfaces/stats.interface';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly API = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}
  getStats() { return this.http.get<Stats>(`${this.API}/stats/`); }
}