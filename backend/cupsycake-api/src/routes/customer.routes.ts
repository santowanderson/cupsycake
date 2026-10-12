import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CustomerController();

// Rota protegida por JWT para listar todos os usuários
router.get('/', authMiddleware, controller.getAllCustomers);

export default router;
