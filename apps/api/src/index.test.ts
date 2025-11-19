import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock database before importing app
vi.mock('./config/database', () => ({
  initializeDatabase: vi.fn(),
  getDatabase: vi.fn(() => ({
    healthCheck: vi.fn().mockResolvedValue(true),
    isLocalOnly: vi.fn().mockReturnValue(true),
    query: vi.fn(),
    close: vi.fn(),
  })),
}));

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
