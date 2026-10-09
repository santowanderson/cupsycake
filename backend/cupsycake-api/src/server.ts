import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { dbPool } from './config/database';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const [result] = await dbPool.query('SELECT 1 + 1 AS result');
    return res.json({ status: 'OK', database: 'Connected', result });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Failed to connect to MySQL',
      error: (error as Error).message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Cupcake API running on port ${PORT}`);
});
