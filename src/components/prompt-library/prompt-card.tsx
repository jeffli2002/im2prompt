'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPromptImageUrl } from '@/lib/prompt-library/image-utils';
import type { PromptExample } from '@/types/prompt-library';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

interface PromptCardProps {
  example: PromptExample;
  onClick?: () => void;
}

export function PromptCard({ example, onClick }: PromptCardProps) {
  const t = useTranslations('promptLibrary');
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(example.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-purple-500/20"
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={getPromptImageUrl(example.cloudinaryPublicId, 'card')}
          alt={example.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
        {example.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {t('prompts.featured')}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <h3 className="mb-2 line-clamp-1 font-semibold text-base text-gray-900 dark:text-gray-100">
          {example.title}
        </h3>

        <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-gray-600 text-sm dark:text-gray-400">
          {example.prompt}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {example.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-gray-100 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {tag}
            </Badge>
          ))}
          {example.tags.length > 2 && (
            <span className="text-gray-500 text-xs dark:text-gray-400">
              +{example.tags.length - 2}
            </span>
          )}
          {example.model && (
            <Badge variant="outline" className="ml-auto text-xs">
              {example.model}
            </Badge>
          )}
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full transition-all hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/30"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t('actions.copied')}
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              {t('actions.copyPrompt')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
