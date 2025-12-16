#!/usr/bin/env tsx

/**
 * Generate a secure random secret for ADMIN_JWT_SECRET
 * Usage: pnpm tsx scripts/generate-admin-secret.ts
 */

import { randomBytes } from 'node:crypto';

function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

const secret = generateSecret(32);

console.log('\n✅ Generated ADMIN_JWT_SECRET:');
console.log('━'.repeat(60));
console.log(secret);
console.log('━'.repeat(60));
console.log('\n📝 Add this to your .env.local file:');
console.log(`ADMIN_JWT_SECRET="${secret}"`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!\n');

