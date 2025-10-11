# Production & Preview Environment Readiness Audit

**Audit Date:** 2025-10-10  
**Status:** 🔴 CRITICAL ISSUES FOUND - ACTION REQUIRED

---

## Executive Summary

After conducting an ultra-thorough analysis of the payment system for production and preview deployment, **4 CRITICAL issues** and **8 high-priority recommendations** were identified that must be addressed before deployment.

### Critical Issues (Must Fix Before Deploy)

1. **🔴 CRITICAL**: Preview environment treated as test mode
2. **🔴 CRITICAL**: Webhook signature verification bypassed in development  
3. **🔴 CRITICAL**: No environment-specific webhook URL validation
4. **🔴 CRITICAL**: Missing production error monitoring configuration

---

## Issue #1: Preview Environment Test Mode Detection

### Current Implementation
**File:** `src/lib/creem/creem-service.ts:11-14`

```typescript
const getCreemTestMode = () => {
  const isDevEnvironment = env.NODE_ENV === 'development';
  return isDevEnvironment;
};
```

### Problem
- Preview deployments (Vercel preview branches) also have `NODE_ENV === 'production'`
- This causes preview environments to use **production Creem servers**
- Preview should use test mode, but production should not
- No way to distinguish between production and preview

### Impact
- 🔴 **CRITICAL**: Preview environments will create real charges
- 🔴 **CRITICAL**: Testing in preview will affect production metrics
- 🔴 **CRITICAL**: Cannot safely test payment flows in preview

### Solution Required

```typescript
// src/lib/creem/creem-service.ts
const getCreemTestMode = () => {
  // Explicitly check for production URL
  const appUrl = env.NEXT_PUBLIC_APP_URL || '';
  const isProductionUrl = appUrl.includes('yourdomain.com'); // Replace with actual domain
  
  // In production domain AND production env = use production mode
  // Everything else (dev, preview) = use test mode
  const isProduction = env.NODE_ENV === 'production' && isProductionUrl;
  
  return !isProduction; // Return true for test mode
};
```

**Alternative Solution (Recommended):**

Add explicit environment variable:

```bash
# .env.production (for production only)
NEXT_PUBLIC_CREEM_TEST_MODE=false
CREEM_API_KEY=creem_live_xxx

# .env.preview (for preview deployments)
NEXT_PUBLIC_CREEM_TEST_MODE=true
CREEM_API_KEY=creem_test_xxx

# .env.development (for local dev)
NEXT_PUBLIC_CREEM_TEST_MODE=true
CREEM_API_KEY=creem_test_xxx
```

---

## Issue #2: Webhook Signature Verification Bypass

### Current Implementation
**File:** `src/lib/creem/creem-service.ts:191-197`

```typescript
verifyWebhookSignature(payload: string, signature: string): boolean {
  const CREEM_WEBHOOK_SECRET = getCreemWebhookSecret();
  
  if (getCreemTestMode() && !CREEM_WEBHOOK_SECRET) {
    console.warn('Webhook signature verification skipped in test mode');
    return true; // ⚠️ SECURITY RISK
  }
  // ... verification logic
}
```

### Problem
- Webhook signature verification is **completely bypassed** in test mode if secret is missing
- This allows **ANY request** to trigger webhook handlers in development/preview
- Attackers could trigger fake subscription events in preview environments

### Impact
- 🔴 **HIGH SECURITY RISK**: Unauthenticated webhook execution
- 🔴 **DATA INTEGRITY**: Fake subscriptions could be created
- 🔴 **CREDIT FRAUD**: Attackers could grant themselves credits in preview

### Solution Required

```typescript
verifyWebhookSignature(payload: string, signature: string): boolean {
  const CREEM_WEBHOOK_SECRET = getCreemWebhookSecret();
  const testMode = getCreemTestMode();
  
  // ALWAYS require webhook secret, even in test mode
  if (!CREEM_WEBHOOK_SECRET) {
    console.error('[SECURITY] Webhook secret not configured');
    return false; // Fail closed
  }
  
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', CREEM_WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest('hex');
    const isValid = digest === signature;
    
    if (!isValid && testMode) {
      console.warn('[Test Mode] Invalid webhook signature - allowing for testing');
      // Only log in test mode, but still verify
    }
    
    return isValid;
  } catch (error) {
    console.error('[SECURITY] Webhook signature verification error:', error);
    return false; // Fail closed
  }
}
```

