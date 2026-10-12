import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Tratamento de erros de validação do Zod (suporta tanto .errors quanto .issues)
  if (err instanceof ZodError) {
    const errorList = err.issues || [];
    res.status(400).json({
      message: 'Validation error',
      errors: errorList.map((e: any) => ({
        field: e.path ? e.path.join('.') : '',
        message: e.message,
      })),
    });
    return;
  }

  // 2. Tratamento caso o cliente envie um JSON malformado
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'Invalid JSON payload format.' });
    return;
  }

  // 3. Tratamento para erros de negócio lançados pelos serviços (ex: email/cpf duplicados)
  if (err instanceof Error && err.message) {
    const businessErrors = [
      'Email already registered',
      'CPF already registered',
      'Invalid email or password',
    ];

    if (businessErrors.includes(err.message)) {
      res.status(400).json({ message: err.message });
      return;
    }
  }

  // 4. Erros genéricos de servidor (500)
  console.error('[Error Handler]:', err);
  res.status(500).json({ message: err.message || 'Internal server error.' });
};
