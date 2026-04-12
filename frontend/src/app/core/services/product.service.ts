import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, Category, ProductForm } from '../../shared/interfaces/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getProducts()          { return this.http.get<Product[]>(`${this.API}/products/`); }
  getProduct(id: number) { return this.http.get<Product>(`${this.API}/products/${id}/`); }
  getCategories()        { return this.http.get<Category[]>(`${this.API}/categories/`); }
  createCategory(name: string) { return this.http.post<Category>(`${this.API}/categories/`, { name }); }

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