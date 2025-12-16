import { seoPages } from '@/config/seo.config';
import {
  generateStructuredData,
  getOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebPageSchema,
} from '@/lib/seo/structured-data';
import type { Metadata } from 'next';

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
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.textToPrompt.openGraph.title,
    description: seoPages.textToPrompt.openGraph.description,
    images: seoPages.textToPrompt.openGraph.images,
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

export default function TextToPromptLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/text-to-prompt',
      name: 'Text to Prompt Enhancer',
      description: seoPages.textToPrompt.description,
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
