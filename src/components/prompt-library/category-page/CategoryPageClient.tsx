'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PROMPT_EXAMPLES } from '@/config/prompt-library.config';
import { filterPrompts } from '@/lib/prompt-library/filter-utils';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';
import type {
  CategoryMeta,
  PromptCategory,
  PromptExample,
  PromptFilters,
} from '@/types/prompt-library';
import { ChevronRight, Search } from 'lucide-react';
import { Bird, Microscope, Mountain, Package, Sparkles, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { PromptDetailModal } from '../prompt-detail-modal';
import { PromptCard } from '../shared/PromptCard';

interface CategoryPageClientProps {
  category: CategoryMeta;
  categoryId: string;
}

const iconMap = {
  Users,
  Bird,
  Mountain,
  Package,
  Microscope,
  Sparkles,
};

export function CategoryPageClient({ category, categoryId }: CategoryPageClientProps) {
  const t = useTranslations('promptLibrary');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allPrompts = PROMPT_EXAMPLES.filter((p) => p.category === categoryId);

  const filters: PromptFilters = {
    category: categoryId as PromptCategory,
    search: searchQuery || undefined,
  };

  const filteredPrompts = filterPrompts(allPrompts, filters);
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 flex items-center gap-2 text-gray-600 text-sm dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/prompt-library" className="hover:text-gray-900 dark:hover:text-gray-200">
            Prompt Library
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{category.name}</span>
        </nav>

        <div className="mb-12">
          <div className="mb-4 flex items-center gap-4">
            <div
              className={`rounded-2xl bg-gradient-to-br p-4 ${getCategoryColor(category.color)} shadow-lg`}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-4xl text-transparent md:text-5xl dark:from-gray-100 dark:to-gray-400">
                {category.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{category.description}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="relative w-full flex-1 sm:max-w-md">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm dark:text-gray-400">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
              </p>
            </div>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              No prompts found matching your search.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onClick={() => setSelectedPrompt(prompt)}
                categoryColor={category.color}
              />
            ))}
          </div>
        )}
      </div>

      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
}
