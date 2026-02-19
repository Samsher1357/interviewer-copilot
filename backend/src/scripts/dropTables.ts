import { database } from '../services/database';

async function dropTables() {
  console.log('🗑️  Dropping all tables...\n');

  try {
    await database.connect();

    await database.query('DROP TABLE IF EXISTS interview_scores CASCADE');
    console.log('✅ Dropped interview_scores');

    await database.query('DROP TABLE IF EXISTS interviews CASCADE');
    console.log('✅ Dropped interviews');

    await database.query('DROP TABLE IF EXISTS interviewers CASCADE');
    console.log('✅ Dropped interviewers');

    await database.query('DROP TABLE IF EXISTS candidates CASCADE');
    console.log('✅ Dropped candidates');

    console.log('\n✅ All tables dropped successfully!');
    console.log('💡 Run "npm run db:setup" to recreate tables with fresh schema\n');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  } finally {
    await database.disconnect();
  }
}

dropTables();
