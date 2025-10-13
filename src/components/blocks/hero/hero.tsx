import { Star, Upload, Sparkles, ArrowRight, Image, FileText, Wand2, Video } from 'lucide-react';
import React from 'react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

const Hero = ({
  heading,
  description,
  button,
  reviews,
}: HeroProps) => {
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
    <section className="section-container relative overflow-hidden bg-muted/30">
      {/* Grey background with subtle pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/30 to-muted/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-primary/2 to-transparent blur-3xl" />
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="container relative">
        {/* Light announcement pill */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-400">
          <div className="inline-flex items-center rounded-full px-6 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <Video className="mr-2 h-4 w-4" />
            <span className="font-semibold">New: Sora 2 Video Generation Now Available!</span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              All-in-One AI Creation Flow — From{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Text to Prompt, Image, and Video
              </span>
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Seamlessly powered by{' '}
            <span className="font-extrabold bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Nano Banana</span> for images and{' '}
            <span className="font-extrabold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">Sora 2</span> for videos.
          </p>


          {/* Key Highlights - Light Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400 delay-200">
            <div className="flex items-center gap-2 relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Video className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Sora 2 Video Generation</span>
            </div>
            <div className="flex items-center gap-2 relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <Sparkles className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Creative Flexibility</span>
            </div>
            <div className="flex items-center gap-2 relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all hover:scale-105">
              <ArrowRight className="h-5 w-5 text-gray-900 dark:text-gray-100 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Seamless Workflow</span>
            </div>
          </div>


          {/* Vibrant CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-400 delay-300">
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-2xl shadow-purple-500/50 border-0 transform hover:scale-105 transition-all duration-300"
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
              className="px-8 py-6 text-lg font-bold bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
