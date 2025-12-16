import { env } from '@/env';

export const EMAIL_CONFIG = {
  provider: 'resend',
  defaultFrom: env.RESEND_FROM_EMAIL || 'noreply@im2prompt.com',
  adminEmails: env.ADMIN_EMAILS
    ? env.ADMIN_EMAILS.split(',')
        .map((email) => email.trim())
        .filter(Boolean)
    : [],
  monitoringBcc: 'jefflee2002@gmail.com',

  rateLimit: {
    maxPerMinute: 10,
    maxPerHour: 100,
  },

  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  },

  templates: {
    baseUrl: env.NEXT_PUBLIC_APP_URL,
    brandName: 'im2prompt',
    supportEmail: 'support@im2prompt.com',
  },

  bccCategories: ['feedback', 'subscription', 'bug', 'credits-exhausted'] as const,
} as const;

export const EMAIL_ROUTING = {
  feedback: EMAIL_CONFIG.adminEmails,
  support: EMAIL_CONFIG.adminEmails,
  alert: EMAIL_CONFIG.adminEmails,
  notification: [],
  welcome: [],
  subscription: [],
} as const;

export const PRIORITY_CONFIG = {
  low: { retryCount: 1, timeout: 30000 },
  normal: { retryCount: 2, timeout: 20000 },
  high: { retryCount: 3, timeout: 15000 },
  urgent: { retryCount: 5, timeout: 10000 },
} as const;
