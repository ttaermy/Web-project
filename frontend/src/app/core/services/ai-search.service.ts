import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../shared/interfaces/product.interface';

export interface AiSearchResult {
  message: string;
  products: Product[];
}

@Injectable({ providedIn: 'root' })
export class AiSearchService {
  private readonly API = 'http://127.0.0.1:8000/api';
  constructor(private http: HttpClient) {}
  search(query: string) {
    return this.http.post<AiSearchResult>(`${this.API}/ai-search/`, { query });
  }
  searchByImage(base64: string) {
    return this.http.post<AiSearchResult>(`${this.API}/ai-search-by-image/`, { image_base64: base64 });
  }
}