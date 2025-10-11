# Subscription System Testing Guide

## Quick Start Testing

This guide helps you verify the subscription management implementation works correctly.

## Prerequisites

1. Creem account with test mode enabled
2. Test API key and webhook secret configured
3. Test product IDs for Pro and Pro+ plans
4. Local or staging environment running
5. Database access for verification

## Environment Setup

```bash
# .env.local
CREEM_API_KEY=creem_test_xxx
CREEM_WEBHOOK_SECRET=whsec_test_xxx
CREEM_PRO_PLAN_PRODUCT_KEY=prod_test_pro_xxx
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_test_proplus_xxx
NEXT_PUBLIC_CREEM_TEST_MODE=true
NODE_ENV=development
```

## Testing Tools

### 1. Creem Dashboard
- View test checkouts
- Trigger webhook events manually
- View subscription details

### 2. Database Client
```sql
-- Check payment records
SELECT * FROM payment WHERE userId = 'user_xxx' ORDER BY createdAt DESC;

-- Check credit transactions
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC;

-- Check payment events
SELECT * FROM payment_event ORDER BY createdAt DESC LIMIT 10;
```

### 3. Webhook Testing Tool
Use Creem dashboard or tools like webhook.site to:
- Capture webhook payloads
- Replay webhooks
- Test idempotency

## Test Scenarios

### Scenario 1: New Subscription (No Trial)

**Steps:**
1. Log in as test user
2. Click "Subscribe to Pro"
3. Complete checkout with test card `4242424242424242`
4. Verify redirect to success URL

**Expected Results:**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'active'
-- priceId: 'pro'
-- subscriptionId: 'sub_xxx'

-- credit_transactions table
SELECT * FROM credit_transactions WHERE userId = 'user_xxx';
-- amount: 500 (for pro)
-- source: 'subscription'
-- description: 'Pro subscription credits (Creem)'
-- referenceId: 'creem_sub_xxx_initial_xxx'

-- user_credits table
SELECT * FROM user_credits WHERE userId = 'user_xxx';
-- balance: 500
-- totalEarned: 500
```

**Webhook Events:**
1. `checkout.completed` → Creates payment record, grants 500 credits
2. `subscription.created` → Confirms subscription

---

### Scenario 2: New Subscription (With Trial)

**Setup:**
```typescript
// Ensure trial is enabled in payment.config.ts
trial: {
  enabled: true,
  days: 14,
  plans: ['pro', 'proplus'],
}
```

**Steps:**
1. Log in as test user (new user for clean test)
2. Click "Subscribe to Pro"
3. Complete checkout
4. Verify trial status

**Expected Results (Immediately After Checkout):**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'trialing'
-- trialEnd: NOW() + 14 days
-- subscriptionId: 'sub_xxx'

-- credit_transactions table
SELECT COUNT(*) FROM credit_transactions WHERE userId = 'user_xxx';
-- COUNT: 0 (no credits granted during trial)

-- user_credits table
SELECT * FROM user_credits WHERE userId = 'user_xxx';
-- balance: 0 (or existing balance, no change)
```

**Steps to Simulate Trial End:**
1. Use Creem dashboard to trigger `subscription.trial_ended` webhook
2. Or wait 14 days in production

**Expected Results (After Trial Ends):**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'active' (changed from 'trialing')
-- trialEnd: NOW() (updated)

-- credit_transactions table
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC LIMIT 1;
-- amount: 500
-- description: 'Pro subscription credits (Creem)'
-- referenceId: 'creem_sub_xxx_initial_xxx'

-- user_credits table
SELECT * FROM user_credits WHERE userId = 'user_xxx';
-- balance: 500
-- totalEarned: 500
```

---

### Scenario 3: Subscription Renewal

**Prerequisites:**
- Active Pro subscription
- Waited one month or triggered renewal webhook manually

**Steps:**
1. Trigger `subscription.paid` webhook via Creem dashboard
2. Verify credits granted

**Expected Results:**
```sql
-- credit_transactions table (newest transaction)
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC LIMIT 1;
-- amount: 500
-- description: 'Pro subscription renewal (Creem)'
-- referenceId: 'creem_sub_xxx_renewal_xxx' (different from initial)

