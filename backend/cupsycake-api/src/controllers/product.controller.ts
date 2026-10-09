// src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { dbPool } from '../config/database';

// 1. Listar produtos
export const getProducts = async (req: Request, res: Response) => {
  const { tag } = req.query;

  try {
    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.ingredients, 
        p.price, 
        p.image_url AS imageUrl,
        p.is_active AS isActive,
        GROUP_CONCAT(t.name) AS tags
      FROM products p
      LEFT JOIN product_tags pt ON p.id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = TRUE
    `;

    const params: any[] = [];

    if (tag) {
      query += ` AND p.id IN (
        SELECT pt2.product_id 
        FROM product_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE t2.name = ?
      )`;
      params.push(tag);
    }

    query += ` GROUP BY p.id ORDER BY p.name ASC`;

    const [products] = await dbPool.query<RowDataPacket[]>(query, params);

    const formattedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      tags: product.tags ? product.tags.split(',') : [],
    }));

    return res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// 2. Atualizar produto (PUT)
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, ingredients, price, imageUrl, isActive } =
    req.body;

  if (!name || !price) {
    return res
      .status(400)
      .json({ message: 'Name and price are required fields.' });
  }

  try {
    const [result] = await dbPool.query<ResultSetHeader>(
      `UPDATE products 
       SET name = ?, description = ?, ingredients = ?, price = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        ingredients || null,
        price,
        imageUrl || null,
        isActive ?? true,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json({ message: 'Product updated successfully!' });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
