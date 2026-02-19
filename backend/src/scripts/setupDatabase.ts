import { database } from '../services/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  try {
    await database.connect();

    // Run schema
    console.log('📋 Creating tables...');
    const schemaSQL = readFileSync(join(__dirname, '../db/schema.sql'), 'utf-8');
    await database.query(schemaSQL);
    console.log('✅ Tables created\n');

    // Run seed data
    console.log('🌱 Seeding data...');
    const seedSQL = readFileSync(join(__dirname, '../db/seed.sql'), 'utf-8');
    await database.query(seedSQL);
    console.log('✅ Data seeded\n');

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

setupDatabase();
