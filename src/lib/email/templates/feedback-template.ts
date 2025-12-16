import type { FeedbackEmailParams } from '../email-types';
import { escapeHtml, renderBaseTemplate } from './base-template';

export function renderFeedbackTemplate(params: FeedbackEmailParams): string {
  const content = `
    <h2>New ${escapeHtml(params.category)} from ${escapeHtml(params.name)}</h2>
    
    <div class="info-box">
      <p><strong>From:</strong> ${escapeHtml(params.name)} (${escapeHtml(params.email)})</p>
      <p><strong>Subject:</strong> ${escapeHtml(params.subject)}</p>
      <p><strong>Category:</strong> ${escapeHtml(params.category)}</p>
      <p><strong>Priority:</strong> ${escapeHtml(params.priority)}</p>
      ${params.userId ? `<p><strong>User ID:</strong> ${escapeHtml(params.userId)}</p>` : ''}
      <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <h3>Message:</h3>
    <div style="background-color: #fafafa; padding: 16px; border-left: 4px solid #18181b; white-space: pre-wrap;">
${escapeHtml(params.message)}
    </div>

    <p style="margin-top: 24px;">
      <a href="mailto:${escapeHtml(params.email)}" class="button">Reply to ${escapeHtml(params.name)}</a>
    </p>
  `;

  return renderBaseTemplate({
    title: `${params.category} - ${params.subject}`,
    preheader: `New ${params.category} from ${params.name}`,
    content,
  });
}
