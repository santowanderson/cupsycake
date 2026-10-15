import { afterEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server';

describe('Order Routes Security Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/orders - should deny access with 401 when user is not authenticated', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        items: [{ product_id: 1, quantity: 2 }],
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });

  it('GET /api/orders - should deny access with 401 when user is not authenticated', async () => {
    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
