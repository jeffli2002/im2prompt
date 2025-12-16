import type { WelcomeEmailParams } from '../email-types';
import { escapeHtml, renderBaseTemplate } from './base-template';

export function renderWelcomeTemplate(params: WelcomeEmailParams): string {
  const content = `
    <h2>Welcome to im2prompt, ${escapeHtml(params.userName)}! 🎉</h2>
    
    <p>Thank you for joining im2prompt! Your account has been created and you're ready to start creating amazing AI-generated content.</p>

    <div class="info-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 24px;">
      <h3 style="margin: 0 0 8px 0; color: white;">Your Startup Credits</h3>
      <p style="font-size: 36px; font-weight: bold; margin: 0;">${params.signupCredits} Credits</p>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Ready to use right now!</p>
    </div>

    <h3>Get Started:</h3>
    <div style="margin: 16px 0;">
      <p style="margin: 8px 0;"><strong>🎨 Image-to-Prompt</strong><br/>Extract prompts from images (2 credits + 3 free daily)</p>
      <p style="margin: 8px 0;"><strong>✍️ Text-to-Prompt</strong><br/>Generate and enhance prompts (Unlimited & Free)</p>
      <p style="margin: 8px 0;"><strong>🖼️ Image Generation</strong><br/>Create stunning images (5 credits each)</p>
      <p style="margin: 8px 0;"><strong>🎬 Video Generation</strong><br/>Create videos with Sora-2 (15 credits each)</p>
    </div>

    <p style="margin-top: 32px; text-align: center;">
      <a href="${escapeHtml(params.dashboardUrl)}" class="button" style="font-size: 18px; padding: 16px 32px;">Start Creating Now</a>
    </p>

    <div style="margin-top: 32px; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
      <h4 style="margin: 0 0 12px 0;">Quick Links:</h4>
      <p style="margin: 8px 0;">
        <a href="${escapeHtml(params.imageToPromptUrl)}" style="color: #3b82f6;">Try Image-to-Prompt →</a>
      </p>
      <p style="margin: 8px 0;">
        <a href="${escapeHtml(params.textToPromptUrl)}" style="color: #3b82f6;">Explore Text-to-Prompt →</a>
      </p>
      <p style="margin: 8px 0;">
        <a href="${escapeHtml(params.dashboardUrl)}" style="color: #3b82f6;">View Dashboard →</a>
      </p>
    </div>

    <p style="margin-top: 24px; color: #71717a; font-size: 14px;">
      Questions? We're here to help! Reply to this email or visit our Help Center.
    </p>
  `;

  return renderBaseTemplate({
    title: 'Welcome to im2prompt!',
    preheader: `Your ${params.signupCredits} free credits are ready to use`,
    content,
  });
}
