'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, Copy, Check, Wand2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeaturedPrompts } from '@/lib/prompt-library';

export function PromptShowcase() {
  const t = useTranslations('promptLibrary');
  
  // Get exactly 3 featured prompts
  const featuredPrompts = getFeaturedPrompts(3);

  if (featuredPrompts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Enhanced Apple-style gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/85" />
        {/* Gradient orbs for depth */}
        <div className="absolute top-20 left-1/3 w-[800px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/8 via-purple-500/4 to-transparent blur-3xl" />
        </div>
        <div className="absolute bottom-20 right-1/3 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-radial from-pink-500/6 via-pink-500/3 to-transparent blur-3xl" />
        </div>
      </div>
      
      <div className="container relative">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          {/* Badge pill */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center rounded-full px-6 py-2 text-sm bg-black/5 dark:bg-white/5 backdrop-blur-lg border border-black/10 dark:border-white/10">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">Powered by Nano Banana (Gemini 2.5 Flash)</span>
            </div>
          </div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              See What's Possible
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 max-w-3xl mx-auto leading-relaxed">
            Real examples from our prompt library. Professional quality prompts that you can copy and use instantly.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">Start creating stunning AI images in seconds.</span>
          </p>
        </div>

        {/* Hero Grid Layout - Asymmetric for visual interest */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Featured Card - Left Side (60% width) */}
            {featuredPrompts[0] && (
              <div className="lg:col-span-7 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
                <FeaturedPromptCard prompt={featuredPrompts[0]} featured={true} />
              </div>
            )}

            {/* Secondary Cards - Right Side (40% width) */}
            <div className="lg:col-span-5 space-y-8">
              {featuredPrompts[1] && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-400">
                  <FeaturedPromptCard prompt={featuredPrompts[1]} />
                </div>
              )}
              {featuredPrompts[2] && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
                  <FeaturedPromptCard prompt={featuredPrompts[2]} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-2xl"
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
              className="px-10 py-6 text-lg font-semibold border-2 border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
            >
              <Link href="/image-to-prompt">
                Try Image to Prompt
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground/60 mt-6">50+ curated prompts across 6 categories. No credit card required.</p>
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

  const promptPreview = prompt.prompt.length > 120 ? prompt.prompt.slice(0, 120) + '...' : prompt.prompt;

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
      {/* Image Container */}
      <div className={`relative overflow-hidden bg-muted/30 ${featured ? 'aspect-[4/3]' : 'aspect-video'}`}>
        <Image
          src={prompt.imageUrl}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes={featured ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 100vw, 40vw"}
          priority={featured}
        />
        {/* AI Generated Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20 hover:bg-black/70">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
        </div>
        {/* Model Badge */}
        {prompt.model && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700">
              {prompt.model}
            </Badge>
          </div>
        )}
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className={`${featured ? 'p-8' : 'p-6'}`}>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {prompt.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted hover:bg-muted/80">
              {tag}
            </Badge>
          ))}
          {prompt.metadata?.style && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {prompt.metadata.style}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-bold mb-3 group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
          {prompt.title}
        </h3>

        {/* Prompt Text */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prompt</span>
            {prompt.prompt.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
          <p className={`text-sm leading-relaxed text-muted-foreground/90 bg-muted/30 rounded-xl p-4 border border-border/30 font-mono ${!expanded && 'line-clamp-3'}`}>
            {expanded ? prompt.prompt : promptPreview}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            size={featured ? "default" : "sm"}
            className="flex-1 hover:bg-purple-50 hover:border-purple-300 dark:hover:bg-purple-950/30 dark:hover:border-purple-700 transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </>
            )}
          </Button>
          <Button
            asChild
            size={featured ? "default" : "sm"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            <Link href="/text-to-image">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </Link>
          </Button>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}
