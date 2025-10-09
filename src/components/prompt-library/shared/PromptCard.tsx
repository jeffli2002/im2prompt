'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PromptExample, CategoryColor } from '@/types/prompt-library';
import { getPromptImageUrl, getCategoryColor } from '@/lib/prompt-library/image-utils';
import { useCopyToClipboard } from '@/hooks/prompt-library/useCopyToClipboard';

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
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl dark:hover:shadow-purple-500/20 group"
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <Image
          src={getPromptImageUrl(prompt.cloudinaryPublicId, 'card')}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {prompt.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              {t('prompts.featured')}
            </Badge>
          </div>
        )}

        <button
          onClick={handleCopy}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          aria-label={t('actions.copyPrompt')}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-semibold text-base mb-2 line-clamp-1 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {prompt.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
          {prompt.prompt}
        </p>
        
        <div className="flex flex-wrap gap-1.5 items-center">
          {prompt.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">+{prompt.tags.length - 2}</span>
          )}
          {prompt.model && (
            <Badge variant="outline" className="text-xs ml-auto">
              {prompt.model}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
