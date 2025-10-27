import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database URL from environment
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_cDEPW1RT8zFV@ep-falling-hall-a14w0esx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = postgres(DATABASE_URL);

async function runMigrations() {
  console.log('Starting database migrations...');

  try {
    // Check if verification table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification'
      );
    `;

    if (tableExists[0].exists) {
      console.log('Verification table already exists, skipping migration.');
    } else {
      console.log('Creating verification table...');
      await sql`
        CREATE TABLE "verification" (
          "id" text PRIMARY KEY NOT NULL,
          "identifier" text NOT NULL,
          "value" text NOT NULL,
          "expires_at" timestamp NOT NULL,
          "created_at" timestamp,
          "updated_at" timestamp
        );
      `;
      console.log('✓ Verification table created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
