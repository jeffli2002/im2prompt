'use client';

import type { PromptExample } from '@/types/prompt-library';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PromptCard } from './prompt-card';
import { PromptDetailModal } from './prompt-detail-modal';

interface PromptGridProps {
  prompts: PromptExample[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  const t = useTranslations('promptLibrary');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptExample | null>(null);

  if (prompts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="mb-2 font-semibold text-gray-900 text-xl dark:text-gray-100">
          {t('empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} example={prompt} onClick={() => setSelectedPrompt(prompt)} />
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
