import type { PaymentFailedParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderPaymentFailedTemplate(params: PaymentFailedParams): string {
  const urgencyLevel = params.retryAttempt >= 3 ? 'critical' : params.retryAttempt >= 2 ? 'high' : 'medium';
  const alertColor = urgencyLevel === 'critical' ? '#ef4444' : urgencyLevel === 'high' ? '#f59e0b' : '#f59e0b';
  
  const attemptText = params.retryAttempt === 1 ? '1st' : params.retryAttempt === 2 ? '2nd' : '3rd';
  const urgencyText = params.retryAttempt >= 3 
    ? 'Your subscription will be cancelled in 24 hours' 
    : `We'll retry in 3 days (Attempt ${params.retryAttempt} of ${params.maxRetries})`;

  const content = `
    <div style="background-color: ${alertColor}; color: white; padding: 16px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">⚠️ Payment Issue Detected</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p><strong>We couldn't process your payment for your ${escapeHtml(params.planName)} subscription.</strong></p>

    <div class="info-box">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Amount:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>$${params.attemptedAmount} ${escapeHtml(params.currency)}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Attempted:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.attemptDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Reason:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.failureReason)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">Payment Method:</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.paymentMethod)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">Attempt:</td>
          <td style="padding: 8px 0; text-align: right;"><strong style="color: ${alertColor};">${attemptText} of ${params.maxRetries}</strong></td>
        </tr>
      </table>
    </div>

    <div style="background-color: #fee2e2; padding: 16px; border-left: 4px solid ${alertColor}; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 600; color: #991b1b;">What This Means:</p>
      <p style="margin: 8px 0 0 0; color: #991b1b;">
        ${urgencyText}${params.retryAttempt >= 3 ? '.' : '. After 3 failed attempts, your subscription will be downgraded to the Free plan.'}
      </p>
    </div>

    <h3>Consequences if Not Resolved:</h3>
    <p style="margin: 8px 0;">⚠️ No new monthly credits will be granted</p>
    <p style="margin: 8px 0;">⚠️ Service will be downgraded to Free tier</p>
    <p style="margin: 8px 0;">⚠️ Premium features will be disabled</p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.updatePaymentUrl)}" class="button" style="font-size: 18px; padding: 16px 48px; background-color: ${alertColor};">
        Update Payment Method Now
      </a>
    </p>

    ${params.retryDate ? `
      <p style="text-align: center; color: #71717a; font-size: 14px;">
        Automatic retry scheduled for: <strong>${escapeHtml(params.retryDate)}</strong>
      </p>
    ` : ''}

    <p style="margin-top: 32px; font-size: 14px; color: #71717a;">
      If you believe this is an error or need assistance, please contact our support team immediately.
    </p>
  `;

  return renderBaseTemplate({
    title: 'Payment Failed - Action Required',
    preheader: `${attemptText} payment attempt failed for your ${params.planName} subscription`,
    content,
  });
}
