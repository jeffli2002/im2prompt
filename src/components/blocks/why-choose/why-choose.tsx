import { Button } from '@/components/ui/button';
import { ArrowLeftRight, ArrowRight, FolderOpen, Palette, Video, Wrench, Zap } from 'lucide-react';
import React from 'react';

const WhyChoose = () => {
  const features = [
    {
      icon: <ArrowLeftRight className="h-6 w-6" />,
      title: '🔄 Seamless AI Flow',
      description: 'AI Image/Text ⇄ Prompt ⇄ Image/Video',
      gradient: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-600',
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: '🎬 Sora 2 Cinematic Prompts',
      description: 'Story-driven, realistic video generation',
      gradient: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-600',
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: '🖌️ Multi-Model Support',
      description: 'Stable Diffusion, Flux, Midjourney, Sora 2',
      gradient: 'from-pink-500/20 to-pink-600/20',
      iconColor: 'text-pink-600',
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: '🛠️ AI Prompt Editing',
      description: 'Refine prompts with natural language',
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-600',
    },
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: '📂 Organized Library',
      description: 'Save, tag, remix, and reuse prompts',
      gradient: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-600',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: '⚡ Scalable & Fast',
      description: 'Built on modern, secure infrastructure',
      gradient: 'from-yellow-500/20 to-yellow-600/20',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="container relative">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl">
            Why Choose This Platform?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Everything you need to transform ideas into stunning visuals and videos
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative">
                {/* Icon */}
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center border border-border/50`}
                >
                  <span className={feature.iconColor}>{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="mb-2 font-semibold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Try it free button */}
        <div className="mt-12 text-center">
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
};

export { WhyChoose };
