import type { NotificationEmailParams } from '../email-types';
import { renderBaseTemplate, escapeHtml } from './base-template';

export function renderNotificationTemplate(params: NotificationEmailParams): string {
  const content = `
    <h2>Hi ${escapeHtml(params.userName)},</h2>
    
    <p>${escapeHtml(params.message)}</p>

    ${params.actionUrl && params.actionLabel ? `
      <p style="margin-top: 24px;">
        <a href="${escapeHtml(params.actionUrl)}" class="button">${escapeHtml(params.actionLabel)}</a>
      </p>
    ` : ''}

    <p style="margin-top: 24px; color: #71717a; font-size: 14px;">
      This is an automated notification. Please do not reply to this email.
    </p>
  `;

  return renderBaseTemplate({
    title: params.title,
    preheader: params.message.substring(0, 100),
    content,
  });
}
