import React from 'react';
import { Palette, Megaphone, Video, Code, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function UseCases() {
  const cases = [
    {
      icon: Palette,
      title: 'AI Artists & Designers',
      description: 'Reverse-engineer stunning artwork to understand prompt techniques and create variations.',
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
      description: 'Generate eye-catching thumbnails and social media visuals that drive engagement.',
      features: [
        'YouTube thumbnails',
        'Instagram posts',
        'TikTok covers',
        'Story templates',
      ],
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
    <section className="py-32 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-muted/20" />
      
      <div className="container relative">
        {/* Enhanced section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Built for Every Creator
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 max-w-3xl mx-auto leading-relaxed">
            Whether you're an artist, marketer, or developer, im2Prompt adapts to your workflow.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">Discover how different creators use our platform.</span>
          </p>
        </div>

        {/* Enhanced use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {cases.map((useCase, index) => (
            <Card
              key={useCase.title}
              className="relative overflow-hidden p-10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 group border-border/50 hover:border-primary/50"
              style={{
                animationDelay: `${index * 100 + 200}ms`,
                animationDuration: '700ms',
              }}
            >
              {/* Enhanced gradient background */}
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${useCase.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

              {/* Enhanced icon */}
              <div className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br ${useCase.gradient} mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <useCase.icon className="h-6 w-6 text-white" />
              </div>

              {/* Enhanced content */}
              <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                {useCase.title}
              </h3>
              <p className="text-muted-foreground/80 mb-8 text-lg leading-relaxed group-hover:text-muted-foreground transition-colors duration-300">
                {useCase.description}
              </p>

              {/* Enhanced feature list */}
              <ul className="space-y-3">
                {useCase.features.map((feature, featureIndex) => (
                  <li key={feature} className="flex items-center text-base group-hover:text-foreground transition-colors duration-300">
                    <div className="w-2 h-2 rounded-full bg-primary mr-4 group-hover:bg-primary/80 transition-colors duration-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Subtle hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
            </Card>
          ))}
        </div>

        {/* Try it free button */}
        <div className="text-center mt-16">
          <Button 
            asChild 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <a href="/image-to-prompt">
              Try Image to Prompt
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}