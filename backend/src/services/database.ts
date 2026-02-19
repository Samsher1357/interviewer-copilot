import { Pool, PoolClient } from 'pg';
import { config } from '../config';

class Database {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    if (this.pool) {
      console.log('Database pool already exists');
      return;
    }

    try {
      this.pool = new Pool(config.database);

      this.pool.on('error', (err) => {
        console.error('Unexpected database error:', err);
      });

      // Test the connection
      const client = await this.pool.connect();
      console.log('✅ Database connected successfully');
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('Database disconnected');
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool.query(text, params);
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool.connect();
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool;
  }
}

export const database = new Database();
