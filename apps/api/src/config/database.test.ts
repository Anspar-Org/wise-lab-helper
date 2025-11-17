import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseService } from './database';

describe('DatabaseService', () => {
  describe('Configuration', () => {
    it('should read DATABASE_URL from environment', () => {
      const originalUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

      const db = new DatabaseService();
      expect(db.getConnectionString()).toBe('postgresql://test:test@localhost:5432/test');

      process.env.DATABASE_URL = originalUrl;
    });

    it('should support local-only mode via environment variable', () => {
      process.env.DATABASE_LOCAL_ONLY = 'true';

      const db = new DatabaseService();
      expect(db.isLocalOnly()).toBe(true);

      delete process.env.DATABASE_LOCAL_ONLY;
    });

    it('should default to local-only in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const db = new DatabaseService();
      expect(db.isLocalOnly()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not be local-only in production without explicit flag', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalFlag = process.env.DATABASE_LOCAL_ONLY;

      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_LOCAL_ONLY;

      const db = new DatabaseService();
      expect(db.isLocalOnly()).toBe(false);

      process.env.NODE_ENV = originalEnv;
      process.env.DATABASE_LOCAL_ONLY = originalFlag;
    });
  });

  describe('Connection Pool', () => {
    let db: DatabaseService;

    beforeAll(() => {
      db = new DatabaseService();
    });

    afterAll(async () => {
      await db.close();
    });

    it('should connect to database successfully', async () => {
      await expect(db.connect()).resolves.not.toThrow();
    });

    it('should execute health check query', async () => {
      const result = await db.healthCheck();
      expect(result).toBe(true);
    });

    it('should execute queries with proper escaping', async () => {
      const result = await db.query('SELECT $1::text as value', ['test']);
      expect(result.rows[0].value).toBe('test');
    });

    it('should handle query errors gracefully', async () => {
      await expect(
        db.query('SELECT * FROM nonexistent_table')
      ).rejects.toThrow();
    });

    it('should support transactions', async () => {
      const client = await db.getClient();

      try {
        await client.query('BEGIN');
        const result = await client.query('SELECT 1 as test');
        expect(result.rows[0].test).toBe(1);
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
    });

    it('should close connections properly', async () => {
      const newDb = new DatabaseService();
      await newDb.connect();
      await expect(newDb.close()).resolves.not.toThrow();
    });
  });

  describe('Local-Only Safety', () => {
    it('should prevent external connections in local-only mode', async () => {
      process.env.DATABASE_LOCAL_ONLY = 'true';
      process.env.DATABASE_URL = 'postgresql://user:pass@remote-server.com:5432/db';

      const db = new DatabaseService();

      // Should reject connection to remote host when local-only is enabled
      const connectionString = db.getConnectionString();
      const isLocalhost = connectionString.includes('localhost') ||
                         connectionString.includes('127.0.0.1') ||
                         connectionString.includes('::1');

      if (db.isLocalOnly()) {
        expect(isLocalhost).toBe(true);
      }

      delete process.env.DATABASE_LOCAL_ONLY;
    });
  });
});
