import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, Sparkles, Video } from 'lucide-react';
import React from 'react';

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Enhanced gradient background */}
      <div className="-z-10 absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[800px] w-[1400px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4">
              <Rocket className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="mb-6 font-bold text-4xl tracking-tight sm:text-5xl">
            Explore the Power of AI Generation from Prompt, Image to Video
          </h2>

          {/* Description */}
          <p className="mx-auto mb-8 max-w-3xl text-muted-foreground text-xl">
            Join thousands of creators using our platform to generate AI visuals, cinematic videos,
            and professional prompts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl border-0 bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-6 font-semibold text-lg text-white shadow-xl transition-all duration-300 hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl"
            >
              <a href="/text-to-prompt">Start Free Today</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-2xl border-2 border-muted-foreground/30 px-10 py-6 font-semibold text-lg backdrop-blur-sm transition-all duration-300 hover:border-muted-foreground/50 hover:bg-muted/50"
            >
              <a href="/text-to-video">
                <Video className="mr-2 h-5 w-5" />
                Generate with Sora 2
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FinalCTA };
