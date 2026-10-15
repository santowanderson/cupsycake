import { afterEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server';

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
}));

describe('Orders API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/orders - should return 401 when user is not authenticated', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(401);
  });
});
