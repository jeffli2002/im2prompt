import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';

export const metadata: Metadata = {
  title: seoPages.textToPrompt.title,
  description: seoPages.textToPrompt.description,
  keywords: seoPages.textToPrompt.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-prompt',
  },
  openGraph: {
    ...seoPages.textToPrompt.openGraph,
    url: 'https://www.im2prompt.com/text-to-prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToPrompt.openGraph.title,
    description: seoPages.textToPrompt.openGraph.description,
    images: seoPages.textToPrompt.openGraph.images,
  },
};
