import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import router from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de Sessão segura
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'chave_secreta_padrao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true se estiver em produção com HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 dia de validade
    },
  }),
);

// Registro das rotas
app.use('/api/auth', router);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Cupsycake Auth operando perfeitamente!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
