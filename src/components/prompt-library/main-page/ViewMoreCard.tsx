'use client';

import { Card } from '@/components/ui/card';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';
import type { CategoryMeta } from '@/types/prompt-library';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import Link from 'next/link';

interface ViewMoreCardProps {
  category: CategoryMeta;
  remainingCount: number;
}

export function ViewMoreCard({ category, remainingCount }: ViewMoreCardProps) {
  return (
    <Link href={`/prompt-library/${category.id}`}>
      <Card className="group relative flex aspect-[16/9] h-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.color)} opacity-10 transition-opacity group-hover:opacity-20`}
        />

        <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
          <div
            className={`rounded-full bg-gradient-to-br p-3 ${getCategoryColor(category.color)} shadow-lg transition-transform group-hover:scale-110`}
          >
            <Grid3x3 className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="mb-1 font-semibold text-base text-gray-900 dark:text-gray-100">
              View All Prompts
            </p>
            <p className="text-gray-600 text-sm dark:text-gray-400">+{remainingCount} more</p>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-600 transition-transform group-hover:translate-x-1 dark:text-gray-400" />
        </div>
      </Card>
    </Link>
  );
}
