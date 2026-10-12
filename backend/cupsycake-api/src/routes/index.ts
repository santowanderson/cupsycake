import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';
import productRoutes from './product.routes';

const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/products', productRoutes);
routes.use('/orders', orderRoutes);
routes.use('/customers', customerRoutes);

export default routes;
