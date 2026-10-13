import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface CreateOrderData {
  customer_id: number;
  shipping_address_id: number;
  shipping_fee?: number;
  notes?: string;
  items: OrderItemInput[];
}

export class OrderModel {
  static async create(data: CreateOrderData): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let totalAmount = 0;
      const validatedItems: {
        product_id: number;
        quantity: number;
        unit_price: number;
      }[] = [];

      // Validação de estoque e cálculo de preços com bloqueio (FOR UPDATE)
      for (const item of data.items) {
        const [productRows] = await connection.query<RowDataPacket[]>(
          'SELECT price, stock_quantity FROM products WHERE id = ? FOR UPDATE',
          [item.product_id],
        );

        if (productRows.length === 0) {
          throw new Error(`Produto com ID ${item.product_id} não encontrado.`);
        }

        const product = productRows[0];
        if (product.stock_quantity < item.quantity) {
          throw new Error(
            `Estoque insuficiente para o produto ID ${item.product_id}. Disponível: ${product.stock_quantity}`,
          );
        }

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;

        validatedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: unitPrice,
        });

        // Baixa no estoque
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id],
        );
      }

      // Geração automática do número do pedido (order_number)
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
      const shippingFee = data.shipping_fee || 0.0;

      // Inserção na tabela orders com todos os campos obrigatórios do seu schema
      const [orderResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO orders (order_number, customer_id, shipping_address_id, status, total_amount, shipping_fee, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          data.customer_id,
          data.shipping_address_id,
          'PENDING',
          totalAmount,
          shippingFee,
          data.notes || null,
        ],
      );

      const orderId = orderResult.insertId;

      // Inserção dos itens na tabela order_items
      for (const item of validatedItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.unit_price],
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Lista os pedidos do usuário utilizando o seu schema e o campo gerado subtotal
  static async findByCustomerId(customerId: number): Promise<any[]> {
    const [orders] = await pool.query<RowDataPacket[]>(
      `SELECT o.id AS order_id, o.order_number, o.total_amount, o.shipping_fee, o.status, o.created_at,
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'subtotal', oi.subtotal
                )
              ) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [customerId],
    );
    return orders;
  }
}
