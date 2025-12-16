import type { GenerationCompleteParams } from '../email-types';
import { escapeHtml, renderBaseTemplate } from './base-template';

export function renderGenerationCompleteTemplate(params: GenerationCompleteParams): string {
  const isImage = params.generationType === 'image';
  const isVideo = params.generationType === 'video';
  const emoji = isImage ? '🎨' : '🎬';
  const typeText = isImage ? 'Image' : 'Video';

  const content = `
    <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white;">${emoji} Your ${typeText} is Ready!</h2>
    </div>
    
    <p>Hi ${escapeHtml(params.userName)},</p>
    
    <p>Great news! Your AI ${params.generationType} has been generated successfully.</p>

    <div style="text-align: center; margin: 24px 0;">
      <img src="${escapeHtml(params.thumbnailUrl)}" alt="Generated content preview" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
    </div>

    <div class="info-box">
      <h3 style="margin: 0 0 16px 0;">Generation Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Model:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.model)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Processing Time:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${escapeHtml(params.processingTime)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Credits Used:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${params.creditsUsed}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Completed:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(params.completionDate)}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-weight: 600;">Your Prompt:</p>
      <p style="margin: 0; font-style: italic; color: #71717a;">"${escapeHtml(params.prompt.substring(0, 200))}${params.prompt.length > 200 ? '...' : ''}"</p>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${escapeHtml(params.viewUrl)}" class="button" style="font-size: 18px; padding: 16px 32px; margin: 8px; background-color: #8b5cf6;">
        View ${typeText}
      </a>
      <a href="${escapeHtml(params.downloadUrl)}" style="display: inline-block; padding: 16px 32px; margin: 8px; color: #18181b; text-decoration: none; border: 2px solid #18181b; border-radius: 6px;">
        Download
      </a>
    </div>

    <div style="background-color: #dbeafe; padding: 16px; border-radius: 6px; margin: 24px 0; text-align: center;">
      <p style="margin: 0; color: #1e40af;">
        <strong>💡 Create More!</strong> Want to generate more content? <a href="${escapeHtml(params.dashboardUrl)}" style="color: #3b82f6;">Visit your dashboard</a>
      </p>
    </div>

    <p style="margin-top: 24px; font-size: 14px; color: #71717a; text-align: center;">
      Love your creation? Share it with the community!
    </p>
  `;

  return renderBaseTemplate({
    title: `Your ${typeText} is Ready!`,
    preheader: `Your AI-generated ${params.generationType} has been created successfully`,
    content,
  });
}
