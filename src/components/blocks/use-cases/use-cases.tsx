import React from 'react';
import { Palette, Megaphone, Video, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
      description: 'Integrate prompt extraction into your apps with our powerful API.',
      features: [
        'RESTful API',
        'Batch processing',
        'Webhooks support',
        'SDK libraries',
      ],
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Built for Every Creator
          </h2>
          <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Whether you're an artist, marketer, or developer, im2Prompt adapts to your workflow
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((useCase, index) => (
            <Card
              key={useCase.title}
              className="relative overflow-hidden p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 100 + 200}ms`,
                animationDuration: '700ms',
              }}
            >
              {/* Gradient background */}
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${useCase.gradient} opacity-5 blur-3xl`} />

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${useCase.gradient} mb-6`}>
                <useCase.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-semibold mb-3">{useCase.title}</h3>
              <p className="text-muted-foreground mb-6">{useCase.description}</p>

              {/* Feature list */}
              <ul className="space-y-2">
                {useCase.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}