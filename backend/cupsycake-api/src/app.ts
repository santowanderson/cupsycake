import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }),
);

app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

export default app;
