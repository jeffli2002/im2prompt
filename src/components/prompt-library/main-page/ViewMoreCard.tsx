'use client';

import Link from 'next/link';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { CategoryMeta } from '@/types/prompt-library';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';

interface ViewMoreCardProps {
  category: CategoryMeta;
  remainingCount: number;
}

export function ViewMoreCard({ category, remainingCount }: ViewMoreCardProps) {
  return (
    <Link href={`/prompt-library/${category.id}`}>
      <Card className="h-full flex flex-col items-center justify-center aspect-[16/9] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group relative rounded-lg">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.color)} opacity-10 group-hover:opacity-20 transition-opacity`} />
        
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
          <div className={`p-3 rounded-full bg-gradient-to-br ${getCategoryColor(category.color)} shadow-lg group-hover:scale-110 transition-transform`}>
            <Grid3x3 className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              View All Prompts
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              +{remainingCount} more
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
