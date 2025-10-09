import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { CategoryPageClient } from '@/components/prompt-library/category-page/CategoryPageClient';
import { CATEGORY_METADATA } from '@/config/prompt-library.config';

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category: categoryId } = await params;
  const category = CATEGORY_METADATA.find(c => c.id === categoryId);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const t = await getTranslations({ locale, namespace: 'promptLibrary' });
  
  return {
    title: `${category.name} - ${t('title')} | im2Prompt`,
    description: category.description,
    openGraph: {
      title: `${category.name} Prompts`,
      description: category.description,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category: categoryId } = await params;
  setRequestLocale(locale);

  const category = CATEGORY_METADATA.find(c => c.id === categoryId);
  
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/prompt-library" className="text-purple-600 hover:underline mt-4 inline-block">
          Back to library
        </Link>
      </div>
    );
  }

  return <CategoryPageClient category={category} categoryId={categoryId} />;
}
