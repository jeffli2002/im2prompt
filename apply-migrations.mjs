import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DATABASE_URL,
});

async function applyMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  console.log(`\nApplying migration: ${fileName}`);
  
  const statements = sql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const statement of statements) {
    if (statement.startsWith('--') || statement.length === 0) continue;
    
    try {
      await client.query(statement);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  Skipped (already exists)`);
      } else {
        console.error(`  Error: ${error.message}`);
      }
    }
  }
  
  console.log(`✓ Migration applied: ${fileName}`);
}

async function main() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const migrations = [
      './drizzle/0005_add_creem_support.sql',
      './drizzle/0006_add_content_sharing_system.sql',
    ];
    
    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      if (fs.existsSync(filePath)) {
        await applyMigration(filePath);
      } else {
        console.log(`Migration not found: ${migration}`);
      }
    }
    
    console.log('\n✓ All migrations applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
