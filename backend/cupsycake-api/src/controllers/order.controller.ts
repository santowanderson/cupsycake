import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { dbPool } from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getUserOrders = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.userId;

  try {
    const [orders] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        id, 
        status, 
        total_amount AS totalAmount, 
        created_at AS createdAt 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
    );

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map((o) => o.id);

    const [items] = await dbPool.query<RowDataPacket[]>(
      `SELECT 
        oi.order_id AS orderId,
        oi.product_id AS productId,
        p.name AS productName,
        p.image_url AS productImage,
        oi.quantity,
        oi.unit_price AS unitPrice
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id IN (?)`,
      [orderIds],
    );

    const fullOrders = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: items
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          productId: item.productId,
          name: item.productName,
          imageUrl: item.productImage,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
        })),
    }));

    return res.json(fullOrders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res
      .status(500)
      .json({ message: 'Failed to retrieve order history.' });
  }
};
