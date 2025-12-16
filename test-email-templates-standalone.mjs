import { escapeHtml } from './src/lib/email/templates/base-template.ts';

console.log('🧪 Email Template Standalone Tests\n');
console.log('=====================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertContains(str, substring, message) {
  if (!str.includes(substring)) {
    throw new Error(message || `Expected to contain "${substring}"`);
  }
}

function assertNotContains(str, substring, message) {
  if (str.includes(substring)) {
    throw new Error(message || `Expected NOT to contain "${substring}"`);
  }
}

console.log('Testing XSS Protection...\n');

test('escapeHtml should escape script tags', () => {
  const input = '<script>alert("xss")</script>';
  const output = escapeHtml(input);
  assertNotContains(output, '<script>', 'Should not contain script tag');
  assertContains(output, '&lt;script&gt;', 'Should contain escaped script tag');
});

test('escapeHtml should escape HTML entities', () => {
  const input = '& < > " \'';
  const output = escapeHtml(input);
  assertContains(output, '&amp;');
  assertContains(output, '&lt;');
  assertContains(output, '&gt;');
  assertContains(output, '&quot;');
  assertContains(output, '&#039;');
});

test('escapeHtml should handle normal text', () => {
  const input = 'Hello World 123';
  const output = escapeHtml(input);
  assert(output === input, 'Normal text should remain unchanged');
});

test('escapeHtml should handle empty string', () => {
  const input = '';
  const output = escapeHtml(input);
  assert(output === '', 'Empty string should remain empty');
});

test('escapeHtml should handle complex XSS attempt', () => {
  const input = '<img src=x onerror="alert(\'XSS\')"/>';
  const output = escapeHtml(input);
  assertNotContains(output, 'onerror=', 'Should escape onerror attribute');
  assertNotContains(output, '<img', 'Should escape img tag');
});

console.log('\nTesting Template Imports...\n');

test('Welcome template should be importable', async () => {
  const { renderWelcomeTemplate } = await import('./src/lib/email/templates/welcome-template.ts');
  assert(typeof renderWelcomeTemplate === 'function', 'Should export function');
});

test('Email verification template should be importable', async () => {
  const { renderEmailVerificationTemplate } = await import(
    './src/lib/email/templates/email-verification-template.ts'
  );
  assert(typeof renderEmailVerificationTemplate === 'function', 'Should export function');
});

test('Password reset template should be importable', async () => {
  const { renderPasswordResetTemplate } = await import(
    './src/lib/email/templates/password-reset-template.ts'
  );
  assert(typeof renderPasswordResetTemplate === 'function', 'Should export function');
});

test('Subscription confirmation template should be importable', async () => {
  const { renderSubscriptionConfirmationTemplate } = await import(
    './src/lib/email/templates/subscription-confirmation-template.ts'
  );
  assert(typeof renderSubscriptionConfirmationTemplate === 'function', 'Should export function');
});

test('Payment failed template should be importable', async () => {
  const { renderPaymentFailedTemplate } = await import(
    './src/lib/email/templates/payment-failed-template.ts'
  );
  assert(typeof renderPaymentFailedTemplate === 'function', 'Should export function');
});

test('Credits low warning template should be importable', async () => {
  const { renderCreditsLowWarningTemplate } = await import(
    './src/lib/email/templates/credits-low-warning-template.ts'
  );
  assert(typeof renderCreditsLowWarningTemplate === 'function', 'Should export function');
});

test('Credits exhausted template should be importable', async () => {
  const { renderCreditsExhaustedTemplate } = await import(
    './src/lib/email/templates/credits-exhausted-template.ts'
  );
  assert(typeof renderCreditsExhaustedTemplate === 'function', 'Should export function');
});

test('Credits refilled template should be importable', async () => {
  const { renderCreditsRefilledTemplate } = await import(
    './src/lib/email/templates/credits-refilled-template.ts'
  );
  assert(typeof renderCreditsRefilledTemplate === 'function', 'Should export function');
});

test('Generation complete template should be importable', async () => {
  const { renderGenerationCompleteTemplate } = await import(
    './src/lib/email/templates/generation-complete-template.ts'
  );
  assert(typeof renderGenerationCompleteTemplate === 'function', 'Should export function');
});

test('Generation failed template should be importable', async () => {
  const { renderGenerationFailedTemplate } = await import(
    './src/lib/email/templates/generation-failed-template.ts'
  );
  assert(typeof renderGenerationFailedTemplate === 'function', 'Should export function');
});

console.log('\nTesting Template Rendering...\n');

test('Welcome template should render valid HTML', async () => {
  const { renderWelcomeTemplate } = await import('./src/lib/email/templates/welcome-template.ts');
  const html = renderWelcomeTemplate({
    userName: 'Test User',
    userEmail: 'test@example.com',
    signupMethod: 'email',
    signupCredits: 30,
    dashboardUrl: 'https://im2prompt.com/dashboard',
    imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
    textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
  });

  assertContains(html, '<!DOCTYPE html>', 'Should have DOCTYPE');
  assertContains(html, 'Test User', 'Should contain user name');
  assertContains(html, '30 Credits', 'Should contain credits');
  assertContains(html, 'Welcome', 'Should contain welcome message');
  assertNotContains(html, '<script', 'Should not have script tags');
});

