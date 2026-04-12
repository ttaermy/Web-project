
export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id:            number;
  name:          string;
  description:   string;
  price:         string;
  stock:         number;
  category:      number;
  category_name: string;
  image:         string | null;     
  image_url:     string | null;  
  created_at:    string;
}

export interface ProductForm {
  name:        string;
  description: string;
  price:       number | null;
  stock:       number | null;
  category:    number | null;
  image?:      File | null;    
}