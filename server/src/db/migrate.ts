import fs from 'fs';
import path from 'path';
import { query, testConnection } from './connection';

async function migrate() {
  console.log('[Migrate] Starting migration...');

  const connected = await testConnection();
  if (!connected) {
    console.error('[Migrate] Could not connect to database. Aborting.');
    process.exit(1);
  }

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`[Migrate] Running: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      await query(sql);
      console.log(`[Migrate] ✓ ${file}`);
    } catch (err) {
      console.error(`[Migrate] ✗ ${file}:`, err);
      process.exit(1);
    }
  }

  console.log('[Migrate] All migrations completed.');
  process.exit(0);
}

migrate();
