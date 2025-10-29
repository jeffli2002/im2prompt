import type { Metadata } from 'next';
import { seoPages } from '@/config/seo.config';
import { generateStructuredData, getOrganizationSchema, getWebPageSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: seoPages.promptLibrary.title,
  description: seoPages.promptLibrary.description,
  keywords: seoPages.promptLibrary.keywords,
  alternates: {
    canonical: 'https://www.im2prompt.com/prompt-library',
  },
  openGraph: {
    ...seoPages.promptLibrary.openGraph,
    url: 'https://www.im2prompt.com/prompt-library',
    locale: 'en_US',
    siteName: 'im2Prompt',
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.promptLibrary.openGraph.title,
    description: seoPages.promptLibrary.openGraph.description,
    images: seoPages.promptLibrary.openGraph.images,
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

export default function PromptLibraryLayout({ children }: { children: React.ReactNode }) {
  const structuredData = generateStructuredData([
    getOrganizationSchema(),
    getWebPageSchema({
      url: 'https://www.im2prompt.com/prompt-library',
      name: 'AI Prompt Library',
      description: seoPages.promptLibrary.description,
    }),
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
