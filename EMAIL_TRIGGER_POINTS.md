# Email Sending Trigger Points - Complete Reference

This document outlines all trigger points where emails should be sent in the im2prompt application.

---

## 📧 Email Templates Overview

| # | Template | Category | Priority | Trigger | BCC Monitoring |
|---|----------|----------|----------|---------|----------------|
| 1 | Welcome Email | Auth | Normal | User signup complete | ❌ |
| 2 | Email Verification | Auth | High | User registers | ❌ |
| 3 | Password Reset | Auth | Urgent | User requests reset | ❌ |
| 4 | Subscription Confirmation | Billing | Normal | Subscription activated | ✅ |
| 5 | Payment Failed | Billing | Urgent | Payment fails | ❌ |
| 6 | Credits Low Warning | Usage | Normal | Credits < 20%, 10%, or 5% | ❌ |
| 7 | Credits Exhausted | Usage | High | Credits = 0 | ✅ |
| 8 | Credits Refilled | Usage | Normal | Monthly refill occurs | ❌ |
| 9 | Generation Complete (Image) | Generation | Normal | Image ready | ❌ |
| 10 | Generation Complete (Video) | Generation | Normal | Video ready | ❌ |
| 11 | Generation Failed | Generation | High | Generation error | ❌ |
| 12 | Feedback Email | Support | Normal | User submits feedback | ✅ |
| 13 | Notification Email | System | Normal | Admin announcement | ❌ |
| 14 | Alert Email | System | Urgent | System alert | ❌ |
| 15 | Bug Report | Support | High | User reports bug | ✅ |

**BCC Monitoring:** All emails marked with ✅ are automatically BCC'd to `jefflee2002@gmail.com` for monitoring purposes.

---

## 🎯 Detailed Trigger Points

### 1. Authentication & Onboarding

#### Welcome Email
**File:** TBD (needs integration)
**Trigger:** After successful user signup
```typescript
// Location: src/app/api/auth/signup or auth callback
import { emailService } from '@/lib/email';
import { renderWelcomeTemplate } from '@/lib/email/templates';

// When: After user account is created and credits initialized
await emailService.sendEmail(
  {
    to: user.email,
    subject: 'Welcome to im2prompt! Your 15 Free Credits Are Ready',
    category: 'welcome',
    priority: 'normal',
  },
  renderWelcomeTemplate({
    userName: user.name,
    userEmail: user.email,
    signupMethod: authProvider, // 'email' | 'google' | 'github'
    signupCredits: 15,
    dashboardUrl: `${BASE_URL}/dashboard`,
    imageToPromptUrl: `${BASE_URL}/image-to-prompt`,
    textToPromptUrl: `${BASE_URL}/text-to-prompt`,
  })
);
```

**Conditions:**
- User successfully creates account
- Credits initialized (15 for new users)
- Send immediately after signup

---

#### Email Verification
**File:** TBD (needs integration)
**Trigger:** User registers with email
```typescript
// Location: src/app/api/auth/register
import { renderEmailVerificationTemplate } from '@/lib/email/templates';

// When: After email registration, before email is verified
await emailService.sendEmail(
  {
    to: user.email,
    subject: 'Verify Your Email Address - im2prompt',
    category: 'verification',
    priority: 'high',
  },
  renderEmailVerificationTemplate({
    userName: user.name,
    userEmail: user.email,
    verificationUrl: `${BASE_URL}/verify-email?token=${verificationToken}`,
    verificationCode: sixDigitCode,
    expiresInMinutes: 60,
  })
);
```

**Conditions:**
- Email-based registration
- Before account is fully activated
- Resend if user clicks "Resend verification"

---

#### Password Reset
**File:** TBD (needs integration)
**Trigger:** User requests password reset
```typescript
// Location: src/app/api/auth/forgot-password
import { renderPasswordResetTemplate } from '@/lib/email/templates';

// When: User clicks "Forgot Password"
await emailService.sendEmail(
  {
    to: user.email,
    subject: 'Reset Your Password - im2prompt',
    category: 'password-reset',
    priority: 'urgent',
  },
  renderPasswordResetTemplate({
    userName: user.name,
    userEmail: user.email,
    resetUrl: `${BASE_URL}/reset-password?token=${resetToken}`,
    expiresInMinutes: 60,
    requestIp: req.headers['x-forwarded-for'] || req.ip,
    requestTime: new Date().toISOString(),
    supportUrl: `${BASE_URL}/support`,
  })
);
```

