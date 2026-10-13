import { NextFunction, Request, Response } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.session && req.session.userId) {
    return next();
  }
  res
    .status(401)
    .json({ error: 'Acesso não autorizado. Por favor, faça login.' });
};
