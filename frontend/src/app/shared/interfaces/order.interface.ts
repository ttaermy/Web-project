
export interface OrderItem {
  id?: number;
  product: number;
  product_name?: string;
  quantity: number;
  price_at_order: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  status: 'new' | 'confirmed' | 'delivered' | 'cancelled';
  total: string;
  created_at: string;
  items: OrderItem[];
}