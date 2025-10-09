'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PromptExample } from '@/types/prompt-library';
import { getPromptImageUrl } from '@/lib/prompt-library/image-utils';

interface PromptDetailModalProps {
  prompt: PromptExample | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptDetailModal({ prompt, isOpen, onClose }: PromptDetailModalProps) {
  const t = useTranslations('promptLibrary');
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {prompt.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <Image
              src={getPromptImageUrl(prompt.cloudinaryPublicId, 'full')}
              alt={prompt.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {prompt.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {prompt.model && (
              <Badge variant="outline" className="border-purple-300 dark:border-purple-700">
                {prompt.model}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                Prompt
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {prompt.prompt}
                </p>
              </div>
            </div>

            {prompt.negativePrompt && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Negative Prompt
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {prompt.negativePrompt}
                  </p>
                </div>
              </div>
            )}

            {prompt.metadata && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                {prompt.metadata.style && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Style</div>
                    <div className="font-medium text-sm">{prompt.metadata.style}</div>
                  </div>
                )}
                {prompt.metadata.aspectRatio && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Aspect Ratio</div>
                    <div className="font-medium text-sm">{prompt.metadata.aspectRatio}</div>
                  </div>
                )}
                {prompt.metadata.quality && (
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quality</div>
                    <div className="font-medium text-sm">{prompt.metadata.quality}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
            <Button variant="outline" onClick={onClose}>
              {t('actions.backToLibrary')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