-- user_credits table
SELECT * FROM user_credits WHERE userId = 'user_xxx';
-- balance: previous_balance + 500
-- totalEarned: previous_total + 500
```

**Test Idempotency:**
1. Replay the same webhook (same event ID)
2. Verify no duplicate credit grant

```sql
-- Check that only ONE renewal transaction exists with this timestamp
SELECT COUNT(*) FROM credit_transactions 
WHERE userId = 'user_xxx' 
  AND referenceId LIKE 'creem_sub_xxx_renewal_%';
-- Should not increase after replay
```

---

### Scenario 4: Subscription Cancellation

**Steps:**
1. Click "Cancel Subscription" in user dashboard
2. API calls `/api/payment/cancel-subscription` (if implemented)
3. Or use Creem dashboard to cancel subscription

**Expected Results:**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'canceled'
-- cancelAtPeriodEnd: true or false (depends on cancellation type)
-- periodEnd: still set (subscription active until this date)

-- user_credits table
SELECT * FROM user_credits WHERE userId = 'user_xxx';
-- balance: UNCHANGED (user keeps credits until period ends)
```

**After Period Ends:**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'canceled'
-- No automatic status change (already canceled)

-- Credits remain in user account (business decision)
```

---

### Scenario 5: Plan Upgrade (Pro → Pro+)

**Current Limitation:**
User must cancel Pro and subscribe to Pro+ separately.

**Steps:**
1. Cancel Pro subscription
2. Wait for cancellation confirmation
3. Subscribe to Pro+

**Expected Results:**
```sql
-- Old Pro subscription
SELECT * FROM payment WHERE subscriptionId = 'sub_old' AND userId = 'user_xxx';
-- status: 'canceled'

-- New Pro+ subscription
SELECT * FROM payment WHERE subscriptionId = 'sub_new' AND userId = 'user_xxx';
-- status: 'active'
-- priceId: 'proplus'

-- credit_transactions
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC;
-- Two separate grants:
-- 1. Pro credits (kept from old subscription)
-- 2. Pro+ credits (new subscription grant of 900)
```

**Future Enhancement:**
When seamless upgrade is implemented via `updateSubscription` API:

**Expected Results:**
```sql
-- credit_transactions (newest)
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC LIMIT 1;
-- type: 'earn'
-- amount: 400 (difference between 900 and 500)
-- description: 'Plan upgrade: pro → proplus'
-- referenceId: 'creem_sub_xxx_plan_change_xxx'
```

---

### Scenario 6: Plan Downgrade (Pro+ → Pro)

**Current Limitation:**
User must cancel Pro+ and subscribe to Pro separately.

**Steps:**
1. Cancel Pro+ subscription
2. Subscribe to Pro

**Future Enhancement:**
When seamless downgrade is implemented:

**Expected Results:**
```sql
-- credit_transactions (newest)
SELECT * FROM credit_transactions WHERE userId = 'user_xxx' ORDER BY createdAt DESC LIMIT 1;
-- type: 'spend'
-- amount: 400 (difference between 500 and 900)
-- description: 'Plan downgrade: proplus → pro'
-- balanceAfter: max(0, previous_balance - 400) (never negative)
```

---

### Scenario 7: Duplicate Subscription Prevention

**Steps:**
1. Subscribe to Pro
2. While Pro is active, try to subscribe to Pro again
3. Try to subscribe to Pro+ while Pro is active

**Expected Results:**

**Same Plan:**
```json
{
  "error": "You already have an active PRO subscription",
  "code": "DUPLICATE_SUBSCRIPTION"
}
```

**Different Plan:**
```json
{
  "error": "You already have an active PRO subscription. Please cancel it first before subscribing to a different plan.",
  "code": "PLAN_CHANGE_REQUIRES_CANCELLATION",
  "currentPlan": "pro",
  "requestedPlan": "proplus"
}
```

---

### Scenario 8: Webhook Idempotency

**Steps:**
1. Capture a webhook payload (e.g., `checkout.completed`)
2. Send it to your webhook endpoint
3. Verify database changes
4. Replay the EXACT same webhook (same event ID)
5. Verify no duplicate database changes

**Expected Results:**

**First Webhook:**
```sql
-- payment_event table
SELECT * FROM payment_event WHERE creemEventId = 'evt_xxx';
-- One record created

