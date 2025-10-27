'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCopyToClipboard } from '@/hooks/prompt-library/useCopyToClipboard';
import { getCategoryColor, getPromptImageUrl } from '@/lib/prompt-library/image-utils';
import type { CategoryColor, PromptExample } from '@/types/prompt-library';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

interface PromptCardProps {
  prompt: PromptExample;
  onClick?: () => void;
  categoryColor?: CategoryColor;
}

export function PromptCard({ prompt, onClick, categoryColor = 'purple' }: PromptCardProps) {
  const t = useTranslations('promptLibrary');
  const { copy, copied } = useCopyToClipboard();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copy(prompt.prompt);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl dark:hover:shadow-purple-500/20"
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={getPromptImageUrl(prompt.cloudinaryPublicId, 'card')}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {prompt.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
              {t('prompts.featured')}
            </Badge>
          </div>
        )}

        <button
          onClick={handleCopy}
          className="absolute right-3 bottom-3 rounded-full bg-white/90 p-2.5 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 group-hover:opacity-100 dark:bg-gray-800/90"
          aria-label={t('actions.copyPrompt')}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      <CardContent className="p-5">
        <h3 className="mb-2 line-clamp-1 font-semibold text-base text-gray-900 transition-colors group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
          {prompt.title}
        </h3>

        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-gray-600 text-sm dark:text-gray-400">
          {prompt.prompt}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {prompt.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-gray-100 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-gray-500 text-xs dark:text-gray-400">
              +{prompt.tags.length - 2}
            </span>
          )}
          {prompt.model && (
            <Badge variant="outline" className="ml-auto text-xs">
              {prompt.model}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
