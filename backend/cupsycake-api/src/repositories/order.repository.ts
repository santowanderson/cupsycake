import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { CustomerOrderHistoryView, OrderStatus } from '../types';

// Interface estendendo RowDataPacket para tipar as colunas vindas do MySQL
interface OrderHistoryRow extends RowDataPacket {
  order_id: number;
  order_number: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  shipping_fee: string | number;
  total_amount: string | number;
  total_items_count: number;
  total_cupcakes_qty: number;
  order_date: Date;
}

export class OrderRepository {
  async findByCustomerId(
    customerId: number,
  ): Promise<CustomerOrderHistoryView[]> {
    const query = `
      SELECT 
        order_id, order_number, customer_id, customer_name, customer_email,
        status, shipping_fee, total_amount, total_items_count, total_cupcakes_qty, order_date
      FROM vw_customer_order_history
      WHERE customer_id = ?
      ORDER BY order_date DESC
    `;

    // Passamos a nossa interface como genérico do query
    const [rows] = await pool.query<OrderHistoryRow[]>(query, [customerId]);

    return rows.map((row) => ({
      order_id: row.order_id,
      order_number: row.order_number,
      customer_id: row.customer_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      status: row.status,
      shipping_fee: parseFloat(String(row.shipping_fee)),
      total_amount: parseFloat(String(row.total_amount)),
      total_items_count: Number(row.total_items_count),
      total_cupcakes_qty: Number(row.total_cupcakes_qty),
      order_date: row.order_date,
    }));
  }
}
