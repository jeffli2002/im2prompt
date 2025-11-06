import type { AppConfig } from '@/types';

export const appConfig: AppConfig = {
  // Application basic information
  app: {
    name: 'im2Prompt',
    version: '0.1.0',
    description: 'Extract AI prompts from any image and create stunning new visuals',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    domain: 'im2prompt.com',
  },

  // SEO and metadata
  metadata: {
    title: {
      default: 'Sora 2 Prompts for Short Video — Image→Video Templates | im2Prompt',
      template: '%s | im2Prompt',
    },
    description:
      'Convert images to Sora 2 prompts, Nano Banana YouTube thumbnails, and Midjourney templates. Free image to prompt tool with downloadable templates. Extract prompts for Flux, Stable Diffusion, and create stunning AI visuals instantly.',
    keywords: [
      'Sora 2 prompts',
      'Sora 2 video prompts',
      'Nano Banana prompts',
      'Nano Banana YouTube thumbnail prompt',
      'image to prompt',
      'image to prompt tool',
      'AI prompt generator',
      'Midjourney prompts',
      'Midjourney prompt extractor',
      'Flux prompts',
      'Stable Diffusion prompts',
      'YouTube thumbnail prompt',
      'how to generate YouTube thumbnail with AI',
      'TikTok cover prompt template',
      'how to prompt Sora 2',
      'best prompt generator 2025',
      'imageprompt.org alternative',
      'AI Art',
      'Prompt Engineering',
      'Creative AI',
      'downloadable prompt templates',
    ],
    authors: [{ name: 'im2Prompt Team' }],
    creator: 'im2Prompt Team',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      siteName: 'im2Prompt',
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@im2prompt',
    },
  },

  // Administrator configuration
  admin: {
    emails:
      process.env.ADMIN_EMAILS?.split(',')
        .map((email) => email.trim())
        .filter(Boolean) || [],
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'], // 支持JPEG,PNG和GIF格式
    maxFiles: 5,
  },

  // Pagination configuration
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
};
