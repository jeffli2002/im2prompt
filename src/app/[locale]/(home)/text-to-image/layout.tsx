import { seoPages } from '@/config/seo.config';
import {
  generateStructuredData,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebPageSchema,
} from '@/lib/seo/structured-data';
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
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToImage.openGraph.title,
    description: seoPages.textToImage.openGraph.description,
    images: seoPages.textToImage.openGraph.images,
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

export default function TextToImageLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/text-to-image',
      name: 'Text to Image Generator',
      description: seoPages.textToImage.description,
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
