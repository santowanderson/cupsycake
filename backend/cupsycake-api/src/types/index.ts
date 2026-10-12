export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  cpf: string;
  email: string;
  area_code: string;
  phone_number: string;
  gender: Gender;
  birth_date?: string | null;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Address {
  id?: number;
  customer_id?: number;
  zip_code: string;
  street_address: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state_code: string;
  state_name: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  tags?: Tag[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerOrderHistoryView {
  order_id: number;
  order_number: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  shipping_fee: number;
  total_amount: number;
  total_items_count: number;
  total_cupcakes_qty: number;
  order_date: Date;
}

export interface CustomJwtPayload {
  sub: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
