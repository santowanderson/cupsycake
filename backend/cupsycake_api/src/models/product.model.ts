import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url: string;
  tags: Tag[]; // Array de tags associadas ao produto
  created_at: Date;
  updated_at: Date;
}

export class ProductModel {
  // Lista todos os produtos incluindo suas respectivas tags do banco de dados
  static async findAll(): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.*,
        COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', t.id,
                'name', t.name,
                'slug', t.slug
              )
            )
            FROM product_tags pt
            JOIN tags t ON pt.tag_id = t.id
            WHERE pt.product_id = p.id
          ),
          JSON_ARRAY()
        ) AS tags
      FROM products p
    `);
    return rows as Product[];
  }

  // Busca um produto específico por ID com suas tags
  static async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        p.*,
        COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', t.id,
                'name', t.name,
                'slug', t.slug
              )
            )
            FROM product_tags pt
            JOIN tags t ON pt.tag_id = t.id
            WHERE pt.product_id = p.id
          ),
          JSON_ARRAY()
        ) AS tags
      FROM products p
      WHERE p.id = ?
    `,
      [id],
    );

    return rows.length > 0 ? (rows[0] as Product) : null;
  }
}
