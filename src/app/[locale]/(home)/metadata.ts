import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';

export const metadata: Metadata = {
  title: seoPages.home.title,
  description: seoPages.home.description,
  keywords: seoPages.home.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com',
  },
  openGraph: {
    ...seoPages.home.openGraph,
    url: 'https://www.im2prompt.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.home.openGraph.title,
    description: seoPages.home.openGraph.description,
    images: seoPages.home.openGraph.images,
  },
};

