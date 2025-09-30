import { Star, Upload, Sparkles, ArrowRight, Image, FileText, Wand2 } from 'lucide-react';
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
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Apple-style gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-primary/3 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="container relative">
        {/* Announcement pill - Apple style */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center rounded-full px-6 py-2 text-sm bg-black/5 dark:bg-white/5 backdrop-blur-lg border border-black/10 dark:border-white/10">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span className="font-medium">New: Support for FLUX 1.1 Pro & DALL-E 3</span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Main heading - Apple-style typography */}
          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="block font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.9]">
              <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                Extract AI Prompts
              </span>
            </span>
            <span className="block font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight mt-2">
              <span className="bg-gradient-to-b from-foreground/70 to-foreground/50 bg-clip-text text-transparent">
                from Any Image
              </span>
            </span>
          </h1>

          {/* Subheading - Clean and refined */}
          <p className="mt-8 text-xl sm:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Upload an image and instantly get the AI prompt that created it. 
            Refine, enhance, and regenerate stunning visuals with leading AI models.
          </p>

          {/* Workflow visualization - Minimalist Apple style */}
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="inline-flex items-center gap-3 p-2 rounded-2xl bg-black/5 dark:bg-white/5 backdrop-blur-lg">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background shadow-sm">
                <Image className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Image</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background shadow-sm">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Prompt</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background shadow-sm">
                <Wand2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">New Image</span>
              </div>
            </div>
          </div>

          {/* CTAs - Apple-style buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-6 text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <a href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="px-8 py-6 text-base font-medium border-muted-foreground/20 hover:bg-muted/50 transition-all duration-200"
            >
              <a href="#demo">
                Watch Demo
              </a>
            </Button>
          </div>

          {/* Social proof - Clean and minimal */}
          <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-4">
                <span className="-space-x-2 flex">
                  {finalReviews.avatars.slice(0, 4).map((avatar) => (
                    <Avatar key={avatar.src} className="size-10 border-2 border-background shadow-sm">
                      <AvatarImage src={avatar.src} alt={avatar.alt} />
                    </Avatar>
                  ))}
                </span>
                <div className="text-left">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} className="size-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Loved by {finalReviews.count}+ creators
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-8 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">50K+</p>
                  <p className="text-muted-foreground mt-1">Prompts extracted</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">99.9%</p>
                  <p className="text-muted-foreground mt-1">Uptime SLA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
