import { describe, it, expect } from '@jest/globals';
import {
  renderWelcomeTemplate,
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
  renderSubscriptionConfirmationTemplate,
  renderPaymentFailedTemplate,
  renderCreditsLowWarningTemplate,
  renderCreditsExhaustedTemplate,
  renderCreditsRefilledTemplate,
  renderGenerationCompleteTemplate,
  renderGenerationFailedTemplate,
  renderFeedbackTemplate,
  renderNotificationTemplate,
  renderAlertTemplate,
} from '../../src/lib/email/templates';

describe('Email Template Tests', () => {
  describe('Welcome Template', () => {
    it('should render welcome email with all required fields', () => {
      const html = renderWelcomeTemplate({
        userName: 'John Doe',
        userEmail: 'john@example.com',
        signupMethod: 'email',
        signupCredits: 15,
        dashboardUrl: 'https://im2prompt.com/dashboard',
        imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
        textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
      });

      expect(html).toContain('John Doe');
      expect(html).toContain('15 Credits');
      expect(html).toContain('Welcome to im2prompt');
      expect(html).toContain('https://im2prompt.com/dashboard');
      expect(html).not.toContain('<script');
    });

    it('should escape HTML in user names', () => {
      const html = renderWelcomeTemplate({
        userName: '<script>alert("xss")</script>',
        userEmail: 'test@example.com',
        signupMethod: 'google',
        signupCredits: 15,
        dashboardUrl: 'https://im2prompt.com/dashboard',
        imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
        textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
      });

      expect(html).not.toContain('<script>alert');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('Email Verification Template', () => {
    it('should render verification email with code', () => {
      const html = renderEmailVerificationTemplate({
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        verificationUrl: 'https://im2prompt.com/verify?token=abc123',
        verificationCode: '123456',
        expiresInMinutes: 60,
      });

      expect(html).toContain('Jane Smith');
      expect(html).toContain('123456');
      expect(html).toContain('60 minutes');
      expect(html).toContain('https://im2prompt.com/verify?token=abc123');
      expect(html).toContain('Verify Email Address');
    });

    it('should display expiration warning', () => {
      const html = renderEmailVerificationTemplate({
        userName: 'Test User',
        userEmail: 'test@example.com',
        verificationUrl: 'https://im2prompt.com/verify',
        verificationCode: '999888',
        expiresInMinutes: 30,
      });

      expect(html).toContain('30 minutes');
      expect(html).toMatch(/expires|expir/i);
    });
  });

  describe('Password Reset Template', () => {
    it('should render password reset with security details', () => {
      const html = renderPasswordResetTemplate({
        userName: 'Bob Johnson',
        userEmail: 'bob@example.com',
        resetUrl: 'https://im2prompt.com/reset?token=xyz789',
        expiresInMinutes: 30,
        requestIpAddress: '192.168.1.1',
        requestLocation: 'San Francisco, CA',
        requestTime: '2025-01-15 10:30:00 UTC',
      });

      expect(html).toContain('Bob Johnson');
      expect(html).toContain('192.168.1.1');
      expect(html).toContain('San Francisco, CA');
      expect(html).toContain('2025-01-15 10:30:00 UTC');
      expect(html).toContain('Reset Password');
      expect(html).toMatch(/security|Security/);
    });

    it('should show security warning', () => {
      const html = renderPasswordResetTemplate({
        userName: 'Test User',
        userEmail: 'test@example.com',
        resetUrl: 'https://im2prompt.com/reset',
        expiresInMinutes: 30,
        requestIpAddress: '1.2.3.4',
        requestTime: 'now',
      });

      expect(html).toMatch(/security.*warning/i);
      expect(html).toMatch(/didn't request/i);
    });
  });

  describe('Subscription Confirmation Template', () => {
    it('should render Pro subscription confirmation', () => {
      const html = renderSubscriptionConfirmationTemplate({
        userName: 'Alice Pro',
        userEmail: 'alice@example.com',
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
        features: ['Commercial license', 'No watermark', 'No ads'],
      });

      expect(html).toContain('Welcome to Pro!');
      expect(html).toContain('500 credits');
      expect(html).toContain('300 image-to-prompt');
      expect(html).toContain('Commercial license');
      expect(html).toContain('$14.9/monthly');
    });

    it('should show yearly savings message', () => {
      const html = renderSubscriptionConfirmationTemplate({
        userName: 'Yearly User',
        userEmail: 'yearly@example.com',
        planName: 'Pro+',
        billingInterval: 'yearly',
        planPrice: 239,
        currency: 'USD',
        monthlyCredits: 900,
        extractions: 600,
        startDate: '2025-01-15',
        nextBillingDate: '2026-01-15',
        invoiceUrl: 'https://im2prompt.com/invoice/456',
        dashboardUrl: 'https://im2prompt.com/dashboard',
        features: ['Everything in Pro', 'Priority support'],
      });

      expect(html).toContain('You saved 20%');
      expect(html).toContain('900 credits');
    });
  });

  describe('Payment Failed Template', () => {
    it('should render first payment failure attempt', () => {
      const html = renderPaymentFailedTemplate({
        userName: 'Payment User',
        userEmail: 'payment@example.com',
        planName: 'Pro',
        attemptedAmount: 14.9,
        currency: 'USD',
        attemptDate: '2025-01-15',
        failureReason: 'Card declined',
        paymentMethod: 'Visa •••• 4242',
        retryDate: '2025-01-18',
        updatePaymentUrl: 'https://im2prompt.com/billing/update',
        retryAttempt: 1,
        maxRetries: 3,
      });

      expect(html).toContain('Payment Issue');
      expect(html).toContain('Card declined');
      expect(html).toContain('1st of 3');
      expect(html).toContain('retry in 3 days');
    });

    it('should show critical alert for final attempt', () => {
      const html = renderPaymentFailedTemplate({
        userName: 'Final User',
        userEmail: 'final@example.com',
        planName: 'Pro+',
        attemptedAmount: 24.9,
        currency: 'USD',
        attemptDate: '2025-01-20',
        failureReason: 'Insufficient funds',
        paymentMethod: 'Mastercard •••• 1234',
        updatePaymentUrl: 'https://im2prompt.com/billing/update',
        retryAttempt: 3,
        maxRetries: 3,
      });

      expect(html).toContain('3rd of 3');
      expect(html).toMatch(/subscription will be cancelled|cancel.*24 hours/i);
      expect(html).toContain('#ef4444');
    });
  });

  describe('Credits Low Warning Template', () => {
    it('should render 20% warning for Free users', () => {
      const html = renderCreditsLowWarningTemplate({
        userName: 'Low Credit User',
        userEmail: 'low@example.com',
        currentBalance: 6,
        warningThreshold: 20,
        percentageRemaining: 20,
        planName: 'Free',
        monthlyAllocation: 15,
        upgradeUrl: 'https://im2prompt.com/upgrade',
        usageRate: 2.5,
        estimatedRunoutDays: 2,
      });

      expect(html).toContain('20% Remaining');
      expect(html).toContain('6');
      expect(html).toContain('Upgrade to');
      expect(html).toContain('~2 days');
    });

    it('should render 5% critical warning', () => {
      const html = renderCreditsLowWarningTemplate({
        userName: 'Critical User',
        userEmail: 'critical@example.com',
        currentBalance: 2,
        warningThreshold: 5,
        percentageRemaining: 5,
        planName: 'Pro',
        monthlyAllocation: 500,
        nextRefillDate: '2025-02-01',
        daysUntilRefill: 10,
        upgradeUrl: 'https://im2prompt.com/upgrade',
        usageRate: 15,
        estimatedRunoutDays: 0,
      });

      expect(html).toContain('5% Remaining');
      expect(html).toContain('#ef4444');
      expect(html).toMatch(/critical|almost/i);
    });
  });

  describe('Credits Exhausted Template', () => {
    it('should render exhausted credits for Free users', () => {
      const html = renderCreditsExhaustedTemplate({
        userName: 'Exhausted User',
        userEmail: 'exhausted@example.com',
        planName: 'Free',
        exhaustionDate: '2025-01-15',
        totalCreditsUsedThisCycle: 15,
        upgradeUrl: 'https://im2prompt.com/upgrade',
      });

      expect(html).toContain('0');
      expect(html).toContain('15 credits');
      expect(html).toContain('Upgrade');
      expect(html).toContain('Pro Plan');
      expect(html).toContain('Pro+ Plan');
    });

    it('should show refill date for paid users', () => {
      const html = renderCreditsExhaustedTemplate({
        userName: 'Pro User',
        userEmail: 'pro@example.com',
        planName: 'Pro',
        exhaustionDate: '2025-01-15',
        totalCreditsUsedThisCycle: 500,
        nextRefillDate: '2025-02-01',
        nextRefillAmount: 500,
        daysUntilRefill: 15,
        upgradeUrl: 'https://im2prompt.com/upgrade',
      });

      expect(html).toContain('15 days');
      expect(html).toContain('2025-02-01');
      expect(html).toContain('500');
      expect(html).toMatch(/refill/i);
    });
  });

  describe('Credits Refilled Template', () => {
    it('should render refill celebration', () => {
      const html = renderCreditsRefilledTemplate({
        userName: 'Refill User',
        userEmail: 'refill@example.com',
        planName: 'Pro',
        creditsGranted: 500,
        newBalance: 550,
        refillDate: '2025-02-01',
        nextRefillDate: '2025-03-01',
        lastMonthUsage: 450,
        dashboardUrl: 'https://im2prompt.com/dashboard',
      });

      expect(html).toContain('+500');
      expect(html).toContain('550');
      expect(html).toContain('450');
      expect(html).toMatch(/refilled|celebration|great news/i);
      expect(html).toContain('🎉');
    });
  });

  describe('Generation Complete Template', () => {
    it('should render completed image generation', () => {
      const html = renderGenerationCompleteTemplate({
        userName: 'Artist',
        userEmail: 'artist@example.com',
        generationType: 'image',
        model: 'flux-1.1',
        prompt: 'A beautiful sunset over mountains',
        completionDate: '2025-01-15 14:30:00',
        processingTime: '45 seconds',
        creditsUsed: 5,
        viewUrl: 'https://im2prompt.com/view/123',
        downloadUrl: 'https://im2prompt.com/download/123',
        thumbnailUrl: 'https://im2prompt.com/thumb/123.jpg',
        dashboardUrl: 'https://im2prompt.com/dashboard',
      });

      expect(html).toContain('🎨');
      expect(html).toContain('Image is Ready');
      expect(html).toContain('flux-1.1');
      expect(html).toContain('45 seconds');
      expect(html).toContain('5');
      expect(html).toContain('beautiful sunset');
    });

    it('should render completed video generation', () => {
      const html = renderGenerationCompleteTemplate({
        userName: 'Filmmaker',
        userEmail: 'film@example.com',
        generationType: 'video',
        model: 'sora-2',
        prompt: 'A cat playing piano',
        completionDate: '2025-01-15 15:00:00',
        processingTime: '5 minutes',
        creditsUsed: 15,
        viewUrl: 'https://im2prompt.com/view/456',
        downloadUrl: 'https://im2prompt.com/download/456',
        thumbnailUrl: 'https://im2prompt.com/thumb/456.jpg',
        dashboardUrl: 'https://im2prompt.com/dashboard',
      });

      expect(html).toContain('🎬');
      expect(html).toContain('Video is Ready');
      expect(html).toContain('sora-2');
      expect(html).toContain('15');
    });
  });

  describe('Generation Failed Template', () => {
    it('should render failed generation with refund', () => {
      const html = renderGenerationFailedTemplate({
        userName: 'Failed User',
        userEmail: 'failed@example.com',
        generationType: 'image',
        model: 'flux-1.1',
        prompt: 'Test prompt',
        failureDate: '2025-01-15',
        failureReason: 'API timeout',
        creditsRefunded: 5,
        newBalance: 100,
        retryUrl: 'https://im2prompt.com/retry/123',
        supportUrl: 'https://im2prompt.com/support',
      });

      expect(html).toContain('Generation Failed');
      expect(html).toContain('API timeout');
      expect(html).toContain('5 credits');
      expect(html).toContain('100 credits');
      expect(html).toContain('Try Again');
      expect(html).toMatch(/refund/i);
    });

    it('should show content policy warning', () => {
      const html = renderGenerationFailedTemplate({
        userName: 'Policy User',
        userEmail: 'policy@example.com',
        generationType: 'video',
        model: 'sora-2',
        prompt: 'Inappropriate content',
        failureDate: '2025-01-15',
        failureReason: 'Content policy violation',
        creditsRefunded: 15,
        newBalance: 85,
        retryUrl: 'https://im2prompt.com/retry/789',
        supportUrl: 'https://im2prompt.com/support',
      });

      expect(html).toMatch(/content policy/i);
      expect(html).toContain('#f59e0b');
    });
  });

  describe('Security & XSS Prevention', () => {
    it('should escape all user inputs in all templates', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const xssUrl = 'javascript:alert("xss")';

      const templates = [
        renderWelcomeTemplate({
          userName: maliciousInput,
          userEmail: 'test@example.com',
          signupMethod: 'email',
          signupCredits: 15,
          dashboardUrl: 'https://safe.com',
          imageToPromptUrl: 'https://safe.com',
          textToPromptUrl: 'https://safe.com',
        }),
        renderEmailVerificationTemplate({
          userName: maliciousInput,
          userEmail: 'test@example.com',
          verificationUrl: 'https://safe.com',
          verificationCode: '123456',
          expiresInMinutes: 60,
        }),
        renderFeedbackTemplate({
          name: maliciousInput,
          email: 'test@example.com',
          subject: maliciousInput,
          category: 'bug',
          priority: 'normal',
          message: maliciousInput,
        }),
      ];

      templates.forEach((html) => {
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('javascript:');
        expect(html).toContain('&lt;script&gt;');
      });
    });
  });

  describe('Email Structure Validation', () => {
    it('should have valid HTML structure in all templates', () => {
      const templates = [
        renderWelcomeTemplate({
          userName: 'Test',
          userEmail: 'test@example.com',
          signupMethod: 'email',
          signupCredits: 15,
          dashboardUrl: 'https://test.com',
          imageToPromptUrl: 'https://test.com',
          textToPromptUrl: 'https://test.com',
        }),
        renderSubscriptionConfirmationTemplate({
          userName: 'Test',
          userEmail: 'test@example.com',
          planName: 'Pro',
          billingInterval: 'monthly',
          planPrice: 14.9,
          currency: 'USD',
          monthlyCredits: 500,
          extractions: 300,
          startDate: '2025-01-15',
          nextBillingDate: '2025-02-15',
          invoiceUrl: 'https://test.com',
          dashboardUrl: 'https://test.com',
          features: ['Feature 1'],
        }),
      ];

      templates.forEach((html) => {
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<html');
        expect(html).toContain('</html>');
        expect(html).toContain('<head>');
        expect(html).toContain('</head>');
        expect(html).toContain('<body>');
        expect(html).toContain('</body>');
        expect(html).toContain('im2prompt');
      });
    });
  });
});
