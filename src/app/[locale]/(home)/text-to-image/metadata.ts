import { seoPages } from '@/config/seo.config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: seoPages.textToImage.title,
  description: seoPages.textToImage.description,
  keywords: seoPages.textToImage.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-image',
  },
  openGraph: {
    ...seoPages.textToImage.openGraph,
    url: 'https://www.im2prompt.com/text-to-image',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToImage.openGraph.title,
    description: seoPages.textToImage.openGraph.description,
    images: seoPages.textToImage.openGraph.images,
  },
};
