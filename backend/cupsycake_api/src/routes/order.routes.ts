import { Router } from 'express';

import {
  createOrder,
  getCustomerOrders,
} from '../controllers/order.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de pedidos exigem autenticação prévia
router.use(isAuthenticated);

router.post('/', createOrder);
router.get('/', getCustomerOrders);

export default router;
