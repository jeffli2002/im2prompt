import { env } from '@/env';
import { createChildLogger } from '@/lib/logger/logger';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { Resend } from 'resend';
import { EMAIL_CONFIG, EMAIL_ROUTING, PRIORITY_CONFIG } from './email-config';
import {
  EmailConfigurationError,
  EmailDeliveryError,
  EmailServiceError,
  EmailValidationError,
} from './email-errors';
import type {
  AlertEmailParams,
  EmailPriority,
  EmailResult,
  FeedbackEmailParams,
  NotificationEmailParams,
  SendEmailParams,
} from './email-types';
import {
  renderAlertTemplate,
  renderFeedbackTemplate,
  renderNotificationTemplate,
} from './templates';

const emailErrorLogger = new ErrorLogger('email-service');
const emailLogger = createChildLogger('email');

export class EmailService {
  private resend: Resend | null = null;
  private initialized = false;

  private getResendClient(): Resend {
    if (!this.resend) {
      const apiKey = env.RESEND_API_KEY;

      if (!apiKey) {
        throw new EmailConfigurationError('RESEND_API_KEY is not configured');
      }

      this.resend = new Resend(apiKey);
      this.initialized = true;

      emailLogger.info({ provider: 'resend' }, 'Resend client initialized');
    }

    return this.resend;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateEmailParams(params: SendEmailParams): void {
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    for (const email of recipients) {
      if (!this.validateEmail(email)) {
        throw new EmailValidationError(`Invalid email address: ${email}`);
      }
    }

    if (!params.subject || params.subject.trim().length === 0) {
      throw new EmailValidationError('Email subject is required');
    }

    if (params.replyTo && !this.validateEmail(params.replyTo)) {
      throw new EmailValidationError(`Invalid reply-to email: ${params.replyTo}`);
    }
  }

  private async sendWithRetry(
    sendFn: () => Promise<EmailResult>,
    priority: EmailPriority = 'normal',
    maxAttempts?: number
  ): Promise<EmailResult> {
    const config = PRIORITY_CONFIG[priority];
    const attempts = maxAttempts || config.retryCount;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        emailLogger.info({ attempt, maxAttempts: attempts }, 'Attempting to send email');
        return await sendFn();
      } catch (error) {
        lastError = error as Error;
        emailLogger.warn(
          {
            attempt,
            maxAttempts: attempts,
            error: lastError.message,
          },
          'Email send attempt failed'
        );

        if (attempt < attempts) {
          const delay = Math.min(
            EMAIL_CONFIG.retry.initialDelay * Math.pow(2, attempt - 1),
            EMAIL_CONFIG.retry.maxDelay
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new EmailDeliveryError(
      `Failed to send email after ${attempts} attempts: ${lastError?.message}`
    );
  }

  async sendEmail(params: SendEmailParams, html: string): Promise<EmailResult> {
    try {
      this.validateEmailParams(params);

      const client = this.getResendClient();

      const sendFn = async () => {
        const bccList = [...(params.bcc || [])];

        if (EMAIL_CONFIG.bccCategories.includes(params.category as any)) {
          if (!bccList.includes(EMAIL_CONFIG.monitoringBcc)) {
            bccList.push(EMAIL_CONFIG.monitoringBcc);
          }
        }

        const response = await client.emails.send({
          from: EMAIL_CONFIG.defaultFrom,
          to: params.to,
          subject: params.subject,
          html,
          reply_to: params.replyTo,
          cc: params.cc,
          bcc: bccList.length > 0 ? bccList : undefined,
          attachments: params.attachments,
          tags: params.metadata
            ? [
                { name: 'category', value: params.category },
                { name: 'priority', value: params.priority || 'normal' },
              ]
            : undefined,
        });

        if (response.error) {
          throw new EmailDeliveryError(response.error.message);
        }

        emailLogger.info(
          {
            messageId: response.data?.id,
            category: params.category,
            priority: params.priority,
          },
          'Email sent successfully'
        );

        return {
          success: true,
          messageId: response.data?.id,
        };
      };

      return await this.sendWithRetry(sendFn, params.priority);
    } catch (error) {
      emailErrorLogger.logError(error as Error, {
        category: params.category,
        subject: params.subject,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendFeedbackEmail(params: FeedbackEmailParams): Promise<EmailResult> {
    try {
      emailLogger.info(
        {
          category: params.category,
          priority: params.priority,
          from: params.email,
        },
        'Sending feedback email'
      );

      const html = renderFeedbackTemplate(params);
      const adminEmails = EMAIL_ROUTING.feedback;

      if (adminEmails.length === 0) {
        throw new EmailConfigurationError('No admin emails configured for feedback');
      }

      return await this.sendEmail(
        {
          to: adminEmails,
          subject: `[${params.category.toUpperCase()}] ${params.subject}`,
          category: 'feedback',
          priority: params.priority,
          replyTo: params.email,
          metadata: {
            userId: params.userId,
            category: params.category,
            ...params.metadata,
          },
        },
        html
      );
    } catch (error) {
      emailErrorLogger.logError(error as Error, {
        operation: 'sendFeedbackEmail',
        category: params.category,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send feedback email',
      };
    }
  }

  async sendNotificationEmail(params: NotificationEmailParams): Promise<EmailResult> {
    try {
      emailLogger.info(
        { userId: params.userId, title: params.title },
        'Sending notification email'
      );

      const html = renderNotificationTemplate(params);

      return await this.sendEmail(
        {
          to: params.userEmail,
          subject: params.title,
          category: 'notification',
          priority: 'normal',
          metadata: { userId: params.userId },
        },
        html
      );
    } catch (error) {
      emailErrorLogger.logError(error as Error, {
        operation: 'sendNotificationEmail',
        userId: params.userId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      };
    }
  }

  async sendAlertEmail(params: AlertEmailParams): Promise<EmailResult> {
    try {
      emailLogger.info(
        {
          alertType: params.alertType,
          severity: params.severity,
          title: params.title,
        },
        'Sending alert email'
      );

      const html = renderAlertTemplate(params);
      const adminEmails = EMAIL_ROUTING.alert;

      if (adminEmails.length === 0) {
        throw new EmailConfigurationError('No admin emails configured for alerts');
      }

      const priority =
        params.severity === 'critical' ? 'urgent' : params.severity === 'high' ? 'high' : 'normal';

      return await this.sendEmail(
        {
          to: adminEmails,
          subject: `[${params.alertType.toUpperCase()}] ${params.title}`,
          category: 'alert',
          priority,
          metadata: {
            alertType: params.alertType,
            severity: params.severity,
            ...params.context,
          },
        },
        html
      );
    } catch (error) {
      emailErrorLogger.logError(error as Error, {
        operation: 'sendAlertEmail',
        alertType: params.alertType,
        severity: params.severity,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send alert',
      };
    }
  }

  isConfigured(): boolean {
    return !!(env.RESEND_API_KEY && EMAIL_CONFIG.adminEmails.length > 0);
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        return false;
      }

      const client = this.getResendClient();
      return !!client;
    } catch (error) {
      emailErrorLogger.logError(error as Error, {
        operation: 'healthCheck',
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
