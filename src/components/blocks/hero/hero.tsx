import { ArrowRight, FileText, Image, Sparkles, Star, Upload, Video, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeroProps {
  heading?: string;
  description?: string;
  button?: {
    text: string;
    url: string;
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
  };
}

const Hero = ({ heading, description, button, reviews }: HeroProps) => {
  const t = useTranslations('hero');

  // 使用i18n翻译或传入的props
  const finalHeading = heading || t('heading');
  const finalDescription = description || t('description');
  const finalButton = button || {
    text: t('buttonText'),
    url: t('buttonUrl'),
  };
  const finalReviews = reviews || {
    count: 200,
    avatars: [
      {
        src: '/avatar/1.png',
        alt: t('avatarAlt', { index: 1 }),
      },
      {
        src: '/avatar/2.png',
        alt: t('avatarAlt', { index: 2 }),
      },
      {
        src: '/avatar/3.png',
        alt: t('avatarAlt', { index: 3 }),
      },
      {
        src: '/avatar/4.png',
        alt: t('avatarAlt', { index: 4 }),
      },
      {
        src: '/avatar/5.png',
        alt: t('avatarAlt', { index: 5 }),
      },
    ],
  };
  return (
    <section className="section-container relative flex min-h-[85vh] items-center overflow-hidden bg-muted/30">
      {/* Grey background with subtle pattern */}
      <div className="-z-10 absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/30 to-muted/20" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[1400px] w-[1400px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-primary/2 to-transparent blur-3xl" />
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-white/[0.02]" />
      </div>

      <div className="container relative py-20 md:py-24">
        {/* Light announcement pill */}
        <div className="fade-in slide-in-from-top-4 mb-12 flex animate-in justify-center duration-400">
          <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-6 py-3 text-gray-900 text-sm shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
            <Video className="mr-2 h-4 w-4" />
            <span className="font-semibold">New: Sora 2 Video Generation Now Available!</span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <h1 className="fade-in slide-in-from-bottom-4 animate-in delay-100 duration-700">
            <span className="font-bold text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              All-in-One AI Creation Flow — From{' '}
              <span className="animate-gradient bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Text to Prompt, Image, and Video
              </span>
            </span>
          </h1>

          <p className="fade-in slide-in-from-bottom-4 mx-auto mt-8 max-w-3xl animate-in text-lg text-muted-foreground delay-200 duration-700 md:text-xl">
            Seamlessly powered by{' '}
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text font-extrabold text-transparent">
              Nano Banana
            </span>{' '}
            for images and{' '}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text font-extrabold text-transparent">
              Sora 2
            </span>{' '}
            for videos.
          </p>

          {/* Key Highlights - Light Cards */}
          <div className="fade-in slide-in-from-bottom-4 mx-auto mt-10 grid max-w-4xl animate-in grid-cols-1 gap-4 delay-200 duration-400 md:grid-cols-3">
            <div className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <Video className="h-5 w-5 flex-shrink-0 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 text-sm dark:text-gray-100">
                Sora 2 Video Generation
              </span>
            </div>
            <div className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <Sparkles className="h-5 w-5 flex-shrink-0 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 text-sm dark:text-gray-100">
                Creative Flexibility
              </span>
            </div>
            <div className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
              <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-900 dark:text-gray-100" />
              <span className="font-semibold text-gray-900 text-sm dark:text-gray-100">
                Seamless Workflow
              </span>
            </div>
          </div>

          {/* Vibrant CTAs */}
          <div className="fade-in slide-in-from-bottom-4 mt-12 flex animate-in flex-col justify-center gap-4 delay-300 duration-400 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="transform border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-8 py-6 font-bold text-lg text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700"
            >
              <a href="/text-to-video">
                <Video className="mr-2 h-5 w-5" />
                Start Sora 2 Video
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="transform border-2 border-gray-300 bg-white px-8 py-6 font-bold text-gray-900 text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              <a href="/image-to-prompt">
                <Sparkles className="mr-2 h-5 w-5" />
                Try Image to Prompt
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
