'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PromptCard } from './prompt-card';
import { PromptDetailModal } from './prompt-detail-modal';
import type { PromptExample } from '@/types/prompt-library';

interface PromptGridProps {
  prompts: PromptExample[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  const t = useTranslations('promptLibrary');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {prompts.map(prompt => (
          <PromptCard
            key={prompt.id}
            example={prompt}
            onClick={() => setSelectedPrompt(prompt)}
          />
        ))}
      </div>

      <PromptDetailModal
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
}
