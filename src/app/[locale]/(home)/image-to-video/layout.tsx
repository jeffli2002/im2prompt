import { seoPages } from '@/config/seo.config';
import {
  generateStructuredData,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebPageSchema,
} from '@/lib/seo/structured-data';
import type { Metadata } from 'next';

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
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.imageToVideo.openGraph.title,
    description: seoPages.imageToVideo.openGraph.description,
    images: seoPages.imageToVideo.openGraph.images,
    creator: '@im2prompt',
    site: '@im2prompt',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ImageToVideoLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/image-to-video',
      name: 'Image to Video Generator',
      description: seoPages.imageToVideo.description,
    }),
    getSoftwareApplicationSchema(),
  ]);

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Structured data JSON-LD is safe and required for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      {children}
    </>
  );
}
