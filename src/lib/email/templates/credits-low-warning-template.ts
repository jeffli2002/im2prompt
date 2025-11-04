import type { CreditsLowWarningParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderCreditsLowWarningTemplate(params: CreditsLowWarningParams): string {
  const getAlertColor = () => {
    if (params.warningThreshold <= 5) return '#ef4444';
    if (params.warningThreshold <= 10) return '#f59e0b';
    return '#3b82f6';
  };

  const getAlertEmoji = () => {
    if (params.warningThreshold <= 5) return '🚨';
    if (params.warningThreshold <= 10) return '⚠️';
    return 'ℹ️';
  };

  const alertColor = getAlertColor();
  const alertEmoji = getAlertEmoji();
  const isFree = params.planName.toLowerCase() === 'free';

  const estimatedGenerations = Math.floor(params.currentBalance / 5);
  const estimatedVideos = Math.floor(params.currentBalance / 15);

  const content = `
    <div style="background-color: ${alertColor}; color: white; padding: 16px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">${alertEmoji} Credits Running Low (${params.warningThreshold}% Remaining)</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Your im2prompt credit balance is getting low. Here's your current status:</p>

    <div class="info-box" style="text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #71717a;">Current Balance</p>
      <p style="font-size: 48px; font-weight: bold; margin: 8px 0; color: ${alertColor};">${params.currentBalance}</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">${params.percentageRemaining}% of ${params.monthlyAllocation} credits</p>
    </div>

    <h3>Usage Insights:</h3>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px;">
      <p style="margin: 8px 0;">📊 Average daily usage: <strong>${params.usageRate} credits</strong></p>
      <p style="margin: 8px 0;">⏱️ Estimated days remaining: <strong>~${params.estimatedRunoutDays} days</strong></p>
      <p style="margin: 8px 0;">🎨 You can still generate: <strong>~${estimatedGenerations} images</strong> or <strong>~${estimatedVideos} videos</strong></p>
    </div>

    ${isFree ? `
      <div style="background-color: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 24px 0;">
        <p style="margin: 0; font-weight: 600; color: #1e40af;">💡 Upgrade to Never Run Out</p>
        <p style="margin: 8px 0 0 0; color: #1e3a8a;">
          Get 500 credits every month with Pro or 900 with Pro+!
        </p>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(params.upgradeUrl)}" class="button" style="font-size: 18px; padding: 16px 32px; background-color: #3b82f6;">
          Upgrade to Pro
        </a>
      </p>
    ` : params.nextRefillDate ? `
      <div style="background-color: #d1fae5; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin: 24px 0;">
        <p style="margin: 0; font-weight: 600; color: #065f46;">✓ Good News!</p>
        <p style="margin: 8px 0 0 0; color: #064e3b;">
          Your credits will refill in <strong>${params.daysUntilRefill} days</strong> on <strong>${escapeHtml(params.nextRefillDate)}</strong>
        </p>
      </div>

      <p style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(params.upgradeUrl)}" style="display: inline-block; padding: 12px 24px; color: #3b82f6; text-decoration: none; border: 2px solid #3b82f6; border-radius: 6px;">
          Need More? Upgrade to Pro+
        </a>
      </p>
    ` : ''}

    <h3>Tips to Make Credits Last:</h3>
    <p style="margin: 8px 0;">💡 Use Image-to-Prompt (2 credits) before generating</p>
    <p style="margin: 8px 0;">💡 Plan your generations carefully</p>
    <p style="margin: 8px 0;">💡 Use Text-to-Prompt (free & unlimited)</p>
    <p style="margin: 8px 0;">💡 Take advantage of your 3 daily free image extractions</p>
  `;

  return renderBaseTemplate({
    title: `Credits Running Low - ${params.warningThreshold}% Remaining`,
    preheader: `You have ${params.currentBalance} credits left (${params.warningThreshold}% remaining)`,
    content,
  });
}
