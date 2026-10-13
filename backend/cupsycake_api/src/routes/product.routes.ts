import { Router } from 'express';
import { getProducts } from '../controllers/product.controller';

const router = Router();

// Rota pública para listar produtos
router.get('/', getProducts);

export default router;
