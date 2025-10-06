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
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Enhanced Apple-style gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/85" />
        {/* Primary gradient orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-primary/4 to-transparent blur-3xl" />
        </div>
        {/* Secondary accent gradient */}
        <div className="absolute top-40 right-1/4 w-[800px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-radial from-blue-500/6 via-blue-500/3 to-transparent blur-2xl" />
        </div>
        {/* Tertiary accent gradient */}
        <div className="absolute bottom-20 left-1/4 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-purple-500/2 to-transparent blur-2xl" />
        </div>
      </div>

      <div className="container relative">
        {/* Announcement pill - Apple style */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center rounded-full px-6 py-2 text-sm bg-black/5 dark:bg-white/5 backdrop-blur-lg border border-black/10 dark:border-white/10">
            <Video className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium">New: Sora 2 Video Generation Now Available!</span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              ✨ Turn Your Ideas into{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Cinematic Reality
              </span>
              {' '}with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sora 2 Video & Nano Banana Image
              </span>
            </span>
          </h1>


          {/* Key Highlights */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <Video className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Sora 2 Video Generation</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Creative Flexibility</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Seamless Workflow</span>
            </div>
          </div>


          {/* Enhanced CTAs - Premium Apple-style buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <Button 
              asChild 
              size="lg" 
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-2xl rounded-2xl border-0 relative overflow-hidden group"
            >
              <a href="/text-to-video">
                <Video className="mr-2 h-5 w-5" />
                Start Sora 2 Video
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="px-10 py-6 text-lg font-semibold border-2 border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
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
