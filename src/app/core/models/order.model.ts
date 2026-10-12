import { Product } from './product.model';
import { Address } from './user.model';

/**
 * Status possíveis para um pedido de cupcake
 */
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Representa um item individual dentro do pedido mapeado da tabela `order_items`
 */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

/**
 * Representa o pedido completo mapeado da tabela `orders`
 */
export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  shipping_address_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  notes?: string | null;
  shipping_address?: Address;
  items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Representa o registro retornado pela view `vw_customer_order_history`,
 * otimizado para a página de listagem de pedidos do cliente.
 */
export interface CustomerOrderHistorySummary {
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
  order_date: string;
}
