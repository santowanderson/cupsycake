import { NextFunction, Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  private customerService = new CustomerService();

  getAllCustomers = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customers = await this.customerService.getAllCustomers();
      res.status(200).json(customers);
    } catch (error) {
      next(error);
    }
  };
}
