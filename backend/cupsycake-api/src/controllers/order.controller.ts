import { NextFunction, Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  private orderService = new OrderService();

  getUserOrders = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customerId = req.user!.sub;
      const orders = await this.orderService.getUserOrders(customerId);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  };
}
