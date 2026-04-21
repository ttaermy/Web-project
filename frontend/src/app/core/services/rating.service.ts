import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../shared/interfaces/product.interface';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  rateProduct(productId: number, score: number) {
    return this.http.post<Product>(`${this.API}/products/${productId}/rate/`, { score });
  }
}
