import type { AppConfig } from "@/types";

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
      default: 'im2Prompt - AI Image to Prompt Extraction',
      template: '%s | im2Prompt',
    },
    description: 'Extract AI prompts from images, refine them, and generate new visuals. Support for Midjourney, Stable Diffusion, and FLUX. Start free today!',
    keywords: ['AI', 'Image to Prompt', 'Midjourney', 'Stable Diffusion', 'FLUX', 'AI Art', 'Prompt Engineering', 'Creative AI'],
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
    emails: process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()).filter(Boolean) || [],
  },

  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png','image/gif'], // 支持JPEG,PNG和GIF格式
    maxFiles: 5,
  },

  // Pagination configuration
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
}; 