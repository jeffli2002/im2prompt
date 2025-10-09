'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, Search } from 'lucide-react';
import { Users, Bird, Mountain, Package, Microscope, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PromptCard } from '../shared/PromptCard';
import { PromptDetailModal } from '../prompt-detail-modal';
import { PROMPT_EXAMPLES } from '@/config/prompt-library.config';
import { filterPrompts } from '@/lib/prompt-library/filter-utils';
import type { PromptExample, PromptCategory, PromptFilters, CategoryMeta } from '@/types/prompt-library';
import { getCategoryColor } from '@/lib/prompt-library/image-utils';

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

  const allPrompts = PROMPT_EXAMPLES.filter(p => p.category === categoryId);
  
  const filters: PromptFilters = {
    category: categoryId as PromptCategory,
    search: searchQuery || undefined,
  };
  
  const filteredPrompts = filterPrompts(allPrompts, filters);
  const Icon = iconMap[category.icon as keyof typeof iconMap] || Package;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/prompt-library" className="hover:text-gray-900 dark:hover:text-gray-200">
            Prompt Library
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">{category.name}</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getCategoryColor(category.color)} shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
              </p>
            </div>
          </div>
        </div>

        {filteredPrompts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No prompts found matching your search.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredPrompts.map(prompt => (
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
