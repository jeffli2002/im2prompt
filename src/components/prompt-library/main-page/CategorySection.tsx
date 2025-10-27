'use client';

import { useHorizontalScroll } from '@/hooks/prompt-library/useHorizontalScroll';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';
import type { CategoryMeta, PromptExample } from '@/types/prompt-library';
import {
  ArrowRight,
  Bird,
  ChevronLeft,
  ChevronRight,
  Microscope,
  Mountain,
  Package,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { PromptCard } from '../shared/PromptCard';
import { ViewMoreCard } from './ViewMoreCard';

interface CategorySectionProps {
  category: CategoryMeta;
  prompts: PromptExample[];
  maxVisible?: number;
  onPromptClick?: (prompt: PromptExample) => void;
}

const iconMap = {
  Users,
  Bird,
  Mountain,
  Package,
  Microscope,
  Sparkles,
};

export function CategorySection({
  category,
  prompts,
  maxVisible = 6,
  onPromptClick,
}: CategorySectionProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } =
    useHorizontalScroll<HTMLDivElement>();

  if (prompts.length === 0) return null;

  const visiblePrompts = prompts.slice(0, maxVisible);
  const remainingCount = prompts.length - maxVisible;
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;

  return (
    <section className="mb-16" id={`category-${category.id}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl bg-gradient-to-br p-3 ${getCategoryColor(category.color)} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          <div>
            <h2 className="font-bold text-2xl text-gray-900 md:text-3xl dark:text-gray-100">
              {category.name}
            </h2>
            <p className="mt-0.5 text-gray-500 text-sm dark:text-gray-400">
              {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
            </p>
          </div>
        </div>

        <Link
          href={`/prompt-library/${category.id}`}
          className="group flex items-center gap-1.5 font-medium text-sm transition-all hover:gap-2"
        >
          <span
            className={`bg-gradient-to-r ${getCategoryColor(category.color)} bg-clip-text text-transparent`}
          >
            View All
          </span>
          <ArrowRight className="h-4 w-4 text-gray-600 transition-transform group-hover:translate-x-0.5 dark:text-gray-400" />
        </Link>
      </div>

      <div className="group/scroll relative">
        {canScrollLeft && (
          <>
            <div className="pointer-events-none absolute top-2 bottom-2 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent dark:from-gray-950" />
            <button
              onClick={scrollLeft}
              className="-translate-y-1/2 absolute top-1/2 left-2 z-20 rounded-full bg-white/90 p-2 opacity-0 shadow-xl backdrop-blur-sm transition-all hover:scale-110 group-hover/scroll:opacity-100 dark:bg-gray-800/90"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}

        {canScrollRight && (
          <>
            <div className="pointer-events-none absolute top-2 right-0 bottom-2 z-10 w-20 bg-gradient-to-l from-white to-transparent dark:from-gray-950" />
            <button
              onClick={scrollRight}
              className="-translate-y-1/2 absolute top-1/2 right-2 z-20 rounded-full bg-white/90 p-2 opacity-0 shadow-xl backdrop-blur-sm transition-all hover:scale-110 group-hover/scroll:opacity-100 dark:bg-gray-800/90"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2 md:gap-6"
          role="region"
          aria-label={`${category.name} prompts`}
        >
          {visiblePrompts.map((prompt) => (
            <div key={prompt.id} className="w-[340px] flex-shrink-0 snap-start sm:w-[380px]">
              <PromptCard
                prompt={prompt}
                onClick={() => onPromptClick?.(prompt)}
                categoryColor={category.color}
              />
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="w-[340px] flex-shrink-0 snap-start sm:w-[380px]">
              <ViewMoreCard category={category} remainingCount={remainingCount} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
