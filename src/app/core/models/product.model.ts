export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  ingredients?: string | null;
  price: number;
  image_url?: string | null;
  stock_quantity: number;
  is_active: boolean;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilter {
  search?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}
