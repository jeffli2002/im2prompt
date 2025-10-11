# Creem Payment Integration Guide

This document provides a comprehensive guide for the Creem payment integration implemented in this Next.js application.

## Overview

Creem is a payment platform designed for SaaS and indie hackers that serves as your merchant of record, handling tax compliance, VAT requirements, and fraud prevention while supporting global transactions.

## Features Implemented

### 1. Payment Provider Setup
- **CreemProvider Class** (`src/payment/creem/provider.ts`)
  - Implements the `PaymentProvider` interface
  - Handles checkout sessions, subscriptions, and payment status
  - Secure webhook verification using HMAC SHA256
  - Full TypeScript support with proper type definitions

### 2. Database Schema
- Extended `payment` table with:
  - `provider` column (enum: 'stripe' | 'creem')
  - `productId` column for Creem product references
- Extended `payment_event` table with:
  - `creemEventId` column for event deduplication
- Indexes for optimized queries on provider and user-provider combinations

### 3. API Routes

#### Checkout
- `POST /api/creem/checkout` - Create one-time payment checkout session
  - Validates user authentication
  - Creates or retrieves customer ID
  - Returns checkout URL

#### Subscription Management
- `POST /api/creem/subscription/create` - Create new subscription
- `GET /api/creem/subscription/[subscriptionId]` - Get subscription details
- `PATCH /api/creem/subscription/[subscriptionId]` - Update subscription
- `DELETE /api/creem/subscription/[subscriptionId]` - Cancel subscription

### 4. Webhook Handler
- `POST /api/webhooks/creem` - Handles Creem webhook events
  - Signature verification for security
  - Event deduplication to prevent double-processing
  - Comprehensive event handling:
    - `checkout.completed` - One-time payment completed
    - `subscription.active` - Subscription activated
    - `subscription.trialing` - Trial period started
    - `subscription.updated` - Subscription modified
    - `subscription.canceled` - Subscription canceled
    - `subscription.expired` - Subscription expired
    - `payment.succeeded` - Payment succeeded
    - `payment.failed` - Payment failed

### 5. Credit System Integration
- Automatic credit grants on subscription activation
- Monthly credit allocation for recurring payments
- Upgrade bonus credits when switching plans
- Configurable credit amounts per plan

### 6. Subscription Utilities
- `getCreemSubscriptionStatus()` - Get user's subscription status
- `hasActiveCreemSubscription()` - Check if user has active subscription
- `getSubscriptionPlan()` - Get user's current plan
- `isSubscriptionActive()` - Validate subscription status
- `willCancelAtPeriodEnd()` - Check if subscription will cancel

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Creem Payment Configuration
CREEM_PAYMENT_KEY="your-creem-api-key"
CREEM_WEBHOOK_SECRET="your-creem-webhook-secret"
CREEM_PRODUCT_KEY="your-creem-product-key"

# Creem Price IDs (Public - used in frontend)
NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY="price_xxx"
NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY="price_xxx"
NEXT_PUBLIC_CREEM_PRICE_PROPLUS_MONTHLY="price_xxx"
NEXT_PUBLIC_CREEM_PRICE_PROPLUS_YEARLY="price_xxx"
```

### Payment Config Setup

Update `src/config/payment.config.ts` to include Creem price IDs for each plan:

```typescript
plans: [
  {
    id: 'pro',
    name: 'Pro',
    creemPriceIds: {
      monthly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY,
      yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY,
    },
    // ... other config
  }
]
```

## Database Migration

Run the migration to add Creem support:

```bash
pnpm db:migrate:deploy
```

This will execute the migration file: `drizzle/0005_add_creem_support.sql`

## Webhook Setup

### 1. In Creem Dashboard

1. Navigate to Developers > Webhooks
2. Click "Add webhook"
3. Enter webhook details:
   - **Name**: Production Webhook (or any descriptive name)
   - **URL**: `https://yourdomain.com/api/webhooks/creem`
   - **Events**: Select all subscription and payment events
4. Copy the webhook secret
5. Add the secret to your `.env.local` as `CREEM_WEBHOOK_SECRET`

### 2. For Local Development

Use ngrok or similar tool to expose your local server:

```bash
ngrok http 3000
```

Then use the ngrok URL for your webhook:
```
https://abc123.ngrok.io/api/webhooks/creem
```

## Security Best Practices

### 1. Webhook Signature Verification
All webhooks are verified using HMAC SHA256:
```typescript
const expectedSignature = createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');
```

### 2. Event Deduplication
Events are checked against the database to prevent duplicate processing:
```typescript
const isProcessed = await paymentRepository.isCreemEventProcessed(event.id);
```

