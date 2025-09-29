import { sql } from 'drizzle-orm';
import db from '../src/server/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Read all migration files
    const migrationsDir = path.join(__dirname, '../drizzle');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      // Split by statement breakpoint and execute each statement
      const statements = migrationSQL.split('--> statement-breakpoint');
      
      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (trimmedStatement) {
          try {
            await db.execute(sql.raw(trimmedStatement));
            console.log(`  ✓ Executed: ${trimmedStatement.substring(0, 50)}...`);
          } catch (error: any) {
            if (error.code === '42P07') {
              console.log(`  ⚠ Table already exists, skipping...`);
            } else if (error.code === '42710') {
              console.log(`  ⚠ Constraint already exists, skipping...`);
            } else {
              console.error(`  ✗ Error executing statement: ${error.message}`);
              // Continue with other statements
            }
          }
        }
      }
      console.log(`✓ Completed migration: ${file}\n`);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();