const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/hello should return greeting message', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Hello World from Backend!');
  });

  it('GET /api/health should return status OK and a valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    // Check if timestamp is a valid ISO string
    expect(() => new Date(res.body.timestamp).toISOString()).not.toThrow();
  });

  it('GET /api/nonexistent should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
  });
}); 