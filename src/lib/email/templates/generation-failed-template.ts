import type { GenerationFailedParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderGenerationFailedTemplate(params: GenerationFailedParams): string {
  const typeText = params.generationType === 'image' ? 'Image' : 'Video';
  const isContentPolicy = params.failureReason.toLowerCase().includes('policy') || 
                          params.failureReason.toLowerCase().includes('content') ||
                          params.failureReason.toLowerCase().includes('inappropriate');

  const content = `
    <div style="background-color: #f59e0b; color: white; padding: 16px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">Generation Failed</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Unfortunately, your ${params.generationType} generation couldn't be completed.</p>

    <div class="info-box">
      <h3 style="margin: 0 0 16px 0;">Generation Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Type:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${typeText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Model:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.model)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Reason:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.failureReason)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Failed:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(params.failureDate)}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #d1fae5; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-weight: 600; color: #065f46;">✓ Credits Refunded</p>
      <p style="margin: 8px 0 0 0; color: #064e3b;">
        We've refunded ${params.creditsRefunded} credits to your account. Your new balance is <strong>${params.newBalance} credits</strong>.
      </p>
    </div>

    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600;">Your Prompt:</p>
      <p style="margin: 0; font-style: italic; color: #71717a;">"${escapeHtml(params.prompt.substring(0, 200))}${params.prompt.length > 200 ? '...' : ''}"</p>
    </div>

    ${isContentPolicy ? `
      <div style="background-color: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 24px 0;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">Content Policy Notice</p>
        <p style="margin: 8px 0 0 0; color: #92400e;">
          Your prompt may have violated our content policy. Please review our guidelines and try again with appropriate content.
        </p>
      </div>
    ` : `
      <div style="background-color: #dbeafe; padding: 16px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 24px 0;">
        <p style="margin: 0; font-weight: 600; color: #1e40af;">Technical Issue</p>
        <p style="margin: 8px 0 0 0; color: #1e3a8a;">
          This was a technical issue on our end. Our team has been notified. Please try again - it should work now.
        </p>
      </div>
    `}

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.retryUrl)}" class="button" style="font-size: 18px; padding: 16px 48px;">
        Try Again
      </a>
      <a href="${escapeHtml(params.supportUrl)}" style="display: inline-block; padding: 16px 32px; margin: 8px; color: #18181b; text-decoration: none; border: 2px solid #18181b; border-radius: 6px;">
        Contact Support
      </a>
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #71717a; text-align: center;">
      We're sorry for the inconvenience. If this issue persists, please reach out to our support team.
    </p>
  `;

  return renderBaseTemplate({
    title: `${typeText} Generation Failed`,
    preheader: `Your ${params.generationType} generation couldn't be completed - credits refunded`,
    content,
  });
}
