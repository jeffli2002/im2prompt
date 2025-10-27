'use client';

import { CATEGORY_METADATA, PROMPT_EXAMPLES } from '@/config/prompt-library.config';
import type { PromptExample } from '@/types/prompt-library';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PromptDetailModal } from '../prompt-detail-modal';
import { CategorySection } from './CategorySection';

export function PromptLibraryClient() {
  const t = useTranslations('promptLibrary');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);

  const getCategoryPrompts = (categoryId: string) => {
    return PROMPT_EXAMPLES.filter((p) => p.category === categoryId).sort(
      (a, b) => a.order - b.order
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-block animate-fade-in rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 dark:from-purple-900/30 dark:to-pink-900/30">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-medium text-sm text-transparent">
              ✨ {t('title')}
            </span>
          </div>

          <h1 className="mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text font-bold text-4xl text-transparent md:text-5xl lg:text-6xl dark:from-gray-100 dark:to-gray-400">
            {t('description')}
          </h1>

          <p className="mx-auto max-w-3xl text-gray-600 text-xl dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {CATEGORY_METADATA.map((category) => {
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