-- credit_transactions table
SELECT COUNT(*) FROM credit_transactions WHERE referenceId = 'creem_sub_xxx_initial_xxx';
-- COUNT: 1
```

**Replayed Webhook:**
```sql
-- payment_event table (unchanged)
SELECT COUNT(*) FROM payment_event WHERE creemEventId = 'evt_xxx';
-- COUNT: still 1 (not 2)

-- credit_transactions table (unchanged)
SELECT COUNT(*) FROM credit_transactions WHERE referenceId = 'creem_sub_xxx_initial_xxx';
-- COUNT: still 1 (not 2)
```

**Logs should show:**
```
[Creem Webhook] Event evt_xxx already processed
[Creem Webhook] Credits already granted for reference creem_sub_xxx_initial_xxx
```

---

### Scenario 9: Payment Failure

**Steps:**
1. Use test card for declined payment: `4000000000000002`
2. Or trigger payment failure via Creem dashboard

**Expected Results:**
```sql
-- payment table
SELECT * FROM payment WHERE userId = 'user_xxx';
-- status: 'past_due' (Creem will retry)

-- Creem will automatically retry payment
-- If success: status → 'active'
-- If repeated failure: status → 'unpaid' or 'canceled'
```

---

### Scenario 10: Refund

**Steps:**
1. Issue refund via Creem dashboard
2. Verify webhook received

**Expected Results:**
```sql
-- payment table
SELECT * FROM payment WHERE subscriptionId = 'sub_xxx';
-- status: 'canceled' (subscription canceled due to refund)

-- payment_event table
SELECT * FROM payment_event WHERE eventType = 'refund.created';
-- Event logged

-- TODO: Credit revocation (business decision)
-- Optionally deduct credits if refund within grace period
```

---

## Automated Testing Scripts

### Test Credit Calculation

```bash
# test-credit-calculation.mjs
import { paymentConfig } from './src/config/payment.config.js';

function calculateCredits(planId, isYearly) {
  const plan = paymentConfig.plans.find(p => p.id === planId);
  if (!plan || !plan.credits) return 0;
  return isYearly ? (plan.credits.monthly * 12) : plan.credits.monthly;
}

console.log('Pro Monthly:', calculateCredits('pro', false)); // 500
console.log('Pro Yearly:', calculateCredits('pro', true)); // 6000
console.log('Pro+ Monthly:', calculateCredits('proplus', false)); // 900
console.log('Pro+ Yearly:', calculateCredits('proplus', true)); // 10800
```

### Test Webhook Handler

```typescript
// test-webhook-handler.ts
import { POST } from './src/app/api/webhooks/creem/route';

const mockCheckoutCompletedEvent = {
  id: 'evt_test_123',
  eventType: 'checkout.completed',
  object: {
    customer: { id: 'cus_test_123' },
    subscription: { id: 'sub_test_123' },
    metadata: {
      userId: 'user_test_123',
      planId: 'pro',
    },
  },
};

async function testWebhook() {
  const request = new Request('http://localhost:3000/api/webhooks/creem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-creem-signature': 'test_signature', // In test mode, signature is skipped
    },
    body: JSON.stringify(mockCheckoutCompletedEvent),
  });

  const response = await POST(request);
  console.log('Status:', response.status);
  console.log('Body:', await response.json());
}

testWebhook();
```

## Database Verification Queries

### Check Subscription Status
```sql
SELECT 
  u.email,
  p.priceId as plan,
  p.status,
  p.periodStart,
  p.periodEnd,
  p.cancelAtPeriodEnd,
  p.trialEnd,
  uc.balance as credits
FROM payment p
JOIN "user" u ON p.userId = u.id
LEFT JOIN user_credits uc ON p.userId = uc.userId
WHERE p.status IN ('active', 'trialing')
ORDER BY p.createdAt DESC;
```

### Check Credit History
```sql
SELECT 
  ct.createdAt,
  ct.type,
  ct.amount,
  ct.balanceAfter,
  ct.description,
  ct.referenceId
FROM credit_transactions ct
WHERE ct.userId = 'user_xxx'
ORDER BY ct.createdAt DESC
LIMIT 20;
```

### Check Webhook Events
```sql
SELECT 
  pe.createdAt,
  pe.eventType,
  pe.creemEventId,
  p.status as subscriptionStatus
