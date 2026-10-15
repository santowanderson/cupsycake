import { describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { isAuthenticated } from '../../src/middlewares/auth.middleware';

describe('Auth Middleware - isAuthenticated', () => {
  it('should call next() when session and userId are present', () => {
    const req = {
      session: { userId: 1 },
    } as unknown as Request;

    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 401 status and error message when session or userId is missing', () => {
    const req = {
      session: {},
    } as unknown as Request;

    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = {
      status: statusMock,
    } as unknown as Response;

    const next = jest.fn() as NextFunction;

    isAuthenticated(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Acesso não autorizado. Por favor, faça login.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
