import type { EmailVerificationParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderEmailVerificationTemplate(params: EmailVerificationParams): string {
  const content = `
    <h2>Verify Your Email Address</h2>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Thanks for signing up with im2prompt! Please verify your email address to activate your account and start creating.</p>

    <p style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.verificationUrl)}" class="button" style="font-size: 18px; padding: 16px 48px; background-color: #10b981;">
        Verify Email Address
      </a>
    </p>

    <div class="info-box">
      <p style="margin: 0;"><strong>Or enter this verification code:</strong></p>
      <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 16px 0; font-family: 'Courier New', monospace;">
        ${escapeHtml(params.verificationCode)}
      </p>
    </div>

    <p style="color: #f59e0b; font-weight: 600;">⏰ This link expires in ${params.expiresInMinutes} minutes</p>

    <div style="margin-top: 32px; padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Security Notice:</strong> If you didn't create an im2prompt account, please ignore this email. Your email address will not be used.
      </p>
    </div>
  `;

  return renderBaseTemplate({
    title: 'Verify Your Email',
    preheader: 'Verify your email to activate your im2prompt account',
    content,
  });
}
