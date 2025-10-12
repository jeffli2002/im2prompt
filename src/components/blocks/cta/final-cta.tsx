import { ArrowRight, Video, Sparkles, Rocket } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

const FinalCTA = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent blur-3xl" />
        </div>
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Rocket className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Explore the Power of AI Generation from Prompt, Image to Video
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of creators using our platform to generate AI visuals, cinematic videos, and professional prompts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 shadow-xl hover:shadow-2xl rounded-2xl border-0"
            >
              <a href="/text-to-prompt">
                Start Free Today
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="px-10 py-6 text-lg font-semibold border-2 border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
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