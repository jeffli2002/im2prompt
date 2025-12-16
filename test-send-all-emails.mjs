import { config } from 'dotenv';
import { Resend } from 'resend';

config({ path: '.env.production' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = 'jefflee2002@gmail.com';
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@im2prompt.com';

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

console.log('📧 Email Template Test Suite\n');
console.log('====================================\n');
console.log(`📬 Sending to: ${TEST_EMAIL}`);
console.log(`📨 From: ${FROM_EMAIL}\n`);

let sent = 0;
let failed = 0;

async function sendTestEmail(name, html, subject) {
  try {
    console.log(`📤 Sending: ${name}...`);

    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: TEST_EMAIL,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (response.error) {
      console.log(`   ❌ FAILED: ${response.error.message}`);
      failed++;
      return false;
    }

    console.log(`   ✅ SUCCESS: ${response.data.id}`);
    sent++;
    return true;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    failed++;
    return false;
  }
}

console.log('🚀 Starting email tests...\n');

const { renderWelcomeTemplate } = await import('./src/lib/email/templates/welcome-template.ts');
await sendTestEmail(
  'Welcome Email',
  renderWelcomeTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    signupMethod: 'email',
    signupCredits: 30,
    dashboardUrl: 'https://im2prompt.com/dashboard',
    imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
    textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
  }),
  'Welcome to im2prompt!'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderEmailVerificationTemplate } = await import(
  './src/lib/email/templates/email-verification-template.ts'
);
await sendTestEmail(
  'Email Verification',
  renderEmailVerificationTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    verificationUrl: 'https://im2prompt.com/verify?token=test123',
    verificationCode: '123456',
    expiresInMinutes: 60,
  }),
  'Verify Your Email Address'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderPasswordResetTemplate } = await import(
  './src/lib/email/templates/password-reset-template.ts'
);
await sendTestEmail(
  'Password Reset',
  renderPasswordResetTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    resetUrl: 'https://im2prompt.com/reset-password?token=test123',
    expiresInMinutes: 60,
    requestIp: '192.168.1.1',
    requestTime: new Date().toISOString(),
    supportUrl: 'https://im2prompt.com/support',
  }),
  'Reset Your Password'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderSubscriptionConfirmationTemplate } = await import(
  './src/lib/email/templates/subscription-confirmation-template.ts'
);
await sendTestEmail(
  'Subscription Confirmation',
  renderSubscriptionConfirmationTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    planName: 'Pro',
    billingInterval: 'monthly',
    planPrice: 14.9,
    currency: 'USD',
    monthlyCredits: 500,
    extractions: 300,
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoiceUrl: 'https://im2prompt.com/invoice/test123',
    dashboardUrl: 'https://im2prompt.com/dashboard',
    features: ['Commercial license', 'No watermark', 'Priority support'],
  }),
  'Pro Subscription Activated'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderPaymentFailedTemplate } = await import(
  './src/lib/email/templates/payment-failed-template.ts'
);
await sendTestEmail(
  'Payment Failed',
  renderPaymentFailedTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    planName: 'Pro',
    attemptedAmount: 14.9,
    currency: 'USD',
    attemptDate: new Date().toISOString(),
    failureReason: 'Card declined',
    paymentMethod: 'Visa •••• 4242',
    updatePaymentUrl: 'https://im2prompt.com/billing',
    retryAttempt: 1,
    maxRetries: 3,
  }),
  'Payment Failed - Action Required'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderCreditsLowWarningTemplate } = await import(
  './src/lib/email/templates/credits-low-warning-template.ts'
);
await sendTestEmail(
  'Credits Low Warning',
  renderCreditsLowWarningTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    currentBalance: 50,
    warningThreshold: 10,
    percentageRemaining: 10,
    planName: 'Pro',
    monthlyAllocation: 500,
    nextRefillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysUntilRefill: 15,
    upgradeUrl: 'https://im2prompt.com/pricing',
    usageRate: 6.7,
    estimatedRunoutDays: 7,
  }),
  'Credits Running Low'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderCreditsExhaustedTemplate } = await import(
  './src/lib/email/templates/credits-exhausted-template.ts'
);
await sendTestEmail(
  'Credits Exhausted',
  renderCreditsExhaustedTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    planName: 'Pro',
    exhaustedDate: new Date().toISOString(),
    nextRefillDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysUntilRefill: 10,
    upgradeUrl: 'https://im2prompt.com/pricing',
    purchaseCreditsUrl: 'https://im2prompt.com/buy-credits',
  }),
  'Credits Exhausted'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderCreditsRefilledTemplate } = await import(
  './src/lib/email/templates/credits-refilled-template.ts'
);
await sendTestEmail(
  'Credits Refilled',
  renderCreditsRefilledTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    planName: 'Pro',
    creditsAdded: 500,
    newBalance: 500,
    refillDate: new Date().toISOString(),
    refillType: 'monthly',
    nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dashboardUrl: 'https://im2prompt.com/dashboard',
  }),
  'Credits Refilled Successfully'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderGenerationCompleteTemplate } = await import(
  './src/lib/email/templates/generation-complete-template.ts'
);
await sendTestEmail(
  'Generation Complete (Image)',
  renderGenerationCompleteTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    generationType: 'image',
    model: 'flux-1.1-pro',
    prompt: 'A beautiful sunset over mountains with vibrant colors',
    completionDate: new Date().toISOString(),
    processingTime: '45 seconds',
    creditsUsed: 5,
    viewUrl: 'https://im2prompt.com/generations/test123',
    downloadUrl: 'https://im2prompt.com/download/test123',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    dashboardUrl: 'https://im2prompt.com/dashboard',
  }),
  'Your Image is Ready'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

