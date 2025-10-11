import db from './src/server/db/index.js';
import { payment } from './src/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';

const userId = 'dev-user';

console.log('Checking subscriptions for user:', userId);

const subs = await db
  .select()
  .from(payment)
  .where(eq(payment.userId, userId))
  .orderBy(desc(payment.createdAt));

console.log('\nAll payment records:');
subs.forEach((sub, i) => {
  console.log(`\n${i + 1}. Subscription:`, {
    id: sub.id,
    priceId: sub.priceId,
    type: sub.type,
    interval: sub.interval,
    status: sub.status,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    createdAt: sub.createdAt,
  });
});

process.exit(0);
