import { NextFunction, Request, Response } from 'express';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.authService.register(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);
      res.status(200).json(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid email or password'
      ) {
        res.status(401).json({ message: error.message });
        return;
      }
      next(error);
    }
  };
}
