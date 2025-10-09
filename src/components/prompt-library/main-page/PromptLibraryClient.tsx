'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CategorySection } from './CategorySection';
import { PromptDetailModal } from '../prompt-detail-modal';
import { CATEGORY_METADATA, PROMPT_EXAMPLES } from '@/config/prompt-library.config';
import type { PromptExample } from '@/types/prompt-library';

export function PromptLibraryClient() {
  const t = useTranslations('promptLibrary');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);

  const getCategoryPrompts = (categoryId: string) => {
    return PROMPT_EXAMPLES.filter(p => p.category === categoryId).sort((a, b) => a.order - b.order);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6 animate-fade-in">
            <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ {t('title')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            {t('description')}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {CATEGORY_METADATA.map(category => {
            const prompts = getCategoryPrompts(category.id);
            return (
              <CategorySection
                key={category.id}
                category={category}
                prompts={prompts}
                maxVisible={6}
                onPromptClick={setSelectedPrompt}
              />
            );
          })}
        </div>
      </div>

      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
}
