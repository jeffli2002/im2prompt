import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';

export const metadata: Metadata = {
  title: seoPages.imageToPrompt.title,
  description: seoPages.imageToPrompt.description,
  keywords: seoPages.imageToPrompt.keywords,
  alternates: {
    canonical: '/image-to-prompt',
  },
  openGraph: {
    ...seoPages.imageToPrompt.openGraph,
    url: 'https://www.im2prompt.com/image-to-prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.imageToPrompt.openGraph.title,
    description: seoPages.imageToPrompt.openGraph.description,
    images: seoPages.imageToPrompt.openGraph.images,
  },
};
