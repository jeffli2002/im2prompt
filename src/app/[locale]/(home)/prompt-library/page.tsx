import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PromptLibraryClient } from '@/components/prompt-library/main-page/PromptLibraryClient';

interface PromptLibraryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PromptLibraryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'promptLibrary' });
  
  return {
    title: `${t('title')} | im2Prompt - AI Image & Video Generation`,
    description: t('subtitle'),
    keywords: [
      'AI prompts',
      'Midjourney prompts',
      'Stable Diffusion examples',
      'FLUX prompts',
      'prompt library',
      'AI image generation',
      'prompt engineering',
      'Sora prompts',
    ],
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default async function PromptLibraryPage({ params }: PromptLibraryPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PromptLibraryClient />;
}
