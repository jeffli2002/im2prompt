import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';
import { generateStructuredData, getOrganizationSchema, getWebPageSchema, getSoftwareApplicationSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: seoPages.imageToVideo.title,
  description: seoPages.imageToVideo.description,
  keywords: seoPages.imageToVideo.keywords,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      {children}
    </>
  );
}