FROM payment_event pe
JOIN payment p ON pe.paymentId = p.id
WHERE p.userId = 'user_xxx'
ORDER BY pe.createdAt DESC
LIMIT 20;
```

### Check for Duplicate Transactions
```sql
-- Should return 0 rows
SELECT referenceId, COUNT(*) as count
FROM credit_transactions
WHERE userId = 'user_xxx'
GROUP BY referenceId
HAVING COUNT(*) > 1;
```

## Common Issues and Debugging

### Issue 1: Credits Not Granted

**Check:**
```sql
-- Is subscription record created?
SELECT * FROM payment WHERE userId = 'user_xxx';

-- Is webhook event processed?
SELECT * FROM payment_event WHERE creemEventId = 'evt_xxx';

-- Any credit transactions?
SELECT * FROM credit_transactions WHERE userId = 'user_xxx';
```

**Common Causes:**
- Webhook not received (check Creem dashboard webhook logs)
- Invalid signature (check webhook secret)
- User ID missing in metadata
- Status is 'trialing' (credits granted after trial ends)

### Issue 2: Duplicate Credits

**Check:**
```sql
-- Count transactions by reference
SELECT referenceId, COUNT(*)
FROM credit_transactions
GROUP BY referenceId
HAVING COUNT(*) > 1;

-- Check unique constraint
SELECT * FROM credit_transactions 
WHERE referenceId = 'creem_sub_xxx_initial_xxx';
```

**Common Causes:**
- Unique constraint not applied
- Different reference ID format
- Database transaction not used

### Issue 3: Trial Credits Granted Immediately

**Check:**
```sql
-- Check subscription status
SELECT status, trialEnd FROM payment WHERE subscriptionId = 'sub_xxx';

-- Check when credits were granted
SELECT createdAt, description 
FROM credit_transactions 
WHERE userId = 'user_xxx' 
  AND referenceId LIKE 'creem_sub_xxx_%'
ORDER BY createdAt;
```

**Fix:**
- Ensure `handleCheckoutComplete` checks for trial
- Ensure credits only granted when status is NOT 'trialing'

### Issue 4: Webhook Not Received

**Check:**
1. Creem dashboard → Webhooks → View delivery attempts
2. Check webhook URL is correct
3. Verify endpoint is accessible (not localhost for production webhooks)
4. Check webhook signature secret matches

**For Local Development:**
Use ngrok or similar to expose local server:
```bash
ngrok http 3000
# Use ngrok URL in Creem webhook settings
```

## Performance Testing

### Load Test Webhook Endpoint

```bash
# Using Apache Bench
ab -n 100 -c 10 -T 'application/json' -p webhook-payload.json \
  https://yourdomain.com/api/webhooks/creem

# Expected:
# - All requests succeed (200 OK)
# - Idempotency prevents duplicate credit grants
# - Response time < 1000ms
```

### Database Performance

```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM payment 
WHERE userId = 'user_xxx' 
  AND status IN ('active', 'trialing');

-- Should use index on (userId, status)
```

## Checklist for Production Deployment

- [ ] Environment variables configured
- [ ] Webhook endpoint set in Creem dashboard
- [ ] Webhook signature verification working
- [ ] Database indexes created
- [ ] All test scenarios pass
- [ ] Idempotency verified with webhook replay
- [ ] Credit calculations verified
- [ ] Trial flow tested end-to-end
- [ ] Error logging and monitoring set up
- [ ] Alerts configured for webhook failures
- [ ] Documentation reviewed and updated

## Support and Debugging

### Logs to Check

```bash
# Webhook processing logs
grep "Creem Webhook" logs/*.log | tail -50

# Credit grant logs
grep "Granted.*credits" logs/*.log | tail -50

# Error logs
grep "ERROR.*Creem" logs/*.log | tail -50
```

### Key Metrics to Monitor

- Webhook success rate (should be > 95%)
- Credit grant rate (should match subscription creation rate)
- Failed payment rate (should be < 10%)
- Duplicate event detection rate

### Getting Help

If you encounter issues:
1. Check this guide first
2. Review logs for error messages
3. Verify webhook payloads in Creem dashboard
4. Check database for inconsistencies
5. Review SUBSCRIPTION_LIFECYCLE_GUIDE.md for detailed flow

## Conclusion

This testing guide provides:
- ✅ Step-by-step test scenarios
- ✅ Expected database results
- ✅ Verification queries
- ✅ Common issues and fixes
- ✅ Performance testing
- ✅ Production checklist

Follow this guide to ensure your subscription system works correctly before deploying to production.
