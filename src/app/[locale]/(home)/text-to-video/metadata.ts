import { seoPages } from '@/config/seo.config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: seoPages.textToVideo.title,
  description: seoPages.textToVideo.description,
  keywords: seoPages.textToVideo.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-video',
  },
  openGraph: {
    ...seoPages.textToVideo.openGraph,
    url: 'https://www.im2prompt.com/text-to-video',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToVideo.openGraph.title,
    description: seoPages.textToVideo.openGraph.description,
    images: seoPages.textToVideo.openGraph.images,
  },
};
