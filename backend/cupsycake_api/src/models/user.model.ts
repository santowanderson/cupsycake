import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface AddressData {
  zip_code: string;
  street_address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state_code: string;
  state_name: string;
}

export interface CustomerCreationInput {
  first_name: string;
  last_name: string;
  cpf: string;
  email: string;
  area_code?: string;
  phone_number?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';
  birth_date?: string;
  password: string;
  address?: AddressData;
}

export class UserModel {
  // Verifica se já existe e-mail ou CPF cadastrado
  static async findByEmailOrCpf(
    email: string,
    cpf: string,
  ): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM customers WHERE email = ? OR cpf = ?',
      [email, cpf],
    );
    return rows;
  }

  // Busca o usuário por e-mail (para fins de autenticação/login)
  static async findByEmail(email: string): Promise<RowDataPacket | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, email, password_hash, first_name FROM customers WHERE email = ?',
      [email],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Busca os detalhes completos do cliente utilizando a View do banco
  static async getProfileViewById(
    customerId: number,
  ): Promise<RowDataPacket | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM vw_customer_details WHERE customer_id = ?',
      [customerId],
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Cria um novo cliente e endereço utilizando transação segura
  static async create(data: CustomerCreationInput): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(data.password, saltRounds);

      // Inserção na tabela customers
      const [customerResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO customers (first_name, last_name, cpf, email, area_code, phone_number, gender, birth_date, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.first_name,
          data.last_name,
          data.cpf,
          data.email,
          data.area_code || '',
          data.phone_number || '',
          data.gender || 'NOT_SPECIFIED',
          data.birth_date || null,
          password_hash,
        ],
      );

      const customerId = customerResult.insertId;

      // Inserção opcional do endereço
      if (data.address) {
        const addr = data.address;
        if (
          addr.zip_code &&
          addr.street_address &&
          addr.number &&
          addr.neighborhood &&
          addr.city &&
          addr.state_code &&
          addr.state_name
        ) {
          await connection.query(
            `INSERT INTO addresses (customer_id, zip_code, street_address, number, complement, neighborhood, city, state_code, state_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              customerId,
              addr.zip_code,
              addr.street_address,
              addr.number,
              addr.complement || null,
              addr.neighborhood,
              addr.city,
              addr.state_code,
              addr.state_name,
            ],
          );
        }
      }

      await connection.commit();
      return customerId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
