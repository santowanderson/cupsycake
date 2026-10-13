import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await ProductModel.findAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
  }
};
