'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getCategoryBorderColor, getCategoryColor } from '@/lib/prompt-library/image-utils';
import type { CategoryMeta } from '@/types/prompt-library';
import { ArrowRight, Bird, Microscope, Mountain, Package, Sparkles, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface CategoryCardProps {
  category: CategoryMeta;
  promptCount?: number;
}

const iconMap = {
  Users,
  Bird,
  Mountain,
  Package,
  Microscope,
  Sparkles,
};

export function CategoryCard({ category, promptCount = 0 }: CategoryCardProps) {
  const t = useTranslations('promptLibrary');
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;

  return (
    <Link href={`/prompt-library/${category.id}`}>
      <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-purple-500/20">
        <div className={`h-2 bg-gradient-to-r ${getCategoryColor(category.color)}`} />

        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={`rounded-xl bg-gradient-to-br p-3 ${getCategoryColor(category.color)} shadow-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            {promptCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {promptCount} prompts
              </Badge>
            )}
          </div>

          <h3 className="mb-2 font-bold text-gray-900 text-xl dark:text-gray-100">
            {category.name}
          </h3>

          <p className="mb-4 line-clamp-2 text-gray-600 text-sm dark:text-gray-400">
            {category.description}
          </p>

          <div className="flex items-center font-medium text-purple-600 text-sm hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            {t('actions.exploreCategory')}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