### 3. User Authorization
All API routes verify user authentication and ownership:
```typescript
if (!paymentRecord || paymentRecord.userId !== session.user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### 4. Secure Logging
- No sensitive data (API keys, customer info) logged
- Structured logging with contextual metadata
- Error tracking with proper sanitization

## Usage Examples

### Creating a Checkout Session

```typescript
const response = await fetch('/api/creem/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_xxx',
    successUrl: 'https://yourdomain.com/success',
    cancelUrl: 'https://yourdomain.com/cancel',
    metadata: {
      planId: 'pro',
      interval: 'monthly'
    }
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Creem checkout
```

### Creating a Subscription

```typescript
const response = await fetch('/api/creem/subscription/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_xxx',
    trialPeriodDays: 14,
    metadata: {
      planId: 'pro'
    }
  })
});

const subscription = await response.json();
```

### Checking Subscription Status

```typescript
import { getCreemSubscriptionStatus } from '@/lib/creem/subscription-utils';

const subscriptionInfo = await getCreemSubscriptionStatus(userId);

if (subscriptionInfo.hasActiveSubscription) {
  console.log('User has active subscription:', subscriptionInfo.planId);
}
```

### Canceling a Subscription

```typescript
const response = await fetch(`/api/creem/subscription/${subscriptionId}`, {
  method: 'DELETE'
});

const { success } = await response.json();
```

## Error Handling

All errors are logged with contextual information:

```typescript
try {
  // Payment operation
} catch (error) {
  errorLogger.logError(error as Error, {
    operation: 'create-checkout',
    userId,
    priceId
  });
  
  return NextResponse.json(
    { error: 'Failed to create checkout' },
    { status: 500 }
  );
}
```

## Testing

### 1. Test Webhook Locally

```bash
# Start your development server
pnpm dev

# In another terminal, use ngrok
ngrok http 3000

# Use the ngrok URL in Creem dashboard
```

### 2. Test Checkout Flow

1. Navigate to your pricing page
2. Click on a plan
3. Complete the checkout
4. Verify webhook is received
5. Check database for payment record
6. Verify credits are granted

### 3. Test Subscription Management

1. Create a test subscription
2. Update the subscription (change plan)
3. Cancel the subscription
4. Verify all events are properly recorded

## Monitoring

### Key Metrics to Track

1. **Webhook Success Rate**: Monitor webhook delivery success
2. **Payment Success Rate**: Track successful vs failed payments
3. **Subscription Churn**: Monitor cancellation rates
4. **Credit Grant Success**: Ensure credits are properly allocated

### Logging

All webhook events are logged with:
- Event ID
- Event type
- User ID
- Subscription/Payment ID
- Status
- Timestamp

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed
- Verify `CREEM_WEBHOOK_SECRET` matches dashboard
- Check webhook payload is not modified
- Ensure Content-Type is `application/json`

#### 2. Credits Not Granted
- Check webhook was received and processed
- Verify plan configuration has credit amounts
- Check credit service logs for errors
- Ensure referenceId is unique (prevents duplicates)

#### 3. Subscription Not Found
- Verify subscription was created in database
- Check payment record has correct subscriptionId
- Ensure webhook events were processed in order

#### 4. API Route Returns 503
- Verify Creem is configured (env variables set)
- Check `isCreemConfigured` returns true
- Ensure API key is valid

## Files Modified/Created

### Core Files
- `src/payment/creem/client.ts` - Creem client configuration
- `src/payment/creem/provider.ts` - Payment provider implementation
- `src/payment/types.ts` - Creem-specific type definitions
- `src/lib/creem/subscription-utils.ts` - Subscription utilities

### API Routes
- `src/app/api/creem/checkout/route.ts` - Checkout endpoint
- `src/app/api/creem/subscription/create/route.ts` - Create subscription
- `src/app/api/creem/subscription/[subscriptionId]/route.ts` - Manage subscription
- `src/app/api/webhooks/creem/route.ts` - Webhook handler

### Database
- `src/server/db/schema.ts` - Updated schema
- `src/server/db/repositories/payment-repository.ts` - Repository updates
- `drizzle/0005_add_creem_support.sql` - Migration file

### Configuration
- `src/config/payment.config.ts` - Payment configuration
- `src/types/index.d.ts` - Type definitions
- `src/env.ts` - Environment variables
- `env.example` - Example environment file

## Support

For issues or questions:
1. Check Creem documentation: https://docs.creem.io
2. Review webhook logs in your application
3. Check Creem dashboard for event history
4. Review error logs for detailed error messages

## Next Steps

1. **Frontend Integration**: Create UI components for subscription management
2. **Customer Portal**: Build customer self-service portal
3. **Analytics**: Add payment analytics dashboard
4. **Email Notifications**: Send subscription status emails
5. **Billing History**: Display payment history to users
