import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { Product } from '../types';

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  price: string | number;
  image_url: string | null;
  stock_quantity: number;
  is_active: number | boolean;
  tag_ids: string | null;
  tag_names: string | null;
  tag_slugs: string | null;
}

export class ProductRepository {
  async findAllActive(): Promise<Product[]> {
    const query = `
      SELECT 
        p.id, p.name, p.slug, p.description, p.ingredients, 
        p.price, p.image_url, p.stock_quantity, p.is_active,
        GROUP_CONCAT(t.id) AS tag_ids,
        GROUP_CONCAT(t.name) AS tag_names,
        GROUP_CONCAT(t.slug) AS tag_slugs
      FROM products p
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = TRUE
      GROUP BY p.id
      ORDER BY p.name ASC
    `;

    const [rows] = await pool.query<ProductRow[]>(query);

    return rows.map((row) => {
      let tags: Array<{ id: number; name: string; slug: string }> = [];

      if (row.tag_ids && row.tag_names && row.tag_slugs) {
        const ids = row.tag_ids.split(',');
        const names = row.tag_names.split(',');
        const slugs = row.tag_slugs.split(',');

        tags = ids.map((id, index) => ({
          id: Number(id),
          name: names[index],
          slug: slugs[index],
        }));
      }

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        ingredients: row.ingredients,
        price: parseFloat(String(row.price)),
        image_url: row.image_url,
        stock_quantity: row.stock_quantity,
        is_active: Boolean(row.is_active),
        tags,
      };
    });
  }
}
