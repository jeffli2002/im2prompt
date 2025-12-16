import { EMAIL_CONFIG } from '../email-config';

export interface BaseTemplateParams {
  title: string;
  preheader?: string;
  content: string;
  footerContent?: string;
}

export function renderBaseTemplate(params: BaseTemplateParams): string {
  const { title, preheader = '', content, footerContent } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 32px 24px; background-color: #18181b; color: #ffffff; }
    .content { padding: 32px 24px; color: #09090b; line-height: 1.6; }
    .footer { padding: 24px; background-color: #f4f4f5; color: #71717a; font-size: 14px; text-align: center; }
    .button { display: inline-block; padding: 12px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; }
    h1 { margin: 0; font-size: 24px; font-weight: 600; }
    p { margin: 16px 0; }
    .info-box { background-color: #f4f4f5; padding: 16px; border-radius: 6px; margin: 16px 0; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="container">
    <div class="header">
      <h1>${EMAIL_CONFIG.templates.brandName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      ${
        footerContent ||
        `
        <p>&copy; ${new Date().getFullYear()} ${EMAIL_CONFIG.templates.brandName}. All rights reserved.</p>
        <p>
          <a href="${EMAIL_CONFIG.templates.baseUrl}" style="color: #71717a;">Visit Website</a> | 
          <a href="mailto:${EMAIL_CONFIG.templates.supportEmail}" style="color: #71717a;">Contact Support</a>
        </p>
      `
      }
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
