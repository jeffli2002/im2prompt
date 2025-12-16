export type EmailCategory =
  | 'feedback'
  | 'support'
  | 'notification'
  | 'alert'
  | 'welcome'
  | 'subscription'
  | 'auth'
  | 'credits'
  | 'credits-exhausted'
  | 'content'
  | 'billing'
  | 'bug';

export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  category: EmailCategory;
  priority?: EmailPriority;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  metadata?: Record<string, unknown>;
}

export interface FeedbackEmailParams {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: EmailPriority;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationEmailParams {
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AlertEmailParams {
  alertType: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface WelcomeEmailParams {
  userName: string;
  userEmail: string;
  signupMethod: 'email' | 'github' | 'google';
  signupCredits: number;
  dashboardUrl: string;
  imageToPromptUrl: string;
  textToPromptUrl: string;
}

export interface EmailVerificationParams {
  userName: string;
  userEmail: string;
  verificationUrl: string;
  verificationCode: string;
  expiresInMinutes: number;
}

export interface PasswordResetParams {
  userName: string;
  userEmail: string;
  resetUrl: string;
  expiresInMinutes: number;
  requestIpAddress: string;
  requestLocation?: string;
  requestTime: string;
}

export interface SubscriptionConfirmationParams {
  userName: string;
  userEmail: string;
  planName: 'Pro' | 'Pro+';
  billingInterval: 'monthly' | 'yearly';
  planPrice: number;
  currency: string;
  monthlyCredits: number;
  extractions: number;
  startDate: string;
  nextBillingDate: string;
  invoiceUrl: string;
  dashboardUrl: string;
  features: string[];
}

export interface PaymentFailedParams {
  userName: string;
  userEmail: string;
  planName: string;
  attemptedAmount: number;
  currency: string;
  attemptDate: string;
  failureReason: string;
  paymentMethod: string;
  retryDate?: string;
  updatePaymentUrl: string;
  retryAttempt: number;
  maxRetries: number;
}

export interface CreditsLowWarningParams {
  userName: string;
  userEmail: string;
  currentBalance: number;
  warningThreshold: number;
  percentageRemaining: number;
  planName: string;
  monthlyAllocation: number;
  nextRefillDate?: string;
  daysUntilRefill?: number;
  upgradeUrl: string;
  usageRate: number;
  estimatedRunoutDays: number;
}

export interface CreditsExhaustedParams {
  userName: string;
  userEmail: string;
  planName: string;
  exhaustionDate: string;
  totalCreditsUsedThisCycle: number;
  nextRefillDate?: string;
  nextRefillAmount?: number;
  daysUntilRefill?: number;
  upgradeUrl: string;
}

export interface CreditsRefilledParams {
  userName: string;
  userEmail: string;
  planName: string;
  creditsGranted: number;
  newBalance: number;
  refillDate: string;
  nextRefillDate: string;
  lastMonthUsage: number;
  dashboardUrl: string;
}

export interface GenerationCompleteParams {
  userName: string;
  userEmail: string;
  generationType: 'image' | 'video';
  model: string;
  prompt: string;
  completionDate: string;
  processingTime: string;
  creditsUsed: number;
  viewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  dashboardUrl: string;
}

export interface GenerationFailedParams {
  userName: string;
  userEmail: string;
  generationType: 'image' | 'video';
  model: string;
  prompt: string;
  failureDate: string;
  failureReason: string;
  creditsRefunded: number;
  newBalance: number;
  retryUrl: string;
  supportUrl: string;
}