---

## Issue #3: Webhook URL Environment Validation

### Current State
- No validation of webhook source URL
- Webhook route accepts requests from any source
- No environment-specific URL allowlist

### Problem
**File:** `src/app/api/webhooks/creem/route.ts:209-224`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-creem-signature');
    
    // No origin validation!
    // Anyone can POST to this endpoint
    
    const isValid = creemService.verifyWebhookSignature(body, signature);
    // ...
  }
}
```

### Impact
- 🔴 **SECURITY**: Webhook endpoint exposed to internet without origin validation
- 🔴 **DOS RISK**: Can be hammered with fake webhook events
- 🔴 **DATA POLLUTION**: Database can be filled with junk webhook event records

### Solution Required

```typescript
// src/app/api/webhooks/creem/route.ts

const ALLOWED_WEBHOOK_IPS = [
  '54.xxx.xxx.xxx', // Creem production IPs
  '52.xxx.xxx.xxx',
];

const ALLOWED_USER_AGENTS = [
  'Creem-Webhooks',
];

export async function POST(request: NextRequest) {
  try {
    // 1. Validate environment
    const origin = request.headers.get('origin');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userAgent = request.headers.get('user-agent');
    
    // 2. Log webhook attempt for monitoring
    console.log('[Creem Webhook] Incoming request:', {
      origin,
      forwardedFor,
      userAgent,
      timestamp: new Date().toISOString(),
    });
    
    // 3. Rate limiting check (implement with upstash/redis)
    // const rateLimitOk = await checkRateLimit(forwardedFor);
    // if (!rateLimitOk) {
    //   return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    // }
    
    // 4. Validate user agent (if Creem sends consistent UA)
    if (env.NODE_ENV === 'production' && userAgent) {
      const isAllowedUA = ALLOWED_USER_AGENTS.some(ua => userAgent.includes(ua));
      if (!isAllowedUA) {
        console.warn('[Creem Webhook] Suspicious user agent:', userAgent);
        // Don't reject, but flag for monitoring
      }
    }
    
    // 5. Continue with existing signature verification
    const body = await request.text();
    const signature = request.headers.get('x-creem-signature');
    
    if (!signature) {
      console.error('[Creem Webhook] Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    // ... rest of existing code
  } catch (error) {
    console.error('[Creem Webhook] Error processing webhook:', error);
    
    // Send alert in production
    if (env.NODE_ENV === 'production') {
      // await sendAlertToSlack('[CRITICAL] Webhook processing error', error);
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## Issue #4: Production Error Monitoring

### Current State
- Console.log used for all logging
- No structured logging
- No error alerting system
- No production monitoring

### Problem
Errors are only visible in Vercel logs, requiring manual checking:

```typescript
// Current error handling throughout codebase
console.error('[Creem Webhook] Error processing webhook:', error);
// ⚠️ No alerts, no metrics, no tracking
```

### Impact
- 🔴 **BLIND SPOTS**: Production errors go unnoticed
- 🔴 **CUSTOMER IMPACT**: Failed payments/subscriptions not detected
- 🔴 **NO SLA**: Cannot meet service level agreements without monitoring

### Solution Required

```typescript
// src/lib/monitoring/logger.ts

import { env } from '@/env';

interface LogContext {
  userId?: string;
  subscriptionId?: string;
  error?: Error;
  metadata?: Record<string, any>;
}

class ProductionLogger {
  private isProduction = env.NODE_ENV === 'production';
  
  error(message: string, context: LogContext = {}) {
    // Console log (Vercel captures this)
    console.error(message, context);
    
    // In production, also send to monitoring service
    if (this.isProduction) {
      // Option 1: Sentry
      // Sentry.captureException(context.error, { extra: context });
      
      // Option 2: Datadog
      // DD_LOGS.error(message, context);
      
      // Option 3: Custom webhook to Slack/Discord
      // this.sendToSlack(message, context);
      
      // Option 4: Vercel Log Drains
      // Automatically captured, configure in Vercel dashboard
    }
  }
  
  warn(message: string, context: LogContext = {}) {
    console.warn(message, context);
    
    if (this.isProduction) {
      // Send warnings to monitoring
    }
  }
  
  info(message: string, context: LogContext = {}) {
    console.log(message, context);
  }
  
  metric(name: string, value: number, tags: Record<string, string> = {}) {
    if (this.isProduction) {
      // Track business metrics
      // Example: subscription_created, credit_granted, payment_failed
    }
  }
  
  private async sendToSlack(message: string, context: LogContext) {
    try {
      const slackWebhook = env.SLACK_WEBHOOK_URL;
      if (!slackWebhook) return;
      
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Production Error: ${message}`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'User ID', value: context.userId || 'N/A', short: true },
              { title: 'Subscription ID', value: context.subscriptionId || 'N/A', short: true },
              { title: 'Error', value: context.error?.message || 'N/A', short: false },
              { title: 'Timestamp', value: new Date().toISOString(), short: true },
            ],
          }],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

export const logger = new ProductionLogger();
```

**Usage:**

```typescript
// Replace all console.error with logger.error
// Before:
console.error('[Creem Webhook] Error processing webhook:', error);

// After:
logger.error('[Creem Webhook] Error processing webhook', {
  error,
  userId,
  subscriptionId,
  metadata: { eventType, eventId },
});
```

---

## Environment-Specific Configuration Matrix

| Configuration | Development | Preview | Production |
|--------------|-------------|---------|------------|
| NODE_ENV | `development` | `production` | `production` |
| Creem Test Mode | ✅ Yes | ✅ Yes | ❌ No |
| Creem Server | Test (idx: 1) | Test (idx: 1) | Live (idx: 0) |
| Webhook Signature | ✅ Verify | ✅ Verify | ✅ Verify |
| Database | Local/Dev | Preview DB | Production DB |
| Error Alerts | ❌ No | ⚠️ Maybe | ✅ Required |
| API Keys | Test keys | Test keys | Live keys |
| Webhook URL | localhost/ngrok | preview-xxx.vercel.app | yourdomain.com |
| Rate Limiting | ❌ Disabled | ⚠️ Lenient | ✅ Strict |

---

## Required Environment Variables Per Environment

### Development (.env.local)
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CREEM_TEST_MODE=true

# Creem Test Mode
CREEM_API_KEY=creem_test_xxx
CREEM_WEBHOOK_SECRET=whsec_test_xxx
CREEM_PRO_PLAN_PRODUCT_KEY=prod_test_pro_xxx
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_test_proplus_xxx

# Database
DATABASE_URL=postgresql://localhost:5432/im2prompt_dev

# No monitoring in dev
# SLACK_WEBHOOK_URL not needed
```

### Preview (Vercel Environment Variables)
```bash
NODE_ENV=production  # Set by Vercel
NEXT_PUBLIC_APP_URL=https://your-app-git-branch-username.vercel.app
NEXT_PUBLIC_CREEM_TEST_MODE=true  # ⚠️ IMPORTANT

# Creem Test Mode (same as dev)
CREEM_API_KEY=creem_test_xxx
CREEM_WEBHOOK_SECRET=whsec_test_xxx
CREEM_PRO_PLAN_PRODUCT_KEY=prod_test_pro_xxx
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_test_proplus_xxx

# Preview Database (separate from prod)
DATABASE_URL=postgresql://preview-db-connection-string

# Optional: Preview monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/PREVIEW/WEBHOOK
```

### Production (Vercel Production Environment)
```bash
NODE_ENV=production  # Set by Vercel
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Your actual domain
NEXT_PUBLIC_CREEM_TEST_MODE=false  # ⚠️ CRITICAL

# Creem Production Mode
CREEM_API_KEY=creem_live_xxx  # ⚠️ LIVE KEY
CREEM_WEBHOOK_SECRET=whsec_live_xxx  # ⚠️ LIVE SECRET
CREEM_PRO_PLAN_PRODUCT_KEY=prod_live_pro_xxx  # ⚠️ LIVE PRODUCT
CREEM_PROPLUS_PLAN_PRODUCT_KEY=prod_live_proplus_xxx  # ⚠️ LIVE PRODUCT

# Production Database
DATABASE_URL=postgresql://production-db-connection-string

# Production Monitoring (REQUIRED)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/PRODUCTION/WEBHOOK
SENTRY_DSN=https://xxx@sentry.io/xxx  # If using Sentry
```

---

## Database Safety Checks

### Issue: Cross-Environment Data Leakage

**Risk:** Preview or development code accessing production database

**Solution:**

```typescript
// src/server/db/index.ts

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';

// Validate database URL matches environment
function validateDatabaseUrl(url: string) {
  const isProduction = env.NODE_ENV === 'production' && 
                       env.NEXT_PUBLIC_APP_URL?.includes('yourdomain.com');
  
  // Production should never use test/dev databases
  if (isProduction) {
    if (url.includes('localhost') || url.includes('dev') || url.includes('test')) {
      throw new Error(
        '🔴 CRITICAL: Production environment attempting to connect to non-production database!'
      );
    }
  }
  
  // Dev/Preview should never use production database
  if (!isProduction) {
    if (url.includes('prod') || url.includes('production')) {
      throw new Error(
        '🔴 CRITICAL: Non-production environment attempting to connect to production database!'
      );
    }
  }
  
  return url;
}

const databaseUrl = validateDatabaseUrl(env.DATABASE_URL);
const client = postgres(databaseUrl);
const db = drizzle(client);

export default db;
```

---

## Webhook Configuration Per Environment

### Development
```
Webhook URL: Use ngrok or expose.dev for local testing
Example: https://abc123.ngrok.io/api/webhooks/creem

Setup:
1. Start local dev: npm run dev
2. Start tunnel: ngrok http 3000
3. Configure in Creem test dashboard
```

### Preview
```
Webhook URL: Preview deployment URL
Example: https://im2prompt-git-payment-feature-user.vercel.app/api/webhooks/creem

Setup:
1. Deploy to preview
2. Get preview URL from Vercel
3. Configure in Creem test dashboard
4. Test webhooks in preview
```

### Production
```
Webhook URL: Production domain
Example: https://yourdomain.com/api/webhooks/creem

Setup:
1. Verify production deployment
2. Configure in Creem LIVE dashboard
3. Test with small transaction
4. Monitor for 24 hours before full launch
```

---

## Pre-Deployment Checklist

### Code Changes Required

- [ ] **Fix #1**: Update `getCreemTestMode()` to use `NEXT_PUBLIC_CREEM_TEST_MODE`
- [ ] **Fix #2**: Remove webhook signature bypass
- [ ] **Fix #3**: Add webhook URL validation
- [ ] **Fix #4**: Implement production logger with alerts
- [ ] **Fix #5**: Add database URL environment validation
- [ ] **Fix #6**: Update error handling throughout payment code

### Environment Configuration

#### Development
- [ ] Set `NEXT_PUBLIC_CREEM_TEST_MODE=true`
- [ ] Use Creem test API keys
- [ ] Configure ngrok for webhook testing
- [ ] Test all payment flows end-to-end

#### Preview
- [ ] Configure Vercel preview environment variables
- [ ] Set `NEXT_PUBLIC_CREEM_TEST_MODE=true`
- [ ] Use separate preview database
- [ ] Configure webhook URL in Creem test dashboard
- [ ] Test complete subscription lifecycle
- [ ] Verify no production data/services accessed

#### Production
- [ ] Set `NEXT_PUBLIC_CREEM_TEST_MODE=false`
- [ ] Use Creem LIVE API keys
- [ ] Configure production database
- [ ] Set up error monitoring (Sentry/Slack)
- [ ] Configure webhook URL in Creem LIVE dashboard
- [ ] Set up rate limiting
- [ ] Configure backup/recovery procedures

### Testing Required

- [ ] **Unit tests** for payment logic
- [ ] **Integration tests** for Creem API
- [ ] **Webhook tests** with replay attacks
- [ ] **Environment tests** - verify each env uses correct mode
- [ ] **Load tests** - webhook endpoint under load
- [ ] **Security tests** - unauthorized webhook attempts
- [ ] **Failover tests** - database connection failures
- [ ] **End-to-end tests** - complete subscription flow in each environment

### Monitoring Setup

- [ ] Configure error alerting (Slack/Discord/PagerDuty)
- [ ] Set up Sentry or equivalent APM
- [ ] Create Vercel Log Drain (if using external logging)
- [ ] Set up dashboard for payment metrics
- [ ] Configure alerts for:
  - Webhook failures (> 5% error rate)
  - Credit grant failures
  - Database connection errors
  - Subscription cancellations (spike detection)
  - Payment failures (> 10% failure rate)

### Documentation

- [ ] Update README with environment setup
- [ ] Document webhook configuration process
- [ ] Create runbook for common payment issues
- [ ] Document rollback procedure
- [ ] Create incident response guide

---

## Deployment Strategy

### Phase 1: Preview Environment (Days 1-3)
1. Deploy code changes to preview
2. Configure test webhooks
3. Run comprehensive test suite
4. Invite 2-3 beta testers
5. Monitor for issues

### Phase 2: Soft Launch (Days 4-7)
1. Deploy to production
2. Enable for 10% of users (feature flag)
3. Monitor metrics closely
4. Validate webhook delivery
5. Check error rates

### Phase 3: Full Launch (Day 8+)
1. Increase to 50% of users
2. Monitor for 24 hours
3. If stable, enable for 100%
4. Announce feature to all users

### Rollback Plan
```bash
# If critical issues found in production:
1. Revert to previous deployment in Vercel
2. Disable payment features via feature flag
3. Investigate issue in preview environment
4. Fix and re-test before re-deploying
```

---

## Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Preview uses production API | 🔴 Critical | High | Add NEXT_PUBLIC_CREEM_TEST_MODE |
| Webhook signature bypass | 🔴 Critical | Medium | Remove bypass logic |
| Production errors go unnoticed | 🔴 Critical | High | Add error monitoring |
| Database data leakage | 🔴 Critical | Low | Add DB URL validation |
| Webhook DOS attack | 🟡 High | Medium | Add rate limiting |
| Failed credit grants | 🟡 High | Low | Add idempotency checks (done) |
| Expired webhook secrets | 🟢 Medium | Low | Secret rotation process |
| Server downtime during payment | 🟢 Medium | Low | Webhook retry mechanism |

---

## Cost Implications

### Development
- No costs (test mode)
- Free ngrok tier sufficient

### Preview
- Minimal costs (test mode, test transactions)
- Separate preview database costs
- ~$10-20/month

### Production
- Payment processing fees (Creem/Stripe rates)
- Database costs increase with users
- Monitoring costs (Sentry/Datadog)
- Estimated: $50-500/month depending on volume

---

## Success Metrics

Track these metrics after deployment:

### Immediate (First 24 Hours)
- Webhook success rate > 95%
- Payment error rate < 5%
- Credit grant accuracy 100%
- No production errors

### Short Term (First Week)
- Subscription conversion rate
- Payment failures by card type
- Webhook latency < 2 seconds
- Customer support tickets related to payments

### Long Term (First Month)
- Monthly recurring revenue (MRR)
- Churn rate
- Upgrade/downgrade patterns
- Credit usage patterns

---

## Emergency Contacts

```yaml
# Add actual contacts before production deploy
Technical Lead: name@company.com
DevOps Engineer: name@company.com
Creem Support: support@creem.io
Database Admin: name@company.com

# Incident Response
Slack Channel: #payment-incidents
PagerDuty: [if configured]
Status Page: status.yourdomain.com
```

---

## Conclusion

The payment system has **4 critical issues** that must be fixed before production deployment:

1. ✅ Preview environment detection (Fix provided)
2. ✅ Webhook security (Fix provided)
3. ✅ Environment validation (Fix provided)
4. ✅ Production monitoring (Fix provided)

**Estimated Time to Fix:** 4-6 hours  
**Recommended Deploy Date:** After all fixes + 3 days of preview testing

**Next Steps:**
1. Implement the 6 code fixes provided in this document
2. Configure environment variables for all 3 environments
3. Run comprehensive test suite in preview
4. Deploy to production with 10% rollout
5. Monitor for 48 hours before full launch

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-10  
**Audited By:** Claude (Comprehensive Analysis)
