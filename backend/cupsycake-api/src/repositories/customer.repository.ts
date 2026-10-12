import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { Address, Customer } from '../types';

interface CustomerRow extends RowDataPacket, Customer {}

export class CustomerRepository {
  async findByEmail(email: string): Promise<Customer | null> {
    const [rows] = await pool.query<CustomerRow[]>(
      'SELECT * FROM customers WHERE email = ?',
      [email],
    );
    return rows[0] || null;
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    const [rows] = await pool.query<CustomerRow[]>(
      'SELECT * FROM customers WHERE cpf = ?',
      [cpf],
    );
    return rows[0] || null;
  }

  // NOVO MÉTODO: Listar todos os usuários (sem expor o password_hash)
  async findAll(): Promise<Omit<Customer, 'password_hash'>[]> {
    const query = `
      SELECT 
        id, first_name, last_name, cpf, email, 
        area_code, phone_number, gender, birth_date, created_at, updated_at 
      FROM customers
      ORDER BY id DESC
    `;
    const [rows] = await pool.query<CustomerRow[]>(query);
    return rows;
  }

  async createCustomerWithAddress(
    customerData: Partial<Customer>,
    addressData?: Address,
  ): Promise<number> {
    // ... (código existente de criação)
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [customerResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO customers 
         (first_name, last_name, cpf, email, area_code, phone_number, gender, birth_date, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customerData.first_name,
          customerData.last_name,
          customerData.cpf,
          customerData.email,
          customerData.area_code,
          customerData.phone_number,
          customerData.gender,
          customerData.birth_date || null,
          customerData.password_hash,
        ],
      );
      const customerId = customerResult.insertId;
      if (addressData) {
        await connection.query(
          `INSERT INTO addresses 
           (customer_id, zip_code, street_address, number, complement, neighborhood, city, state_code, state_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            addressData.zip_code,
            addressData.street_address,
            addressData.number,
            addressData.complement || null,
            addressData.neighborhood,
            addressData.city,
            addressData.state_code,
            addressData.state_name,
          ],
        );
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
