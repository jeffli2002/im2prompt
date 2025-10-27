import { env } from '@/env';

export interface LogContext {
  userId?: string;
  subscriptionId?: string;
  paymentId?: string;
  eventType?: string;
  error?: Error | unknown;
  metadata?: Record<string, any>;
  metric?: string;
  value?: number;
  tags?: Record<string, string>;
  [key: string]: unknown;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

class ProductionLogger {
  private isProduction = env.NODE_ENV === 'production';
  private appUrl = env.NEXT_PUBLIC_APP_URL || '';

  error(message: string, context: LogContext = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      level: LogLevel.ERROR,
      message,
      timestamp,
      ...context,
      error:
        context.error instanceof Error
          ? {
              message: context.error.message,
              stack: context.error.stack,
            }
          : context.error,
    };

    console.error(`[ERROR] ${message}`, logData);

    if (this.isProduction && this.shouldAlert(LogLevel.ERROR)) {
      this.sendAlert(message, logData).catch((err) => {
        console.error('Failed to send error alert:', err);
      });
    }
  }

  warn(message: string, context: LogContext = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      level: LogLevel.WARN,
      message,
      timestamp,
      ...context,
    };

    console.warn(`[WARN] ${message}`, logData);

    if (this.isProduction && this.shouldAlert(LogLevel.WARN)) {
      this.sendAlert(message, logData).catch((err) => {
        console.error('Failed to send warning alert:', err);
      });
    }
  }

  info(message: string, context: LogContext = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      level: LogLevel.INFO,
      message,
      timestamp,
      ...context,
    };

    console.log(`[INFO] ${message}`, logData);
  }

  debug(message: string, context: LogContext = {}) {
    if (!this.isProduction) {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${message}`, { timestamp, ...context });
    }
  }

  metric(name: string, value: number, tags: Record<string, string> = {}) {
    this.info(`[METRIC] ${name}`, {
      metric: name,
      value,
      tags,
    });

    if (this.isProduction) {
      // TODO: Send to metrics service (Datadog, CloudWatch, etc.)
    }
  }

  private shouldAlert(level: LogLevel): boolean {
    return level === LogLevel.ERROR;
  }

  private async sendAlert(message: string, context: any) {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;

    if (!slackWebhook) {
      return;
    }

    try {
      const emoji = context.level === LogLevel.ERROR ? '🚨' : '⚠️';
      const color = context.level === LogLevel.ERROR ? 'danger' : 'warning';

      const fields: any[] = [
        {
          title: 'Environment',
          value: this.isProduction ? 'Production' : 'Development',
          short: true,
        },
        { title: 'App URL', value: this.appUrl, short: true },
        { title: 'Timestamp', value: context.timestamp, short: true },
      ];

      if (context.userId) {
        fields.push({ title: 'User ID', value: context.userId, short: true });
      }

      if (context.subscriptionId) {
        fields.push({ title: 'Subscription ID', value: context.subscriptionId, short: true });
      }

      if (context.eventType) {
        fields.push({ title: 'Event Type', value: context.eventType, short: true });
      }

      if (context.error) {
        fields.push({
          title: 'Error Details',
          value: `\`\`\`${JSON.stringify(context.error, null, 2).slice(0, 500)}\`\`\``,
          short: false,
        });
      }

      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} ${context.level.toUpperCase()}: ${message}`,
          attachments: [
            {
              color,
              fields,
              footer: 'Payment System Monitor',
              ts: Math.floor(Date.now() / 1000).toString(),
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

export const logger = new ProductionLogger();
