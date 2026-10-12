import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new OrderController();

router.get('/', authMiddleware, controller.getUserOrders);

export default router;