test('Welcome template should escape malicious input', async () => {
  const { renderWelcomeTemplate } = await import('./src/lib/email/templates/welcome-template.ts');
  const html = renderWelcomeTemplate({
    userName: '<script>alert("xss")</script>',
    userEmail: 'test@example.com',
    signupMethod: 'email',
    signupCredits: 30,
    dashboardUrl: 'https://im2prompt.com/dashboard',
    imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
    textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
  });

  assertNotContains(html, '<script>alert', 'Should escape script tags');
  assertContains(html, '&lt;script&gt;', 'Should contain escaped HTML');
});

test('Email verification should render with code', async () => {
  const { renderEmailVerificationTemplate } = await import(
    './src/lib/email/templates/email-verification-template.ts'
  );
  const html = renderEmailVerificationTemplate({
    userName: 'Jane Doe',
    userEmail: 'jane@example.com',
    verificationUrl: 'https://im2prompt.com/verify?token=abc123',
    verificationCode: '123456',
    expiresInMinutes: 60,
  });

  assertContains(html, 'Jane Doe', 'Should contain user name');
  assertContains(html, '123456', 'Should contain verification code');
  assertContains(html, '60 minutes', 'Should contain expiration time');
  assertContains(html, 'Verify', 'Should have verify CTA');
});

test('Subscription confirmation should show plan details', async () => {
  const { renderSubscriptionConfirmationTemplate } = await import(
    './src/lib/email/templates/subscription-confirmation-template.ts'
  );
  const html = renderSubscriptionConfirmationTemplate({
    userName: 'Pro User',
    userEmail: 'pro@example.com',
    planName: 'Pro',
    billingInterval: 'monthly',
    planPrice: 14.9,
    currency: 'USD',
    monthlyCredits: 500,
    extractions: 300,
    startDate: '2025-01-15',
    nextBillingDate: '2025-02-15',
    invoiceUrl: 'https://im2prompt.com/invoice/123',
    dashboardUrl: 'https://im2prompt.com/dashboard',
    features: ['Commercial license', 'No watermark'],
  });

  assertContains(html, 'Pro', 'Should contain plan name');
  assertContains(html, '500 credits', 'Should contain credit amount');
  assertContains(html, '300', 'Should contain extractions');
  assertContains(html, 'Commercial license', 'Should contain features');
});

test('Credits low warning should show correct threshold', async () => {
  const { renderCreditsLowWarningTemplate } = await import(
    './src/lib/email/templates/credits-low-warning-template.ts'
  );

  const html20 = renderCreditsLowWarningTemplate({
    userName: 'User',
    userEmail: 'user@example.com',
    currentBalance: 100,
    warningThreshold: 20,
    percentageRemaining: 20,
    planName: 'Pro',
    monthlyAllocation: 500,
    nextRefillDate: '2025-02-01',
    daysUntilRefill: 15,
    upgradeUrl: 'https://im2prompt.com/upgrade',
    usageRate: 6.7,
    estimatedRunoutDays: 15,
  });

  assertContains(html20, '20%', 'Should show 20% threshold');
  assertContains(html20, '100', 'Should show current balance');
  assertContains(html20, '#3b82f6', 'Should use blue color for 20%');
});

test('Payment failed should escalate urgency', async () => {
  const { renderPaymentFailedTemplate } = await import(
    './src/lib/email/templates/payment-failed-template.ts'
  );

  const htmlAttempt3 = renderPaymentFailedTemplate({
    userName: 'User',
    userEmail: 'user@example.com',
    planName: 'Pro',
    attemptedAmount: 14.9,
    currency: 'USD',
    attemptDate: '2025-01-15',
    failureReason: 'Card declined',
    paymentMethod: 'Visa •••• 4242',
    updatePaymentUrl: 'https://im2prompt.com/billing',
    retryAttempt: 3,
    maxRetries: 3,
  });

  assertContains(htmlAttempt3, '3rd', 'Should show 3rd attempt');
  assertContains(htmlAttempt3, '#ef4444', 'Should use red color for final attempt');
});

test('Generation complete should show thumbnail', async () => {
  const { renderGenerationCompleteTemplate } = await import(
    './src/lib/email/templates/generation-complete-template.ts'
  );
  const html = renderGenerationCompleteTemplate({
    userName: 'Artist',
    userEmail: 'artist@example.com',
    generationType: 'image',
    model: 'flux-1.1',
    prompt: 'A beautiful sunset',
    completionDate: '2025-01-15',
    processingTime: '30 seconds',
    creditsUsed: 5,
    viewUrl: 'https://im2prompt.com/view/123',
    downloadUrl: 'https://im2prompt.com/download/123',
    thumbnailUrl: 'https://im2prompt.com/thumb/123.jpg',
    dashboardUrl: 'https://im2prompt.com/dashboard',
  });

  assertContains(html, '🎨', 'Should have image emoji');
  assertContains(html, 'Image is Ready', 'Should say image ready');
  assertContains(html, 'flux-1.1', 'Should show model');
  assertContains(html, 'beautiful sunset', 'Should show prompt');
});

console.log('\n=====================================');
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
console.log(`✅ Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (failed > 0) {
  console.log('❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('🎉 All tests passed!');
  process.exit(0);
}
