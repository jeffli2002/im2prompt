import type { PasswordResetParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderPasswordResetTemplate(params: PasswordResetParams): string {
  const content = `
    <h2>Password Reset Request</h2>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>We received a request to reset your password for your im2prompt account.</p>

    <div class="info-box">
      <p style="margin: 0 0 8px 0;"><strong>Request Details:</strong></p>
      <p style="margin: 4px 0; font-size: 14px;">Time: ${escapeHtml(params.requestTime)}</p>
      <p style="margin: 4px 0; font-size: 14px;">IP Address: ${escapeHtml(params.requestIpAddress)}</p>
      ${params.requestLocation ? `<p style="margin: 4px 0; font-size: 14px;">Location: ${escapeHtml(params.requestLocation)}</p>` : ''}
    </div>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.resetUrl)}" class="button" style="font-size: 18px; padding: 16px 48px;">
        Reset Password
      </a>
    </p>

    <p style="color: #f59e0b; font-weight: 600;">⏰ This link expires in ${params.expiresInMinutes} minutes</p>

    <div style="margin-top: 32px; padding: 16px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">⚠️ Security Warning</p>
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        If you didn't request this password reset, your account may be compromised. Please contact our support team immediately and consider changing your password.
      </p>
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #71717a;">
      This is an automated security email. If you did request this, simply click the button above. If you didn't, you can safely ignore this email.
    </p>
  `;

  return renderBaseTemplate({
    title: 'Reset Your Password',
    preheader: 'Click to reset your im2prompt password',
    content,
  });
}
