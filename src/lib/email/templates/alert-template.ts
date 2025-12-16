import type { AlertEmailParams } from '../email-types';
import { escapeHtml, renderBaseTemplate } from './base-template';

const ALERT_COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export function renderAlertTemplate(params: AlertEmailParams): string {
  const color = ALERT_COLORS[params.alertType];

  const content = `
    <div style="border-left: 4px solid ${color}; padding-left: 16px; margin-bottom: 24px;">
      <h2 style="color: ${color}; margin-top: 0;">
        ${params.alertType.toUpperCase()} Alert: ${escapeHtml(params.title)}
      </h2>
    </div>

    <div class="info-box">
      <p><strong>Severity:</strong> ${escapeHtml(params.severity)}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      ${params.context ? `<p><strong>Context:</strong></p><pre style="overflow-x: auto;">${escapeHtml(JSON.stringify(params.context, null, 2))}</pre>` : ''}
    </div>

    <h3>Description:</h3>
    <p>${escapeHtml(params.message)}</p>

    ${
      params.stackTrace
        ? `
      <h3>Stack Trace:</h3>
      <pre style="background-color: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 12px;">${escapeHtml(params.stackTrace)}</pre>
    `
        : ''
    }
  `;

  return renderBaseTemplate({
    title: `${params.alertType.toUpperCase()}: ${params.title}`,
    preheader: `System alert - ${params.severity} severity`,
    content,
  });
}
