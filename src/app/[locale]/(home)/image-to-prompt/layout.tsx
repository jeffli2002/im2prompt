import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';
import { generateStructuredData, getOrganizationSchema, getWebPageSchema, getSoftwareApplicationSchema, getImageToPromptHowToSchema, getDefaultFAQSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: seoPages.imageToPrompt.title,
  description: seoPages.imageToPrompt.description,
  keywords: seoPages.imageToPrompt.keywords.join(', '),
  alternates: {
    canonical: 'https://www.im2prompt.com/image-to-prompt',
  },
  openGraph: {
    ...seoPages.imageToPrompt.openGraph,
    url: 'https://www.im2prompt.com/image-to-prompt',
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.imageToPrompt.openGraph.title,
    description: seoPages.imageToPrompt.openGraph.description,
    images: seoPages.imageToPrompt.openGraph.images,
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

export default function ImageToPromptLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/image-to-prompt',
      name: seoPages.imageToPrompt.title,
      description: seoPages.imageToPrompt.description,
    }),
    getSoftwareApplicationSchema(),
    getImageToPromptHowToSchema(),
    getDefaultFAQSchema(),
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
