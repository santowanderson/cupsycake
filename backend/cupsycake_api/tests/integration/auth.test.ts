import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server';

jest.mock(
  'bcrypt',
  () => ({
    compare: jest.fn(),
    hash: jest.fn(),
  }),
  { virtual: true },
);

describe('Auth API Integration Tests', () => {
  it('GET /api/auth/profile - should return 200 with null when unauthenticated', async () => {
    const response = await request(app).get('/api/auth/profile');

    // Valida que a rota responde com sucesso (200) e payload nulo, evitando erros 401 no console
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
  });
});
