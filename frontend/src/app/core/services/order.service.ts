import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../shared/interfaces/order.interface';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getOrders()  { return this.http.get<Order[]>(`${this.API}/orders/`); }
  getOrder(id: number) { return this.http.get<Order>(`${this.API}/orders/${id}/`); }
  updateStatus(id: number, status: string) {
    return this.http.patch<Order>(`${this.API}/orders/${id}/`, { status });
  }
  createOrder(data: any) { return this.http.post<Order>(`${this.API}/orders/`, data); }
  trackOrder(code: string) { return this.http.get<Order>(`${this.API}/orders/track/${code}/`); }
}