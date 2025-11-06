import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';

export const metadata: Metadata = {
  title: seoPages.imageToVideo.title,
  description: seoPages.imageToVideo.description,
  keywords: seoPages.imageToVideo.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com/image-to-video',
  },
  openGraph: {
    ...seoPages.imageToVideo.openGraph,
    url: 'https://www.im2prompt.com/image-to-video',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.imageToVideo.openGraph.title,
    description: seoPages.imageToVideo.openGraph.description,
    images: seoPages.imageToVideo.openGraph.images,
  },
};