await sendTestEmail(
  'Generation Complete (Video)',
  renderGenerationCompleteTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    generationType: 'video',
    model: 'sora-1.0',
    prompt: 'A cat walking through a garden in slow motion',
    completionDate: new Date().toISOString(),
    processingTime: '5 minutes',
    creditsUsed: 50,
    viewUrl: 'https://im2prompt.com/generations/test456',
    downloadUrl: 'https://im2prompt.com/download/test456',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    dashboardUrl: 'https://im2prompt.com/dashboard',
  }),
  'Your Video is Ready'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderGenerationFailedTemplate } = await import(
  './src/lib/email/templates/generation-failed-template.ts'
);
await sendTestEmail(
  'Generation Failed',
  renderGenerationFailedTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    generationType: 'image',
    model: 'flux-1.1-pro',
    prompt: 'Test image generation',
    failureDate: new Date().toISOString(),
    errorReason: 'Service temporarily unavailable',
    errorCategory: 'service',
    creditsRefunded: 5,
    retryUrl: 'https://im2prompt.com/retry/test123',
    supportUrl: 'https://im2prompt.com/support',
    dashboardUrl: 'https://im2prompt.com/dashboard',
  }),
  'Generation Failed - Credits Refunded'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderFeedbackTemplate } = await import('./src/lib/email/templates/feedback-template.ts');
await sendTestEmail(
  'Feedback Email',
  renderFeedbackTemplate({
    email: TEST_EMAIL,
    name: 'Jeff Lee',
    category: 'feature',
    subject: 'Request for new feature',
    message: 'It would be great to have a batch processing feature for multiple images at once.',
    priority: 'normal',
    userId: 'test-user-123',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: {
      page: '/image-to-prompt',
      referrer: 'https://google.com',
    },
  }),
  '[FEATURE] Request for new feature'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderNotificationTemplate } = await import(
  './src/lib/email/templates/notification-template.ts'
);
await sendTestEmail(
  'Notification Email',
  renderNotificationTemplate({
    userName: 'Jeff Lee',
    userEmail: TEST_EMAIL,
    userId: 'test-user-123',
    title: 'New Feature Available',
    message:
      'We have just released a new feature: Batch Image Processing. You can now process multiple images at once!',
    actionUrl: 'https://im2prompt.com/features/batch-processing',
    actionText: 'Try It Now',
    notificationType: 'announcement',
  }),
  'New Feature Available'
);

await new Promise((resolve) => setTimeout(resolve, 1000));

const { renderAlertTemplate } = await import('./src/lib/email/templates/alert-template.ts');
await sendTestEmail(
  'Alert Email',
  renderAlertTemplate({
    title: 'High API Usage Detected',
    message: 'Unusual API usage pattern detected for user test-user-123',
    alertType: 'usage',
    severity: 'high',
    timestamp: new Date().toISOString(),
    context: {
      userId: 'test-user-123',
      apiCalls: 1000,
      timeWindow: '5 minutes',
      threshold: 500,
    },
    actionUrl: 'https://im2prompt.com/admin/users/test-user-123',
    actionText: 'View User Details',
  }),
  '[USAGE] High API Usage Detected'
);

console.log('\n====================================');
console.log(`\n📊 Results: ${sent} sent, ${failed} failed`);
console.log(`✅ Success Rate: ${((sent / (sent + failed)) * 100).toFixed(1)}%\n`);

if (failed > 0) {
  console.log('❌ Some emails failed to send!');
  process.exit(1);
} else {
  console.log('🎉 All emails sent successfully!');
  console.log(`\n📬 Check ${TEST_EMAIL} for the test emails.`);
  console.log('\n💡 Total emails sent: 15');
  process.exit(0);
}
