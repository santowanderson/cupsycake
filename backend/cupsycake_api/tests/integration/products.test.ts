import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import request from 'supertest';
import pool from '../../src/config/database';
import app from '../../src/server';

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Product API Integration Tests', () => {
  // Silencia o console.error propositalmente durante os testes de erro
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return a list of active products with status 200', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Cupcake de Baunilha',
          slug: 'cupcake-classico-de-baunilha',
          price: 10.0,
          image_url: 'cupcake-classico-de-baunilha.jpg',
          stock_quantity: 20,
          is_active: true,
        },
      ];

      (pool.query as any).mockResolvedValueOnce([mockProducts]);

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Cupcake de Baunilha');
      expect(response.body[0].price).toBe(10); // Corrigido para número
    });

    it('should handle database errors gracefully with status 500', async () => {
      (pool.query as any).mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      const response = await request(app).get('/api/products');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});
