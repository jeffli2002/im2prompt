#!/usr/bin/env tsx

/**
 * Manual credit grant utility
 *
 * Examples:
 *   pnpm tsx scripts/grant-credits.ts --email user@example.com --amount 500
 *   pnpm tsx scripts/grant-credits.ts --email user@example.com --amount 900 --reason "Pro+ monthly grant"
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { v4 as uuidv4 } from 'uuid';

import { createChildLogger } from '../src/lib/logger/logger';
import { creditTransactions, user, userCredits } from '../src/server/db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFiles = ['.env', '.env.local', '.env.production', '.env.development', '.env.test'];
for (const envFile of envFiles) {
  config({ path: resolve(__dirname, `../${envFile}`), override: false });
}

const grantLogger = createChildLogger('grant-credits');

interface Options {
  email?: string;
  amount?: number;
  reason?: string;
}

function parseOptions(argv: string[]): Options {
  const opts: Options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === '--email' || arg === '-e') {
      opts.email = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--amount' || arg === '-a') {
      const value = Number(argv[i + 1]);
      if (!Number.isNaN(value)) {
        opts.amount = value;
      }
      i += 1;
      continue;
    }

    if (arg === '--reason' || arg === '-r') {
      opts.reason = argv[i + 1];
      i += 1;
      continue;
    }

    // Positional email fallback
    if (!opts.email && !arg.startsWith('-')) {
      opts.email = arg;
    }
  }

  return opts;
}

async function main() {
  const { email, amount, reason } = parseOptions(process.argv.slice(2));

  if (!email) {
    console.error('❌ Missing required --email argument');
    process.exit(1);
  }

  if (!email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  if (amount === undefined || Number.isNaN(amount)) {
    console.error('❌ Missing required --amount argument (must be a positive integer)');
    process.exit(1);
  }

  if (amount <= 0) {
    console.error('❌ Amount must be greater than zero');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not configured');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  grantLogger.info(`🔍 Locating user by email: ${email}`);
  const [targetUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (!targetUser) {
    console.error(`❌ User not found for email ${email}`);
    process.exit(1);
  }

  const userId = targetUser.id;
  grantLogger.info(`✅ Found user ${userId}`);

  const grantReason = reason || 'Manual credit grant';
  const referenceId = `admin_grant_${Date.now()}`;

  const [existingAccount] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  const now = new Date();

  if (existingAccount) {
    grantLogger.info(
      `📈 Updating existing credit account (current balance: ${existingAccount.balance})`
    );
    await db
      .update(userCredits)
      .set({
        balance: existingAccount.balance + amount,
        totalEarned: existingAccount.totalEarned + amount,
        updatedAt: now,
      })
      .where(eq(userCredits.userId, userId));

    await db.insert(creditTransactions).values({
      id: uuidv4(),
      userId,
      type: 'earn',
      amount,
      balanceAfter: existingAccount.balance + amount,
      source: 'admin',
      description: grantReason,
      referenceId,
      metadata: JSON.stringify({
        grantedBy: 'admin-script',
        grantedAt: now.toISOString(),
        amount,
      }),
    });
  } else {
    grantLogger.info('🆕 Creating new credit account for user');
    await db.insert(userCredits).values({
      id: uuidv4(),
      userId,
      balance: amount,
      totalEarned: amount,
      totalSpent: 0,
      frozenBalance: 0,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(creditTransactions).values({
      id: uuidv4(),
      userId,
      type: 'earn',
      amount,
      balanceAfter: amount,
      source: 'admin',
      description: grantReason,
      referenceId,
      metadata: JSON.stringify({
        grantedBy: 'admin-script',
        grantedAt: now.toISOString(),
        amount,
        newAccount: true,
      }),
    });
  }

  const [updatedAccount] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  grantLogger.info('✅ Credit grant completed');
  grantLogger.info(`   User: ${email}`);
  grantLogger.info(`   Amount granted: ${amount}`);
  grantLogger.info(`   Reference: ${referenceId}`);

  if (updatedAccount) {
    grantLogger.info(`   New balance: ${updatedAccount.balance}`);
    grantLogger.info(`   Total earned: ${updatedAccount.totalEarned}`);
  }

  grantLogger.info(
    'You can verify the balance via the usage dashboard or by querying the user_credits table.'
  );
}

main().catch((error) => {
  console.error('❌ Failed to grant credits:', error);
  process.exit(1);
});
