import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product, Category, ProductForm } from '../../shared/interfaces/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getProducts(params?: { category?: number; min_price?: number; max_price?: number; in_stock?: boolean; ordering?: string; search?: string }) {
    let httpParams = new HttpParams();
    if (params) {
      if (params.category  != null) httpParams = httpParams.set('category',  String(params.category));
      if (params.min_price != null) httpParams = httpParams.set('min_price', String(params.min_price));
      if (params.max_price != null) httpParams = httpParams.set('max_price', String(params.max_price));
      if (params.in_stock  != null) httpParams = httpParams.set('in_stock',  String(params.in_stock));
      if (params.ordering)          httpParams = httpParams.set('ordering',  params.ordering);
      if (params.search)            httpParams = httpParams.set('search',    params.search);
    }
    return this.http.get<Product[]>(`${this.API}/products/`, { params: httpParams });
  }

  getProduct(id: number) { return this.http.get<Product>(`${this.API}/products/${id}/`); }
  getCategories()        { return this.http.get<Category[]>(`${this.API}/categories/`); }
  createCategory(name: string) { return this.http.post<Category>(`${this.API}/categories/`, { name }); }

  getRecommendations(productId: number) {
    return this.http.get<{ recommendations: Product[] }>(`${this.API}/products/${productId}/recommendations/`);
  }

  deleteProduct(id: number) { return this.http.delete(`${this.API}/products/${id}/`); }

  createProduct(data: ProductForm) {
    return this.http.post<Product>(`${this.API}/products/`, this.toFormData(data));
  }

  updateProduct(id: number, data: Partial<ProductForm>) {
    return this.http.patch<Product>(`${this.API}/products/${id}/`, this.toFormData(data));
  }

  private toFormData(data: Partial<ProductForm>): FormData {
    const fd = new FormData();
    if (data.name        != null) fd.append('name',        data.name);
    if (data.description != null) fd.append('description', data.description);
    if (data.price       != null) fd.append('price',       String(data.price));
    if (data.stock       != null) fd.append('stock',       String(data.stock));
    if (data.category    != null) fd.append('category',    String(data.category));
    if (data.image)                fd.append('image',       data.image);
    return fd;
  }
}
