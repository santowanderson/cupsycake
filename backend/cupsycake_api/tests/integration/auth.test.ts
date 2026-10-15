import { afterEach, describe, expect, it, jest } from '@jest/globals';
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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/auth/profile - should return 401 when unauthenticated', async () => {
    const response = await request(app).get('/api/auth/profile');
    expect(response.status).toBe(401);
  });
});
