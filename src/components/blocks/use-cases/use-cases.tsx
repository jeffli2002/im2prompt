import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Code, Megaphone, Palette, Video } from 'lucide-react';
import React from 'react';

export function UseCases() {
  const cases = [
    {
      icon: Palette,
      title: 'AI Artists & Designers',
      description:
        'Reverse-engineer stunning artwork to understand prompt techniques and create variations.',
      features: [
        'Analyze successful prompts',
        'Learn prompt engineering',
        'Create style variations',
        'Build prompt libraries',
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Megaphone,
      title: 'Marketing Teams',
      description: 'Extract and replicate successful ad creatives for consistent brand campaigns.',
      features: [
        'Maintain brand consistency',
        'Scale creative production',
        'A/B test variations',
        'Share team templates',
      ],
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Video,
      title: 'Content Creators',
      description:
        'Generate eye-catching thumbnails and social media visuals that drive engagement.',
      features: ['YouTube thumbnails', 'Instagram posts', 'TikTok covers', 'Story templates'],
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Code,
      title: 'Developers',
      description: 'Build amazing applications with our AI-powered prompt generation tools.',
      features: [
        'Custom integrations',
        'Batch processing',
        'Advanced workflows',
        'Developer tools',
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="relative py-32">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-muted/20" />

      <div className="container relative">
        {/* Enhanced section header */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <h2 className="fade-in slide-in-from-bottom-4 mb-6 animate-in font-bold text-5xl duration-700 sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Built for Every Creator
            </span>
          </h2>
          <p className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in text-muted-foreground/80 text-xl leading-relaxed delay-100 duration-700 sm:text-2xl">
            Whether you're an artist, marketer, or developer, im2Prompt adapts to your workflow.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">
              Discover how different creators use our platform.
            </span>
          </p>
        </div>

        {/* Enhanced use cases grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {cases.map((useCase, index) => (
            <Card
              key={useCase.title}
              className="hover:-translate-y-2 fade-in slide-in-from-bottom-4 group relative animate-in overflow-hidden border-border/50 p-10 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl"
              style={{
                animationDelay: `${index * 100 + 200}ms`,
                animationDuration: '700ms',
              }}
            >
              {/* Enhanced gradient background */}
              <div
                className={`absolute top-0 right-0 h-80 w-80 bg-gradient-to-br ${useCase.gradient} opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
              />

              {/* Enhanced icon */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${useCase.gradient} mb-8 shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <useCase.icon className="h-6 w-6 text-white" />
              </div>

              {/* Enhanced content */}
              <h3 className="mb-4 font-bold text-3xl transition-colors duration-300 group-hover:text-primary">
                {useCase.title}
              </h3>
              <p className="mb-8 text-lg text-muted-foreground/80 leading-relaxed transition-colors duration-300 group-hover:text-muted-foreground">
                {useCase.description}
              </p>

              {/* Enhanced feature list */}
              <ul className="space-y-3">
                {useCase.features.map((feature, featureIndex) => (
                  <li
                    key={feature}
                    className="flex items-center text-base transition-colors duration-300 group-hover:text-foreground"
                  >
                    <div className="mr-4 h-2 w-2 rounded-full bg-primary transition-colors duration-300 group-hover:bg-primary/80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subtle hover effect overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Card>
          ))}
        </div>

        {/* Try it free button */}
        <div className="mt-16 text-center">
          <Button
            asChild
            size="lg"
            className="px-8 py-6 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <a href="/image-to-prompt">Try Image to Prompt</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
