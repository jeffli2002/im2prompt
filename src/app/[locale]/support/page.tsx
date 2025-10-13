import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { SupportPage } from '@/components/support/support-page';

interface SupportPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SupportPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'support' });
  
  return {
    title: `${t('title')} | im2Prompt - Customer Support`,
    description: t('subtitle'),
    keywords: [
      'customer support',
      'help center',
      'contact support',
      'AI image generation help',
      'technical assistance',
      'im2prompt support',
    ],
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
  };
}

export default async function SupportPageContainer({ params }: SupportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SupportPage />;
}
