import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DatabaseService - Manages PostgreSQL connection pool
 * Supports local-only mode for data privacy and development
 */
export class DatabaseService {
  private pool: Pool | null = null;
  private connectionString: string;
  private localOnly: boolean;

  constructor() {
    // Determine if we should run in local-only mode
    this.localOnly = this.determineLocalOnlyMode();

    // Get connection string
    this.connectionString = this.getConnectionString();

    // Enforce local-only restrictions
    if (this.localOnly) {
      this.enforceLocalOnly();
    }
  }

  /**
   * Determine if local-only mode should be enabled
   */
  private determineLocalOnlyMode(): boolean {
    // Explicit environment variable takes precedence
    if (process.env.DATABASE_LOCAL_ONLY !== undefined) {
      return process.env.DATABASE_LOCAL_ONLY === 'true';
    }

    // Default to local-only in development
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }

  /**
   * Get database connection string
   */
  public getConnectionString(): string {
    return this.connectionString || process.env.DATABASE_URL || 'postgresql://stemlab:stemlab_dev_password@localhost:5432/stemlab_dev';
  }

  /**
   * Check if running in local-only mode
   */
  public isLocalOnly(): boolean {
    return this.localOnly;
  }

  /**
   * Enforce local-only restrictions on connection string
   */
  private enforceLocalOnly(): void {
    const url = this.getConnectionString();

    // Parse the connection string to check the host
    const hostMatch = url.match(/@([^:\/]+)/);

    if (hostMatch) {
      const host = hostMatch[1];

      // Check if host is localhost
      const isLocal = host === 'localhost' ||
                     host === '127.0.0.1' ||
                     host === '::1' ||
                     host === '0.0.0.0' ||
                     host.endsWith('.local');

      if (!isLocal) {
        console.warn('⚠️  LOCAL-ONLY MODE: Rejecting remote database connection');
        console.warn(`    Attempted host: ${host}`);
        console.warn(`    Forcing localhost connection for data privacy`);

        // Replace remote host with localhost
        this.connectionString = url.replace(hostMatch[0], '@localhost');
      }
    }
  }

  /**
   * Initialize database connection pool
   */
  public async connect(): Promise<void> {
    if (this.pool) {
      return; // Already connected
    }

    this.pool = new Pool({
      connectionString: this.connectionString,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');

      if (this.localOnly) {
        console.log('🔒 Running in LOCAL-ONLY mode (data stays on this machine)');
      }

      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }

  /**
   * Health check - verify database connectivity
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      await this.connect();
    }

    try {
      const result = await this.pool!.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Execute a query
   */
  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      await this.connect();
    }

    try {
      return await this.pool!.query<T>(text, params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      await this.connect();
    }

    return await this.pool!.connect();
  }

  /**
   * Close all database connections
   */
  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database connections closed');
    }
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

/**
 * Get the database service instance
 */
export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<DatabaseService> {
  const db = getDatabase();
  await db.connect();
  return db;
}
