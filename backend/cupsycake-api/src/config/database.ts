import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

export const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'ecommerce_app',
  password: process.env.DB_PASSWORD || 'app_password_segura_123',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
