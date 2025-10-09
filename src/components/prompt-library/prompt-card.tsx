'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PromptExample } from '@/types/prompt-library';
import { getPromptImageUrl } from '@/lib/prompt-library/image-utils';

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
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] dark:hover:shadow-purple-500/20"
      onClick={onClick}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg">
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
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              {t('prompts.featured')}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-semibold text-base mb-2 line-clamp-1 text-gray-900 dark:text-gray-100">
          {example.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
          {example.prompt}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4 items-center">
          {example.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {tag}
            </Badge>
          ))}
          {example.tags.length > 2 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">+{example.tags.length - 2}</span>
          )}
          {example.model && (
            <Badge variant="outline" className="text-xs ml-auto">
              {example.model}
            </Badge>
          )}
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 dark:hover:border-purple-700 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {t('actions.copied')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              {t('actions.copyPrompt')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
