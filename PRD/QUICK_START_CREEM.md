# Quick Start: Creem Payment Integration

## 5-Minute Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Get Creem Credentials

1. Sign up at https://creem.io
2. Switch to **Test Mode**
3. Create two products:
   - **Pro Plan**: $14.90/month
   - **ProPlus Plan**: $24.90/month
4. Copy the product IDs
5. Go to **Settings → API Keys**
6. Copy your **Secret Key**
7. Create webhook: `http://localhost:3002/api/webhooks/creem`
8. Copy the **Webhook Secret**

### 3. Update .env.local

```bash
CREEM_API_KEY=creem_test_xxxxx
CREEM_WEBHOOK_SECRET=wh_test_xxxxx
CREEM_PRO_PLAN_PRODUCT_KEY=prod_xxxxx
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_xxxxx
```

### 4. Test Locally

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Start ngrok
ngrok http 3002

# Update webhook URL in Creem to: https://xxxx.ngrok.io/api/webhooks/creem
```

### 5. Use in Your Code

```typescript
import { useCreemPayment } from '@/hooks/useCreemPayment';

function PricingButton() {
  const { createCheckoutSession, isLoading } = useCreemPayment();
  
  return (
    <button 
      onClick={() => createCheckoutSession({ planId: 'pro' })}
      disabled={isLoading}
    >
      Upgrade to Pro
    </button>
  );
}
```

## What Was Implemented

✅ Checkout session creation
✅ Webhook handling (8 event types)
✅ Credit granting (500 for Pro, 900 for ProPlus)
✅ Subscription management
✅ Database integration
✅ Better Auth integration

## File Overview

```
Key Files:
├── src/lib/creem/creem-service.ts          [Core SDK wrapper]
├── src/hooks/useCreemPayment.ts            [React hook]
├── src/app/api/payment/                    [API routes]
└── src/app/api/webhooks/creem/route.ts    [Webhook handler]

Documentation:
├── CREEM_SETUP_GUIDE.md                    [Detailed setup]
├── CREEM_INTEGRATION_SUMMARY.md            [Technical details]
└── IMPLEMENTATION_COMPLETE.md              [Full overview]
```

## Testing Checklist

1. ☐ Run `pnpm install`
2. ☐ Create Creem products
3. ☐ Update .env.local
4. ☐ Start dev server
5. ☐ Start ngrok
6. ☐ Test checkout flow
7. ☐ Verify webhook delivery
8. ☐ Check database records
9. ☐ Verify credits granted

## Need Help?

- **Setup Issues**: See `CREEM_SETUP_GUIDE.md`
- **Integration**: See `CREEM_INTEGRATION_SUMMARY.md`
- **Technical Details**: See `IMPLEMENTATION_COMPLETE.md`
- **Creem Support**: support@creem.io

## Next Steps

1. Test the integration locally
2. Update your pricing page UI
3. Deploy to staging
4. Create production products
5. Go live\!

**Status**: ✅ Ready to test
**Time to first test**: ~15 minutes
**Time to production**: 1-2 days
