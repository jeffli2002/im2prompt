'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFeaturedPrompts } from '@/lib/prompt-library';
import { ArrowRight, Check, Copy, ExternalLink, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function PromptShowcase() {
  const t = useTranslations('promptLibrary');

  // Get exactly 3 featured prompts
  const featuredPrompts = getFeaturedPrompts(3);

  if (featuredPrompts.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-32">
      {/* Enhanced Apple-style gradient background */}
      <div className="-z-10 absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/85" />
        {/* Gradient orbs for depth */}
        <div className="absolute top-20 left-1/3 h-[800px] w-[800px]">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/8 via-purple-500/4 to-transparent blur-3xl" />
        </div>
        <div className="absolute right-1/3 bottom-20 h-[600px] w-[600px]">
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/6 via-pink-500/3 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="container relative">
        {/* Section Header */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          {/* Badge pill */}
          <div className="fade-in slide-in-from-top-4 mb-8 flex animate-in justify-center duration-700">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-6 py-2 text-sm backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">Powered by Nano Banana (Gemini 2.5 Flash)</span>
            </div>
          </div>

          <h2 className="fade-in slide-in-from-bottom-4 mb-6 animate-in font-bold text-5xl delay-100 duration-700 sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              See What's Possible
            </span>
          </h2>

          <p className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in text-muted-foreground/80 text-xl leading-relaxed delay-200 duration-700 sm:text-2xl">
            Real examples from our prompt library. Professional quality prompts that you can copy
            and use instantly.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">
              Start creating stunning AI images in seconds.
            </span>
          </p>
        </div>

        {/* Hero Grid Layout - Asymmetric for visual interest */}
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Main Featured Card - Left Side (60% width) */}
            {featuredPrompts[0] && (
              <div className="fade-in slide-in-from-left-8 animate-in delay-300 duration-700 lg:col-span-7">
                <FeaturedPromptCard prompt={featuredPrompts[0]} featured={true} />
              </div>
            )}

            {/* Secondary Cards - Right Side (40% width) */}
            <div className="space-y-8 lg:col-span-5">
              {featuredPrompts[1] && (
                <div className="fade-in slide-in-from-right-8 animate-in delay-400 duration-700">
                  <FeaturedPromptCard prompt={featuredPrompts[1]} />
                </div>
              )}
              {featuredPrompts[2] && (
                <div className="fade-in slide-in-from-right-8 animate-in delay-500 duration-700">
                  <FeaturedPromptCard prompt={featuredPrompts[2]} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="fade-in slide-in-from-bottom-4 mt-20 animate-in text-center delay-600 duration-700">
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-6 font-semibold text-lg shadow-xl transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl"
            >
              <Link href="/prompt-library">
                <Wand2 className="mr-2 h-5 w-5" />
                Browse Full Library
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-2xl border-2 border-muted-foreground/30 px-10 py-6 font-semibold text-lg backdrop-blur-sm transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/50"
            >
              <Link href="/image-to-prompt">Try Image to Prompt</Link>
            </Button>
          </div>
          <p className="mt-6 text-muted-foreground/60 text-sm">
            50+ curated prompts across 6 categories. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

// Enhanced Prompt Card Component
function FeaturedPromptCard({ prompt, featured = false }: { prompt: any; featured?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptPreview =
    prompt.prompt.length > 120 ? `${prompt.prompt.slice(0, 120)}...` : prompt.prompt;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/80 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
      {/* Image Container */}
      <div
        className={`relative overflow-hidden bg-muted/30 ${featured ? 'aspect-[4/3]' : 'aspect-video'}`}
      >
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes={featured ? '(max-width: 1024px) 100vw, 60vw' : '(max-width: 1024px) 100vw, 40vw'}
          priority={featured}
        />
        {/* AI Generated Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-black/70">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Generated
          </Badge>
        </div>
        {/* Model Badge */}
        {prompt.model && (
          <div className="absolute top-4 right-4">
            <Badge className="border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              {prompt.model}
            </Badge>
          </div>
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className={`${featured ? 'p-8' : 'p-6'}`}>
        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {prompt.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="bg-muted text-xs hover:bg-muted/80">
              {tag}
            </Badge>
          ))}
          {prompt.metadata?.style && (
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              {prompt.metadata.style}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3
          className={`mb-3 font-bold transition-colors group-hover:text-primary ${featured ? 'text-2xl' : 'text-xl'}`}
        >
          {prompt.title}
        </h3>

        {/* Prompt Text */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Prompt
            </span>
            {prompt.prompt.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="font-medium text-primary text-xs transition-colors hover:text-primary/80"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <p
            className={`rounded-xl border border-border/30 bg-muted/30 p-4 font-mono text-muted-foreground/90 text-sm leading-relaxed ${!expanded && 'line-clamp-3'}`}
          >
            {expanded ? prompt.prompt : promptPreview}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            size={featured ? 'default' : 'sm'}
            className="flex-1 transition-all duration-300 hover:border-purple-300 hover:bg-purple-50 dark:hover:border-purple-700 dark:hover:bg-purple-950/30"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </>
            )}
          </Button>
          <Button
            asChild
            size={featured ? 'default' : 'sm'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 hover:from-purple-700 hover:to-pink-700"
          >
            <Link href="/text-to-image">
              <Wand2 className="mr-2 h-4 w-4" />
              Generate
            </Link>
          </Button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
