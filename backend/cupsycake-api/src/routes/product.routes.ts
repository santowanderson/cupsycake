import { Router } from 'express';
import { getProducts, updateProduct } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.put('/:id', updateProduct);

export default router;
