import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../../shared/interfaces/product.interface';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);

  cartItems  = computed(() => this.items());
  totalCount = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  totalPrice = computed(() => this.items().reduce((s, i) => s + i.quantity * +i.product.price, 0));

  add(product: Product) {
    this.items.update(items => {
      const existing = items.find(i => i.product.id === product.id);
      if (existing) {
        return items.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  remove(productId: number) {
    this.items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.remove(productId); return; }
    this.items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clear() { this.items.set([]); }
}