// export interface OrderItem {
//   product_id: number;
//   product_name?: string;
//   quantity: number;
//   unit_price: number;
//   subtotal: number;
// }

// export interface Order {
//   order_id: number;
//   order_number: string;
//   total_amount: number;
//   shipping_fee: number;
//   status:
//     | 'PENDING'
//     | 'PAID'
//     | 'PREPARING'
//     | 'SHIPPED'
//     | 'DELIVERED'
//     | 'CANCELLED';
//   items: OrderItem[];
//   created_at: string;
// }

export interface OrderItem {
  id: number;
  slug: string;
  product_id: number;
  product_name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: number;
  created_at: string;
  shipping_fee: number;
  total_amount: number;
  status: string;
  notes?: string | null;
  items: OrderItem[];
}
