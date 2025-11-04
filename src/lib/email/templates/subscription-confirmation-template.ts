import type { SubscriptionConfirmationParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderSubscriptionConfirmationTemplate(params: SubscriptionConfirmationParams): string {
  const isYearly = params.billingInterval === 'yearly';
  const savingsText = isYearly ? ' (You saved 20%!)' : '';
  
  const content = `
    <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">Welcome to ${escapeHtml(params.planName)}!${savingsText}</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Thank you for upgrading! Your subscription is now active and you have access to all premium features.</p>

    <div class="info-box">
      <h3 style="margin: 0 0 16px 0;">Subscription Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.planName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Billing:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">$${params.planPrice}/${params.billingInterval}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Started:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.startDate)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Next billing:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(params.nextBillingDate)}</td>
        </tr>
      </table>
    </div>

    <h3>What You Get:</h3>
    <div style="margin: 16px 0;">
      <p style="margin: 8px 0;">✓ <strong>${params.monthlyCredits} credits per month</strong></p>
      <p style="margin: 8px 0;">✓ <strong>${params.extractions} image-to-prompt extractions/month</strong></p>
      ${params.features.map(feature => `<p style="margin: 8px 0;">✓ ${escapeHtml(feature)}</p>`).join('')}
    </div>

    <div style="background-color: #dbeafe; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <p style="margin: 0; color: #1e40af;">
        <strong>🎉 Your credits are ready!</strong> Your ${params.monthlyCredits} monthly credits have been added to your account.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.dashboardUrl)}" class="button" style="font-size: 18px; padding: 16px 32px; margin: 8px;">
        Start Creating
      </a>
      <a href="${escapeHtml(params.invoiceUrl)}" style="display: inline-block; padding: 16px 32px; margin: 8px; color: #18181b; text-decoration: none; border: 2px solid #18181b; border-radius: 6px;">
        View Invoice
      </a>
    </div>

    <p style="margin-top: 32px; font-size: 14px; color: #71717a;">
      You can manage your subscription, update payment methods, or view invoices anytime from your account settings.
    </p>
  `;

  return renderBaseTemplate({
    title: `Welcome to ${params.planName}!`,
    preheader: `Your ${params.planName} subscription is now active`,
    content,
  });
}
