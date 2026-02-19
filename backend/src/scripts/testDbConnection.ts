import { database } from '../services/database';
import { config } from '../config';

async function testConnection() {
  console.log('🔍 Testing PostgreSQL Database Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${config.database.host}`);
  console.log(`  Port: ${config.database.port}`);
  console.log(`  Database: ${config.database.database}`);
  console.log(`  User: ${config.database.user}`);
  console.log(`  Password: ${config.database.password ? '***' : '(not set)'}\n`);

  try {
    // Test connection
    await database.connect();

    // Test query
    console.log('🔍 Running test query...');
    const result = await database.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('\n✅ Query successful!');
    console.log(`  Current Time: ${result.rows[0].current_time}`);
    console.log(`  PostgreSQL Version: ${result.rows[0].pg_version}\n`);

    // Test pool stats
    const pool = database.getPool();
    console.log('📊 Connection Pool Stats:');
    console.log(`  Total connections: ${pool.totalCount}`);
    console.log(`  Idle connections: ${pool.idleCount}`);
    console.log(`  Waiting requests: ${pool.waitingCount}\n`);

    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    if (error instanceof Error) {
      console.error(`  Error: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await database.disconnect();
    console.log('\n👋 Test completed');
    process.exit(0);
  }
}

testConnection();
