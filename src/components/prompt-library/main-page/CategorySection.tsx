'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Users, Bird, Mountain, Package, Microscope, Sparkles } from 'lucide-react';
import { PromptCard } from '../shared/PromptCard';
import { ViewMoreCard } from './ViewMoreCard';
import { useHorizontalScroll } from '@/hooks/prompt-library/useHorizontalScroll';
import type { CategoryMeta, PromptExample } from '@/types/prompt-library';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';

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
  onPromptClick 
}: CategorySectionProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = 
    useHorizontalScroll<HTMLDivElement>();

  if (prompts.length === 0) return null;

  const visiblePrompts = prompts.slice(0, maxVisible);
  const remainingCount = prompts.length - maxVisible;
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;

  return (
    <section className="mb-16" id={`category-${category.id}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(category.color)} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {category.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
            </p>
          </div>
        </div>

        <Link 
          href={`/prompt-library/${category.id}`}
          className="flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2 group"
        >
          <span className={`bg-gradient-to-r ${getCategoryColor(category.color)} bg-clip-text text-transparent`}>
            View All
          </span>
          <ArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="relative group/scroll">
        {canScrollLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-xl backdrop-blur-sm opacity-0 group-hover/scroll:opacity-100 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {canScrollRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none z-10" />
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-xl backdrop-blur-sm opacity-0 group-hover/scroll:opacity-100 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-2 -mx-1"
          role="region"
          aria-label={`${category.name} prompts`}
        >
          {visiblePrompts.map(prompt => (
            <div key={prompt.id} className="flex-shrink-0 w-[340px] sm:w-[380px] snap-start">
              <PromptCard 
                prompt={prompt} 
                onClick={() => onPromptClick?.(prompt)}
                categoryColor={category.color}
              />
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="flex-shrink-0 w-[340px] sm:w-[380px] snap-start">
              <ViewMoreCard
                category={category}
                remainingCount={remainingCount}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
