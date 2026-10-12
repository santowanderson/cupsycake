import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

// Carrega o .env localizado exatamente na raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// LOG DE DIAGNÓSTICO (Remova em produção)
console.log('🔍 [Database Config] Credenciais detectadas:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log(
  'Password enviada?:',
  process.env.DB_PASSWORD ? 'SIM (****)' : 'NÃO (Vazia/Undefined)',
);
console.log('Database:', process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root', // fallback ajustado para 'root'
  database: process.env.DB_NAME || 'cupsycake_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
