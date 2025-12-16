import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { admins } from '../src/server/db/schema';

// Load .env.local file before importing env-dependent modules
config({ path: resolve(process.cwd(), '.env.local') });

// Create database connection directly from environment variable
let databaseUrl = process.env.DATABASE_URL;

// If DATABASE_URL is not set or starts with #, try to read from .env.local manually
if (!databaseUrl || databaseUrl.startsWith('#')) {
  const fs = await import('fs');
  const path = await import('path');
  const envPath = path.resolve(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Match DATABASE_URL with or without quotes
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        databaseUrl = trimmed.replace(/^DATABASE_URL=/, '').replace(/^["']|["']$/g, '').trim();
        break;
      }
    }
  }
}

if (!databaseUrl || databaseUrl.startsWith('#')) {
  console.error('❌ DATABASE_URL environment variable is not set or is commented out');
  console.error('Please check your .env.local file and ensure DATABASE_URL is set correctly');
  process.exit(1);
}

// Clean the database URL (remove any comments or extra whitespace)
const cleanDatabaseUrl = databaseUrl.trim().split('\n')[0].trim();
if (!cleanDatabaseUrl.startsWith('postgresql://') && !cleanDatabaseUrl.startsWith('postgres://')) {
  console.error('❌ Invalid DATABASE_URL format. Must start with postgresql:// or postgres://');
  console.error('Received:', cleanDatabaseUrl.substring(0, 50) + '...');
  process.exit(1);
}

const sql = neon(cleanDatabaseUrl);
const db = drizzle(sql, { schema: { admins } });

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@im2prompt.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const name = process.env.ADMIN_NAME || 'Admin User';

  try {
    // First, ensure the admins table exists
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email)`;

    const passwordHash = await bcrypt.hash(password, 10);

    const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

    if (existing.length > 0) {
      await db
        .update(admins)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(admins.id, existing[0].id));

      console.log('🔐 Admin password updated successfully:');
      console.log('Email:', email);
      console.log('New Password:', password);
      console.log('ID:', existing[0].id);
    } else {
      const result = await db
        .insert(admins)
        .values({
          email,
          passwordHash,
          name,
        })
        .returning();

      console.log('✅ Admin user created successfully:');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('ID:', result[0].id);
      console.log('\n⚠️ Please change the password after first login!');
    }
  } catch (error: unknown) {
    console.error('❌ Failed to create or update admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdmin();

