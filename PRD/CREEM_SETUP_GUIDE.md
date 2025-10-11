# Creem Payment Setup Guide

This guide walks you through setting up Creem payment integration for the im2prompt application.

## Prerequisites

- Node.js 18+ installed
- Creem account (sign up at https://creem.io)
- PostgreSQL database (Neon) already configured
- Better Auth already set up

## Step 1: Install Creem SDK

```bash
pnpm install
# The creem package is already added to package.json
```

If you need to install it separately:
```bash
pnpm add creem
```

## Step 2: Create Creem Products

### Test Mode Products

1. Log into your Creem dashboard
2. Switch to **Test Mode** (toggle in top navigation)
3. Navigate to **Products** → **Create Product**

#### Create Pro Plan Product:
- Name: `im2prompt Pro`
- Description: `Professional plan with 500 credits per month`
- Price: `$14.90` (or your preferred price)
- Billing Type: `Recurring`
- Billing Period: `Monthly`
- Click **Create**
- **Copy the Product ID** (format: `prod_xxxxxxxxxxxxx`)

#### Create Pro+ Plan Product:
- Name: `im2prompt Pro+`
- Description: `Premium plan with 900 credits per month`
- Price: `$24.90` (or your preferred price)
- Billing Type: `Recurring`
- Billing Period: `Monthly`
- Click **Create**
- **Copy the Product ID** (format: `prod_xxxxxxxxxxxxx`)

### Production Mode Products

Repeat the above steps in **Production Mode** when you're ready to go live.

## Step 3: Get API Keys

### Test Mode Keys

1. In Creem dashboard, go to **Settings** → **API Keys**
2. Ensure you're in **Test Mode**
3. Copy your **Secret Key** (format: `creem_test_xxxxxxxxxxxxx`)
4. Click **Create Webhook**:
   - Endpoint URL: `https://your-domain.com/api/webhooks/creem` (or use ngrok for local testing)
   - Events: Select all subscription events:
     - `checkout.completed`
     - `subscription.created`
     - `subscription.active`
     - `subscription.updated`
     - `subscription.canceled`
     - `subscription.expired`
     - `payment.succeeded`
     - `payment.failed`
   - Click **Create**
5. **Copy the Webhook Secret** (format: `wh_test_xxxxxxxxxxxxx`)

## Step 4: Update Environment Variables

Update your `.env.local` file:

```bash
# Creem Test Mode Configuration
CREEM_API_KEY=creem_test_<your_secret_key>
CREEM_WEBHOOK_SECRET=wh_test_<your_webhook_secret>
CREEM_PRO_PLAN_PRODUCT_KEY=prod_<pro_product_id>
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_<proplus_product_id>

# Optional: Direct payment URLs
NEXT_PUBLIC_CREEM_PRO_PAYMENT_URL=https://www.creem.io/test/payment/prod_<pro_product_id>
NEXT_PUBLIC_CREEM_PROPLUS_PAYMENT_URL=https://www.creem.io/test/payment/prod_<proplus_product_id>
```

### For Production:

```bash
# Creem Production Configuration
CREEM_API_KEY=creem_<your_production_secret_key>
CREEM_WEBHOOK_SECRET=wh_<your_production_webhook_secret>
CREEM_PRO_PLAN_PRODUCT_KEY=prod_<production_pro_product_id>
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_<production_proplus_product_id>

NEXT_PUBLIC_CREEM_PRO_PAYMENT_URL=https://www.creem.io/payment/prod_<production_pro_product_id>
NEXT_PUBLIC_CREEM_PROPLUS_PAYMENT_URL=https://www.creem.io/payment/prod_<production_proplus_product_id>
```

## Step 5: Test Locally with ngrok

For local webhook testing:

1. Install ngrok: `npm install -g ngrok` or download from https://ngrok.com
2. Start your Next.js app: `pnpm dev`
3. In another terminal, start ngrok: `ngrok http 3002`
4. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
5. Update your Creem webhook endpoint to: `https://abc123.ngrok.io/api/webhooks/creem`
6. Test a checkout flow

## Step 6: Verify Database Schema

The database schema is already set up. Verify these tables exist:

```sql
-- Check payment table has Creem support
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment' 
AND column_name IN ('provider', 'product_id');

-- Check payment_event table has Creem event tracking
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payment_event' 
AND column_name = 'creem_event_id';
```

## Step 7: Test the Integration

### Test Checkout Flow

1. Log into your app with a test user
2. Navigate to the pricing/upgrade page
3. Click "Upgrade to Pro" or "Upgrade to Pro+"
4. Complete the checkout on Creem
5. Verify you're redirected back with success message
6. Check the database:

```sql
-- Check payment record was created
SELECT * FROM payment 
WHERE user_id = '<your_test_user_id>' 
AND provider = 'creem'
ORDER BY created_at DESC LIMIT 1;

-- Check credits were granted
SELECT * FROM user_credits 
WHERE user_id = '<your_test_user_id>';

-- Check credit transaction
SELECT * FROM credit_transactions 
WHERE user_id = '<your_test_user_id>' 
AND source = 'subscription'
ORDER BY created_at DESC LIMIT 1;

-- Check webhook event was processed
SELECT * FROM payment_event 
WHERE creem_event_id IS NOT NULL 
ORDER BY created_at DESC LIMIT 5;
```

### Test Webhook Delivery

1. In Creem dashboard, go to **Webhooks**
2. Click on your webhook endpoint
3. View **Recent Deliveries**
4. Check for successful 200 responses
5. If failures, click to see error details

### Test Subscription Cancellation

```typescript
import { useCreemPayment } from '@/hooks/useCreemPayment';

function TestCancellation() {
  const { cancelSubscription } = useCreemPayment();
  
  const handleCancel = async () => {
    await cancelSubscription('<subscription_id>');
  };
}
```

## Step 8: Update UI Components

Example integration in a pricing component:

```typescript
'use client';

import { useCreemPayment } from '@/hooks/useCreemPayment';
import { useState, useEffect } from 'react';

export function PricingCard() {
  const { createCheckoutSession, getSubscription, isLoading } = useCreemPayment();
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    async function loadSubscription() {
      const sub = await getSubscription();
      setSubscription(sub);
    }
    loadSubscription();
  }, []);

  const handleUpgrade = async (planId: 'pro' | 'proplus') => {
    try {
      await createCheckoutSession({ planId });
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div>
      <h2>Pro Plan - $14.90/month</h2>
      <ul>
        <li>500 credits per month</li>
        <li>300 Image-to-Text conversions</li>
        <li>No watermark</li>
      </ul>
      <button 
        onClick={() => handleUpgrade('pro')} 
        disabled={isLoading || subscription?.priceId?.includes('pro')}
      >
        {subscription?.priceId?.includes('pro') ? 'Current Plan' : 'Upgrade to Pro'}
      </button>
    </div>
  );
}
```

## Step 9: Deploy to Production

### Vercel Deployment

1. Add environment variables in Vercel dashboard:
   - Go to **Project Settings** → **Environment Variables**
   - Add all `CREEM_*` variables for Production environment
   - Redeploy the application

2. Update Creem webhook URL to production:
   - `https://your-production-domain.com/api/webhooks/creem`

3. Test the production flow:
   - Use Creem test cards for final verification
   - Then switch to production API keys
   - Test with real payment (small amount)

### Webhook Monitoring

Set up monitoring for webhook health:

```sql
-- Create a view for webhook monitoring
CREATE VIEW webhook_health AS
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(CASE WHEN creem_event_id IS NOT NULL THEN 1 END) as creem_events
FROM payment_event
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_count DESC;
```

## Troubleshooting

### Issue: "Creem SDK not available"

**Solution**: Run `pnpm install` to install the creem package.

### Issue: "Invalid signature" on webhooks

**Causes**:
1. Wrong `CREEM_WEBHOOK_SECRET`
2. Webhook secret from wrong mode (test vs production)
3. Creem changed webhook secret

**Solution**: 
1. Verify `CREEM_WEBHOOK_SECRET` matches Creem dashboard
2. Ensure test/production mode matches
3. Regenerate webhook secret if needed

### Issue: Credits not granted

**Causes**:
1. Webhook event processed twice (idempotency check)
2. userId not in metadata
3. Database transaction failed

**Solution**:
```sql
-- Check if event was already processed
SELECT * FROM payment_event 
WHERE creem_event_id = '<event_id>';

-- Check if credit transaction exists
SELECT * FROM credit_transactions 
WHERE reference_id = 'creem_<subscription_id>';

-- Manually grant credits if needed (as admin)
INSERT INTO credit_transactions (
  id, user_id, type, amount, balance_after, 
  source, description, reference_id
) VALUES (
  gen_random_uuid(), 
  '<user_id>', 
  'earn', 
  500, 
  (SELECT balance + 500 FROM user_credits WHERE user_id = '<user_id>'), 
  'subscription', 
  'Manual credit grant - Pro subscription', 
  'manual_<subscription_id>'
);
```

### Issue: Checkout session creation fails

**Check**:
1. Better Auth session is valid
2. Product IDs are correct
3. API key has correct permissions
4. User email is valid

**Debug**:
```bash
# Check API logs
tail -f .next/server/app/api/payment/create-checkout/route.log

# Or check in Vercel dashboard → Logs
```

## Creem Test Cards

For testing payments in test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

Use any future expiry date and any CVC.

## Support Resources

- Creem Documentation: https://docs.creem.io
- Creem SDK GitHub: https://github.com/creem-io/creem-node
- Creem Support: support@creem.io
- im2prompt issues: Create issue in your repository

## Security Checklist

Before going to production:

- [ ] All Creem API keys are in environment variables (not hardcoded)
- [ ] Webhook signature verification is enabled
- [ ] Production webhook URL uses HTTPS
- [ ] Better Auth session validation on all payment endpoints
- [ ] User ownership check before subscription operations
- [ ] Database transactions for credit operations
- [ ] Error logging configured
- [ ] Webhook monitoring set up
- [ ] Rate limiting on payment endpoints (optional)
- [ ] CORS properly configured

## Next Steps

1. ✅ Install Creem SDK
2. ✅ Create test products
3. ✅ Configure environment variables
4. ✅ Test checkout flow locally
5. ✅ Verify webhook delivery
6. ✅ Test credit granting
7. ⬜ Update UI components
8. ⬜ Deploy to staging
9. ⬜ Create production products
10. ⬜ Deploy to production
