import fs from 'fs';
import path from 'path';
import { query, testConnection } from './connection';

export async function runMigrations() {
  console.log('[Migrate] Starting migration...');

  const connected = await testConnection();
  if (!connected) {
    throw new Error('[Migrate] Could not connect to database. Aborting.');
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
      throw err;
    }
  }

  console.log('[Migrate] All migrations completed.');
}

// Allow running directly as a script: `ts-node migrate.ts`
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
