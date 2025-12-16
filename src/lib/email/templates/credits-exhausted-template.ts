import type { CreditsExhaustedParams } from '../email-types';
import { escapeHtml, renderBaseTemplate } from './base-template';

export function renderCreditsExhaustedTemplate(params: CreditsExhaustedParams): string {
  const isFree = params.planName.toLowerCase() === 'free';

  const content = `
    <div style="background-color: #f59e0b; color: white; padding: 16px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">Credits Depleted</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Your im2prompt credits have been exhausted.</p>

    <div class="info-box" style="text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #71717a;">Current Balance</p>
      <p style="font-size: 48px; font-weight: bold; margin: 8px 0; color: #f59e0b;">0</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">Used this ${isFree ? 'period' : 'month'}: ${params.totalCreditsUsedThisCycle} credits</p>
    </div>

    <h3>What This Means:</h3>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px;">
      <p style="margin: 8px 0;">❌ No more image generation</p>
      <p style="margin: 8px 0;">❌ No more video generation</p>
      <p style="margin: 8px 0;">✓ Still get 3 daily image-to-prompt extractions</p>
      <p style="margin: 8px 0;">✓ Unlimited text-to-prompt generation</p>
    </div>

    ${
      isFree
        ? `
      <div style="background-color: #dbeafe; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
        <h3 style="margin: 0 0 16px 0;">Get More Credits!</h3>
        <div style="display: inline-block; text-align: left; margin: 16px 0;">
          <p style="margin: 8px 0;"><strong>Pro Plan - $14.9/month</strong></p>
          <p style="margin: 4px 0;">✓ 500 credits per month</p>
          <p style="margin: 4px 0;">✓ 300 image-to-prompt extractions</p>
          <p style="margin: 4px 0;">✓ Commercial license</p>
          <p style="margin: 4px 0;">✓ No watermark</p>
        </div>
        <div style="display: inline-block; text-align: left; margin: 16px 0;">
          <p style="margin: 8px 0;"><strong>Pro+ Plan - $24.9/month</strong></p>
          <p style="margin: 4px 0;">✓ 900 credits per month</p>
          <p style="margin: 4px 0;">✓ 600 image-to-prompt extractions</p>
          <p style="margin: 4px 0;">✓ Everything in Pro</p>
          <p style="margin: 4px 0;">✓ Priority support</p>
        </div>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(params.upgradeUrl)}" class="button" style="font-size: 18px; padding: 16px 48px;">
          Upgrade Now
        </a>
      </p>
    `
        : params.nextRefillDate && params.nextRefillAmount
          ? `
      <div style="background-color: #d1fae5; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin: 24px 0;">
        <p style="margin: 0; font-weight: 600; color: #065f46;">✓ Good News!</p>
        <p style="margin: 8px 0 0 0; color: #064e3b;">
          Your ${params.nextRefillAmount} monthly credits will refill in <strong>${params.daysUntilRefill} days</strong> on <strong>${escapeHtml(params.nextRefillDate)}</strong>
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <p style="color: #71717a; margin-bottom: 16px;">Need more credits immediately?</p>
        <a href="${escapeHtml(params.upgradeUrl)}" style="display: inline-block; padding: 12px 24px; color: #3b82f6; text-decoration: none; border: 2px solid #3b82f6; border-radius: 6px;">
          Upgrade to Pro+ (900 credits/month)
        </a>
      </div>
    `
          : ''
    }

    <p style="margin-top: 32px; font-size: 14px; color: #71717a;">
      In the meantime, you can still use your free daily features and explore text-to-prompt generation!
    </p>
  `;

  return renderBaseTemplate({
    title: 'Credits Exhausted',
    preheader: `Your ${params.planName} credits have been used up`,
    content,
  });
}
