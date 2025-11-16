import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './index';

describe('API Health Check', () => {
  it('GET /health returns healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  it('GET /api/v1 returns API information', async () => {
    const response = await request(app).get('/api/v1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'STEM Lab Assistant API');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('description');
  });

  it('Returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
    expect(response.body.message).toContain('Cannot GET');
  });
});
