import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { env } from '@/env';

export async function GET(request: Request) {
  // Simple security check - only allow in development or with a secret key
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && key !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);
    
    console.log('Starting migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migrations completed successfully!' 
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}