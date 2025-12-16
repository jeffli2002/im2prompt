import { seoPages } from '@/config/seo.config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: seoPages.imageToPrompt.title,
  description: seoPages.imageToPrompt.description,
  keywords: seoPages.imageToPrompt.keywords,
  alternates: {
    canonical: 'https://www.im2prompt.com/image-to-prompt',
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
