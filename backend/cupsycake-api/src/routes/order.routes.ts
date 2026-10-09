import { Router } from 'express';
import { getUserOrders } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/my-orders', authenticateToken, getUserOrders);

export default router;
