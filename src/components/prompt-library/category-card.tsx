'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Bird, Mountain, Package, Microscope, Sparkles } from 'lucide-react';
import type { CategoryMeta } from '@/types/prompt-library';
import { getCategoryColor, getCategoryBorderColor } from '@/lib/prompt-library/image-utils';

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
      <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] dark:hover:shadow-purple-500/20 h-full">
        <div className={`h-2 bg-gradient-to-r ${getCategoryColor(category.color)}`} />
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(category.color)} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {promptCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {promptCount} prompts
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {category.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {category.description}
          </p>

          <div className="flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            {t('actions.exploreCategory')}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
