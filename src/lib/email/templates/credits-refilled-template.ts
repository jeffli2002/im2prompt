import type { CreditsRefilledParams} from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderCreditsRefilledTemplate(params: CreditsRefilledParams): string {
  const estimatedImages = Math.floor(params.newBalance / 5);
  const estimatedVideos = Math.floor(params.newBalance / 15);

  const content = `
    <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px 0; color: white;">🎉 Your Credits Have Been Refilled!</h2>
      <p style="margin: 0; font-size: 18px; opacity: 0.9;">Time to create more amazing content</p>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Great news! Your monthly ${escapeHtml(params.planName)} credits have been added to your account.</p>

    <div class="info-box" style="text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #71717a;">New Credits Added</p>
      <p style="font-size: 48px; font-weight: bold; margin: 8px 0; color: #10b981;">+${params.creditsGranted}</p>
      <p style="margin: 0; font-size: 14px; color: #71717a;">Total Balance: <strong>${params.newBalance} credits</strong></p>
    </div>

    <h3>Last Month Recap:</h3>
    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px;">
      <p style="margin: 8px 0;">📊 Total credits used: <strong>${params.lastMonthUsage}</strong></p>
      <p style="margin: 8px 0;">🎨 You created amazing content!</p>
      <p style="margin: 8px 0;">⏭️ Next refill: <strong>${escapeHtml(params.nextRefillDate)}</strong></p>
    </div>

    <div style="background-color: #dbeafe; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
      <h3 style="margin: 0 0 16px 0;">What Can You Create This Month?</h3>
      <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px; margin: 8px;">
          <p style="font-size: 32px; font-weight: bold; margin: 0; color: #3b82f6;">~${estimatedImages}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #1e40af;">AI Images</p>
        </div>
        <div style="flex: 1; min-width: 150px; margin: 8px;">
          <p style="font-size: 32px; font-weight: bold; margin: 0; color: #3b82f6;">~${estimatedVideos}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #1e40af;">AI Videos</p>
        </div>
      </div>
      <p style="margin: 16px 0 0 0; font-size: 14px; color: #1e3a8a;">Or mix and match!</p>
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.dashboardUrl)}" class="button" style="font-size: 18px; padding: 16px 48px;">
        Start Creating
      </a>
    </p>

    <p style="margin-top: 24px; font-size: 14px; color: #71717a; text-align: center;">
      Ready to create something amazing? Your credits are waiting!
    </p>
  `;

  return renderBaseTemplate({
    title: 'Your Credits Have Been Refilled!',
    preheader: `+${params.creditsGranted} credits added to your account`,
    content,
  });
}
