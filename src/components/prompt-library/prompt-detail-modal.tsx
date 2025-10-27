'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getPromptImageUrl } from '@/lib/prompt-library/image-utils';
import type { PromptExample } from '@/types/prompt-library';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';

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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 font-bold text-2xl">{prompt.title}</DialogTitle>
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
            {prompt.tags.map((tag) => (
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
              <h3 className="mb-2 font-semibold text-gray-600 text-sm dark:text-gray-400">
                Prompt
              </h3>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed dark:text-gray-200">
                  {prompt.prompt}
                </p>
              </div>
            </div>

            {prompt.negativePrompt && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-600 text-sm dark:text-gray-400">
                  Negative Prompt
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-gray-800 text-sm leading-relaxed dark:text-gray-200">
                    {prompt.negativePrompt}
                  </p>
                </div>
              </div>
            )}

            {prompt.metadata && (
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                {prompt.metadata.style && (
                  <div>
                    <div className="mb-1 text-gray-600 text-xs dark:text-gray-400">Style</div>
                    <div className="font-medium text-sm">{prompt.metadata.style}</div>
                  </div>
                )}
                {prompt.metadata.aspectRatio && (
                  <div>
                    <div className="mb-1 text-gray-600 text-xs dark:text-gray-400">
                      Aspect Ratio
                    </div>
                    <div className="font-medium text-sm">{prompt.metadata.aspectRatio}</div>
                  </div>
                )}
                {prompt.metadata.quality && (
                  <div>
                    <div className="mb-1 text-gray-600 text-xs dark:text-gray-400">Quality</div>
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
            <Button variant="outline" onClick={onClose}>
              {t('actions.backToLibrary')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
