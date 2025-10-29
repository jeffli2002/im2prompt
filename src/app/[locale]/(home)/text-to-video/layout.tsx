import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';
import { generateStructuredData, getOrganizationSchema, getWebPageSchema, getSoftwareApplicationSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: seoPages.textToVideo.title,
  description: seoPages.textToVideo.description,
  keywords: seoPages.textToVideo.keywords,
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-video',
  },
  openGraph: {
    ...seoPages.textToVideo.openGraph,
    url: 'https://www.im2prompt.com/text-to-video',
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToVideo.openGraph.title,
    description: seoPages.textToVideo.openGraph.description,
    images: seoPages.textToVideo.openGraph.images,
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

export default function TextToVideoLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/text-to-video',
      name: 'Text to Video Generator',
      description: seoPages.textToVideo.description,
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