**Conditions:**
- User submits forgot password form
- Always send (even if email doesn't exist - security)
- Token expires in 60 minutes

---

### 2. Subscription & Billing

#### Subscription Confirmation
**File:** `/src/app/api/webhooks/creem/route.ts` or `/src/app/api/webhooks/stripe/route.ts`
**Trigger:** Subscription successfully activated
```typescript
// Location: Creem/Stripe webhook handler
import { renderSubscriptionConfirmationTemplate } from '@/lib/email/templates';

// When: subscription.created or subscription.activated event
if (event.type === 'subscription.created' || event.type === 'subscription.activated') {
  await emailService.sendEmail(
    {
      to: customer.email,
      subject: `Welcome to im2prompt ${planName}! Your Subscription is Active`,
      category: 'subscription',
      priority: 'normal',
    },
    renderSubscriptionConfirmationTemplate({
      userName: user.name,
      userEmail: user.email,
      planName: subscription.planName, // 'Pro' | 'Pro+'
      billingInterval: subscription.interval, // 'monthly' | 'yearly'
      planPrice: subscription.amount,
      currency: 'USD',
      monthlyCredits: planCredits,
      extractions: planExtractions,
      startDate: subscription.startDate,
      nextBillingDate: subscription.nextBillingDate,
      invoiceUrl: invoice.url,
      dashboardUrl: `${BASE_URL}/dashboard`,
      features: planFeatures, // Array of feature strings
    })
  );
}
```

**Conditions:**
- New subscription created
- Subscription reactivated after cancellation
- Subscription upgraded

---

#### Payment Failed
**File:** `/src/app/api/webhooks/creem/route.ts` or `/src/app/api/webhooks/stripe/route.ts`
**Trigger:** Payment attempt fails
```typescript
// Location: Webhook handler
import { renderPaymentFailedTemplate } from '@/lib/email/templates';

// When: invoice.payment_failed event
if (event.type === 'invoice.payment_failed') {
  const attemptNumber = invoice.attemptCount || 1;
  const maxRetries = 3;
  
  await emailService.sendEmail(
    {
      to: customer.email,
      subject: `Payment Failed - Action Required (Attempt ${attemptNumber}/${maxRetries})`,
      category: 'billing',
      priority: 'urgent',
    },
    renderPaymentFailedTemplate({
      userName: user.name,
      userEmail: user.email,
      planName: subscription.planName,
      attemptedAmount: invoice.amount,
      currency: 'USD',
      attemptDate: invoice.attemptDate,
      failureReason: invoice.failureReason || 'Payment method declined',
      paymentMethod: `${paymentMethod.brand} •••• ${paymentMethod.last4}`,
      updatePaymentUrl: `${BASE_URL}/settings/billing`,
      retryAttempt: attemptNumber,
      maxRetries: maxRetries,
    })
  );
}
```

**Conditions:**
- Payment declined/failed
- Send on each retry attempt (1st, 2nd, 3rd)
- Escalating urgency with each attempt

---

### 3. Credits & Usage

#### Credits Low Warning
**File:** TBD (needs integration in credit tracking)
**Trigger:** Credits fall below threshold
```typescript
// Location: src/app/api/v1/usage/track/route.ts or credit deduction logic
import { renderCreditsLowWarningTemplate } from '@/lib/email/templates';

// When: After credit deduction, check threshold
async function checkCreditsThreshold(userId: string, newBalance: number) {
  const user = await getUserWithPlan(userId);
  const monthlyAllocation = user.plan.credits;
  const percentage = (newBalance / monthlyAllocation) * 100;
  
  // Check thresholds: 20%, 10%, 5%
  const thresholds = [20, 10, 5];
  
  for (const threshold of thresholds) {
    if (percentage <= threshold && !user.lastWarningAt[threshold]) {
      await emailService.sendEmail(
        {
          to: user.email,
          subject: `Your im2prompt Credits Are Running Low (${threshold}% Remaining)`,
          category: 'credits',
          priority: threshold === 5 ? 'high' : 'normal',
        },
        renderCreditsLowWarningTemplate({
          userName: user.name,
          userEmail: user.email,
          currentBalance: newBalance,
          warningThreshold: threshold,
          percentageRemaining: percentage,
          planName: user.plan.name,
          monthlyAllocation: monthlyAllocation,
          nextRefillDate: user.creditsRefillDate,
          daysUntilRefill: getDaysUntil(user.creditsRefillDate),
          upgradeUrl: `${BASE_URL}/pricing`,
          usageRate: calculateUsageRate(user),
          estimatedRunoutDays: estimateRunoutDays(newBalance, usageRate),
        })
      );
      
      // Mark warning sent
      await markWarningSent(userId, threshold);
      break; // Only send one warning
    }
  }
}
```

**Conditions:**
- Credits reach 20%, 10%, or 5% of monthly allocation
- Only send once per threshold per month
- Check after every credit deduction

---

#### Credits Exhausted
**File:** TBD (needs integration)
**Trigger:** Credits reach 0
```typescript
// Location: Credit deduction logic
import { renderCreditsExhaustedTemplate } from '@/lib/email/templates';

// When: Credits = 0
if (newBalance === 0) {
  await emailService.sendEmail(
    {
      to: user.email,
      subject: 'Your im2prompt Credits Are Exhausted',
      category: 'credits',
      priority: 'high',
    },
    renderCreditsExhaustedTemplate({
      userName: user.name,
      userEmail: user.email,
      planName: user.plan.name,
      exhaustedDate: new Date().toISOString(),
      nextRefillDate: user.creditsRefillDate,
      daysUntilRefill: getDaysUntil(user.creditsRefillDate),
      upgradeUrl: `${BASE_URL}/pricing`,
      purchaseCreditsUrl: `${BASE_URL}/buy-credits`,
    })
  );
}
```

**Conditions:**
- User's credits = 0
- Send immediately when exhausted
- Send only once per month cycle

---

#### Credits Refilled
**File:** `/src/app/api/cron/monthly-credits/route.ts`
**Trigger:** Monthly credit refill occurs
```typescript
// Location: Cron job that refills credits
import { renderCreditsRefilledTemplate } from '@/lib/email/templates';

// When: Monthly refill cron runs
export async function POST(req: Request) {
  const usersToRefill = await getUsersForRefill();
  
  for (const user of usersToRefill) {
    const creditsAdded = user.plan.credits;
    
    await refillUserCredits(user.id, creditsAdded);
    
    await emailService.sendEmail(
      {
        to: user.email,
        subject: 'Your im2prompt Credits Have Been Refilled! 🎉',
        category: 'credits',
        priority: 'normal',
      },
      renderCreditsRefilledTemplate({
        userName: user.name,
        userEmail: user.email,
        planName: user.plan.name,
        creditsAdded: creditsAdded,
        newBalance: creditsAdded,
        refillDate: new Date().toISOString(),
        refillType: 'monthly',
        nextRefillDate: getNextRefillDate(user),
        dashboardUrl: `${BASE_URL}/dashboard`,
      })
    );
  }
}
```

**Conditions:**
- Monthly refill date reached
- User has active subscription
- Send to all paid users

---

### 4. Content Generation

#### Generation Complete (Image)
**File:** `/src/app/api/v1/generate-image/route.ts` or generation webhook handler
**Trigger:** Image generation completes
```typescript
// Location: After successful image generation
import { renderGenerationCompleteTemplate } from '@/lib/email/templates';

// When: Image generation succeeds
if (generation.status === 'succeeded') {
  await emailService.sendEmail(
    {
      to: user.email,
      subject: 'Your Image is Ready! 🎨',
      category: 'generation',
      priority: 'normal',
    },
    renderGenerationCompleteTemplate({
      userName: user.name,
      userEmail: user.email,
      generationType: 'image',
      model: generation.model, // 'flux-1.1-pro', 'flux-1.1', etc.
      prompt: generation.prompt,
      completionDate: generation.completedAt,
      processingTime: formatDuration(generation.processingTime),
      creditsUsed: generation.creditsUsed,
      viewUrl: `${BASE_URL}/generations/${generation.id}`,
      downloadUrl: `${BASE_URL}/api/download/${generation.id}`,
      thumbnailUrl: generation.thumbnailUrl,
      dashboardUrl: `${BASE_URL}/dashboard`,
    })
  );
}
```

**Conditions:**
- Image generation completed successfully
- User opted in for completion emails (check preferences)
- Send immediately after completion

---

#### Generation Complete (Video)
**File:** `/src/app/api/v1/sora-generate/route.ts` or video webhook handler
**Trigger:** Video generation completes
```typescript
// Location: After successful video generation
import { renderGenerationCompleteTemplate } from '@/lib/email/templates';

// When: Video generation succeeds (long-running)
if (generation.status === 'succeeded') {
  await emailService.sendEmail(
    {
      to: user.email,
      subject: 'Your Video is Ready! 🎬',
      category: 'generation',
      priority: 'normal',
    },
    renderGenerationCompleteTemplate({
      userName: user.name,
      userEmail: user.email,
      generationType: 'video',
      model: 'sora-1.0',
      prompt: generation.prompt,
      completionDate: generation.completedAt,
      processingTime: formatDuration(generation.processingTime),
      creditsUsed: generation.creditsUsed,
      viewUrl: `${BASE_URL}/generations/${generation.id}`,
      downloadUrl: `${BASE_URL}/api/download/${generation.id}`,
      thumbnailUrl: generation.thumbnailUrl,
      dashboardUrl: `${BASE_URL}/dashboard`,
    })
  );
}
```

**Conditions:**
- Video generation completed (typically 5-10 minutes)
- Always send for video (long processing time)
- Include video preview thumbnail

---

#### Generation Failed
**File:** Generation API routes with error handling
**Trigger:** Generation fails
```typescript
// Location: Error handler in generation routes
import { renderGenerationFailedTemplate } from '@/lib/email/templates';

// When: Generation fails
if (generation.status === 'failed') {
  // Refund credits
  await refundCredits(user.id, generation.creditsUsed);
  
  await emailService.sendEmail(
    {
      to: user.email,
      subject: 'Generation Failed - Credits Refunded',
      category: 'generation',
      priority: 'high',
    },
    renderGenerationFailedTemplate({
      userName: user.name,
      userEmail: user.email,
      generationType: generation.type,
      model: generation.model,
      prompt: generation.prompt,
      failureDate: new Date().toISOString(),
      errorReason: generation.errorMessage || 'Service temporarily unavailable',
      errorCategory: categorizeError(generation.error), // 'service' | 'content' | 'technical'
      creditsRefunded: generation.creditsUsed,
      retryUrl: `${BASE_URL}/retry/${generation.id}`,
      supportUrl: `${BASE_URL}/support`,
      dashboardUrl: `${BASE_URL}/dashboard`,
    })
  );
}
```

**Conditions:**
- Generation fails for any reason
- Credits automatically refunded
- Always send to keep user informed

---

### 5. Support & Feedback

#### Feedback Email
**File:** `/src/app/api/support/feedback/route.ts` ✅ **ALREADY INTEGRATED**
**Trigger:** User submits feedback
```typescript
// Location: Already implemented
import { emailService } from '@/lib/email';

// When: User submits feedback form
const result = await emailService.sendFeedbackEmail({
  email: formData.email,
  name: formData.name,
  category: formData.category,
  subject: formData.subject,
  message: formData.message,
  priority: formData.priority || 'normal',
  userId: session?.user?.id,
  userAgent: req.headers['user-agent'],
  metadata: {
    page: formData.page,
    referrer: req.headers.referer,
  },
});
```

**Conditions:**
- ✅ Already implemented and working
- Sends to admin emails
- No user action needed

---

#### Notification Email
**File:** TBD (admin-triggered)
**Trigger:** Admin sends announcement
```typescript
// Location: Admin dashboard or notification system
import { renderNotificationTemplate } from '@/lib/email/templates';

// When: Admin creates announcement
async function sendNotificationToUsers(notificationData: NotificationData) {
  const users = await getTargetUsers(notificationData.audience);
  
  for (const user of users) {
    await emailService.sendEmail(
      {
        to: user.email,
        subject: notificationData.title,
        category: 'notification',
        priority: 'normal',
      },
      renderNotificationTemplate({
        userName: user.name,
        userEmail: user.email,
        userId: user.id,
        title: notificationData.title,
        message: notificationData.message,
        actionUrl: notificationData.actionUrl,
        actionText: notificationData.actionText,
        notificationType: notificationData.type, // 'announcement' | 'update' | 'maintenance'
      })
    );
  }
}
```

**Conditions:**
- Admin initiates from admin panel
- Can target specific user segments
- Used for feature announcements, maintenance notices

---

#### Alert Email
**File:** TBD (system monitoring)
**Trigger:** System alert detected
```typescript
// Location: Error monitoring, rate limiting, anomaly detection
import { renderAlertTemplate } from '@/lib/email/templates';

// When: System detects anomaly
async function sendSystemAlert(alertData: AlertData) {
  await emailService.sendAlertEmail({
    title: alertData.title,
    message: alertData.message,
    alertType: alertData.type, // 'error' | 'usage' | 'security' | 'performance'
    severity: alertData.severity, // 'low' | 'medium' | 'high' | 'critical'
    timestamp: new Date().toISOString(),
    context: alertData.context,
    actionUrl: alertData.actionUrl,
    actionText: 'View Details',
  });
}

// Examples:
// - High API usage detected
// - Repeated login failures
// - Credit anomalies
// - Service degradation
// - Security incidents
```

**Conditions:**
- System monitoring detects issues
- Sends to admin emails only
- Severity determines priority

---

## 📋 Integration Checklist

### ✅ Already Integrated
- [x] Feedback Email (`/src/app/api/support/feedback/route.ts`)

### 🔧 Needs Integration

#### Authentication (3 emails)
- [ ] Welcome Email - After user signup
- [ ] Email Verification - During registration
- [ ] Password Reset - Forgot password flow

#### Billing (2 emails)
- [ ] Subscription Confirmation - Webhook: subscription.created
- [ ] Payment Failed - Webhook: invoice.payment_failed

#### Credits (3 emails)
- [ ] Credits Low Warning - Credit tracking logic
- [ ] Credits Exhausted - Credit tracking logic
- [ ] Credits Refilled - Monthly cron job ✅ (cron exists, needs email)

#### Generation (3 emails)
- [ ] Image Complete - After image generation
- [ ] Video Complete - After video generation
- [ ] Generation Failed - Error handling

#### System (1 email)
- [ ] Notification - Admin dashboard
- [ ] Alert - System monitoring

---

## 🚀 Implementation Priority

### Phase 1 - Critical (Do First)
1. **Welcome Email** - User onboarding
2. **Email Verification** - Account security
3. **Credits Exhausted** - User retention
4. **Payment Failed** - Revenue protection

### Phase 2 - Important (Do Next)
5. **Subscription Confirmation** - User experience
6. **Credits Low Warning** - Proactive engagement
7. **Generation Failed** - Customer support reduction

### Phase 3 - Nice to Have
8. **Password Reset** - Security
9. **Credits Refilled** - Engagement
10. **Generation Complete** - Long-running operations
11. **Notification** - Marketing
12. **Alert** - Operations

---

## 🔍 Key Files to Modify

| File | Purpose | Integration |
|------|---------|-------------|
| `src/app/api/webhooks/creem/route.ts` | Billing webhooks | Subscription & Payment emails |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhooks | Subscription & Payment emails |
| `src/app/api/cron/monthly-credits/route.ts` | Credit refills | Credits Refilled email |
| `src/app/api/v1/usage/track/route.ts` | Credit tracking | Credits Low/Exhausted emails |
| `src/app/api/v1/generate-image/route.ts` | Image generation | Generation Complete/Failed |
| `src/app/api/v1/sora-generate/route.ts` | Video generation | Generation Complete/Failed |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth callbacks | Welcome email |
| Auth registration handler | User signup | Email Verification |
| Password reset handler | Password reset | Password Reset email |

---

## 📊 Monitoring Integration Points

### Email Tracking
```typescript
// Track email performance
await analytics.track({
  event: 'email_sent',
  properties: {
    template: 'welcome_email',
    userId: user.id,
    messageId: result.messageId,
  },
});
```

### User Preferences
```typescript
// Check user email preferences before sending
const preferences = await getUserEmailPreferences(userId);

if (preferences.notifications.generations === false) {
  // Skip generation complete emails
  return;
}
```

### Rate Limiting
```typescript
// Prevent spam
const recentEmails = await getRecentEmails(userId, '1h');
if (recentEmails.length > 5) {
  logger.warn('Email rate limit exceeded', { userId });
  return;
}
```

---

## 🎯 Quick Reference

**To send an email:**
```typescript
import { emailService } from '@/lib/email';
import { render[TemplateName]Template } from '@/lib/email/templates';

await emailService.sendEmail(
  {
    to: user.email,
    subject: 'Email Subject',
    category: 'category_name',
    priority: 'normal' | 'high' | 'urgent',
  },
  render[TemplateName]Template({ ...params })
);
```

**Available templates:**
- `renderWelcomeTemplate`
- `renderEmailVerificationTemplate`
- `renderPasswordResetTemplate`
- `renderSubscriptionConfirmationTemplate`
- `renderPaymentFailedTemplate`
- `renderCreditsLowWarningTemplate`
- `renderCreditsExhaustedTemplate`
- `renderCreditsRefilledTemplate`
- `renderGenerationCompleteTemplate`
- `renderGenerationFailedTemplate`
- `renderFeedbackTemplate`
- `renderNotificationTemplate`
- `renderAlertTemplate`

---

**Generated:** 2025-11-03  
**Version:** 1.0.0  
**Status:** ✅ Ready for Integration
