import { Request, Response } from 'express';
import { OrderModel } from '../models/order.model';

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.session.userId;
    const { shipping_address_id, shipping_fee, notes, items } = req.body;

    if (!customerId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const numericCustomerId = Number(customerId);
    if (isNaN(numericCustomerId)) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    if (!shipping_address_id) {
      res.status(400).json({
        error:
          'O ID do endereço de entrega (shipping_address_id) é obrigatório.',
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'O pedido deve conter ao menos um item.' });
      return;
    }

    const orderId = await OrderModel.create({
      customer_id: numericCustomerId,
      shipping_address_id,
      shipping_fee,
      notes,
      items,
    });

    res.status(201).json({ message: 'Pedido realizado com sucesso!', orderId });
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    res
      .status(400)
      .json({ error: error.message || 'Erro interno ao processar pedido.' });
  }
};

export const getCustomerOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customerId = req.session.userId;
    if (!customerId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const numericCustomerId = Number(customerId);
    if (isNaN(numericCustomerId)) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const orders = await OrderModel.findByCustomerId(numericCustomerId);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res
      .status(500)
      .json({ error: 'Erro interno ao buscar pedidos do usuário.' });
  }
};
