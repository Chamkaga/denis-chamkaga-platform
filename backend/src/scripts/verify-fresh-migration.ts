import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyFreshMigration() {
  const masterUrl = process.env.DATABASE_URL;
  if (!masterUrl) {
    console.error('DATABASE_URL is missing in environment');
    process.exit(1);
  }

  // Set schema parameter to fresh_migration_test
  const urlObj = new URL(masterUrl);
  urlObj.searchParams.set('schema', 'fresh_migration_test');
  const testSchemaUrl = urlObj.toString();

  try {
    console.log('--- Step 1: Initializing fresh schema (fresh_migration_test) ---');
    execSync(`npx prisma db execute --url "${masterUrl}" --stdin`, {
      input: 'DROP SCHEMA IF EXISTS fresh_migration_test CASCADE; CREATE SCHEMA fresh_migration_test;',
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env },
      encoding: 'utf-8'
    });
    console.log('✅ Fresh schema created cleanly: fresh_migration_test');

    console.log('\n--- Step 2: Running `npx prisma migrate deploy` on fresh schema ---');
    const deployOutput = execSync('npx prisma migrate deploy', {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env, DATABASE_URL: testSchemaUrl },
      encoding: 'utf-8'
    });
    console.log(deployOutput);

    console.log('--- Step 3: Running `npx prisma migrate status` on fresh schema ---');
    const statusOutput = execSync('npx prisma migrate status', {
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env, DATABASE_URL: testSchemaUrl },
      encoding: 'utf-8'
    });
    console.log(statusOutput);

    console.log('--- Step 4: Cleaning up fresh test schema ---');
    execSync(`npx prisma db execute --url "${masterUrl}" --stdin`, {
      input: 'DROP SCHEMA IF EXISTS fresh_migration_test CASCADE;',
      cwd: path.join(__dirname, '../..'),
      env: { ...process.env },
      encoding: 'utf-8'
    });
    console.log('✅ Fresh test schema cleaned up cleanly.');
    console.log('\n================================================================');
    console.log('🎉 FRESH SCHEMA MIGRATION VERIFICATION PASSED: ALL MIGRATIONS APPLIED CLEANLY');
    console.log('================================================================');
  } catch (err: any) {
    console.error('❌ Migration verification failed:', err.stdout || err.message);
    process.exit(1);
  }
}

verifyFreshMigration();
