
export interface TopProduct {
  id: number;
  name: string;
  sold: number;
}

export interface Stats {
  total_revenue: string;
  total_orders: number;
  new_orders: number;
  low_stock_count: number;
  top_products: TopProduct[];
}