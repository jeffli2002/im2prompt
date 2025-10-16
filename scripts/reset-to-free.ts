#!/usr/bin/env tsx

/**
 * Reset a user's subscription and credits back to the free tier.
 *
 * Example:
 *   pnpm tsx scripts/reset-to-free.ts --email 994235892@qq.com
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { createChildLogger } from '../src/lib/logger/logger';
import {
  user,
  payment,
  paymentEvent,
  userCredits,
  creditTransactions,
} from '../src/server/db/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envFiles = ['.env', '.env.local', '.env.production', '.env.development', '.env.test'];
for (const envFile of envFiles) {
  config({ path: resolve(__dirname, `../${envFile}`), override: false });
}

const resetLogger = createChildLogger('reset-to-free');

interface Options {
  email?: string;
}

function parseOptions(argv: string[]): Options {
  const opts: Options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if ((arg === '--email' || arg === '-e') && argv[i + 1]) {
      opts.email = argv[i + 1];
      i += 1;
      continue;
    }

    if (!opts.email && !arg.startsWith('-')) {
      opts.email = arg;
    }
  }
  return opts;
}

async function main() {
  const { email } = parseOptions(process.argv.slice(2));

  if (!email || !email.includes('@')) {
    console.error('❌ Please provide a valid --email argument');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not configured');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  resetLogger.info(`🔍 Looking up user by email: ${email}`);
  const [targetUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (!targetUser) {
    console.error(`❌ User not found for email ${email}`);
    process.exit(1);
  }

  const userId = targetUser.id;
  resetLogger.info(`✅ Found user ${userId}`);

  const now = new Date();
  const activeStatuses = ['active', 'trialing', 'past_due', 'incomplete'];

  const subscriptions = await db
    .select()
    .from(payment)
    .where(eq(payment.userId, userId))
    .orderBy(desc(payment.createdAt));

  const activeSubscriptions = subscriptions.filter((sub) =>
    sub.status ? activeStatuses.includes(sub.status) : false
  );

  if (activeSubscriptions.length === 0) {
    resetLogger.info('ℹ️ No active subscription records found. Skipping subscription update.');
  } else {
    for (const sub of activeSubscriptions) {
      resetLogger.info(`🔄 Cancelling subscription record ${sub.id}`);

      await db
        .update(payment)
        .set({
          status: 'canceled',
          cancelAtPeriodEnd: false,
          periodEnd: now,
          updatedAt: now,
        })
        .where(eq(payment.id, sub.id));

      await db.insert(paymentEvent).values({
        id: uuidv4(),
        paymentId: sub.id,
        eventType: 'admin_reset_to_free',
        creemEventId: null,
        stripeEventId: null,
        eventData: JSON.stringify({
          performedAt: now.toISOString(),
          reason: 'reset_to_free',
        }),
      });
    }
  }

  const [creditAccount] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (!creditAccount) {
    resetLogger.info('ℹ️ User has no credit account; nothing to reset.');
    return;
  }

  const balanceToRemove = creditAccount.balance;

  if (balanceToRemove > 0) {
    resetLogger.info(`🧮 Removing ${balanceToRemove} credits from balance`);

    await db
      .update(userCredits)
      .set({
        balance: 0,
        totalSpent: creditAccount.totalSpent + balanceToRemove,
        updatedAt: now,
      })
      .where(eq(userCredits.userId, userId));

    await db.insert(creditTransactions).values({
      id: uuidv4(),
      userId,
      type: 'spend',
      amount: balanceToRemove,
      balanceAfter: 0,
      source: 'admin',
      description: 'Reset to free plan',
      referenceId: `admin_reset_${Date.now()}`,
      metadata: JSON.stringify({
        performedAt: now.toISOString(),
        previousBalance: creditAccount.balance,
      }),
    });
  } else {
    resetLogger.info('ℹ️ Credit balance already zero; skipping spend transaction.');
    await db
      .update(userCredits)
      .set({
        balance: 0,
        updatedAt: now,
      })
      .where(eq(userCredits.userId, userId));
  }

  resetLogger.info('✅ User has been reset to the free tier');
}

main().catch((error) => {
  console.error('❌ Failed to reset user:', error);
  process.exit(1);
});
