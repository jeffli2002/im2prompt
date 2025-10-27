import { Code2, Palette, TrendingUp, Video } from 'lucide-react';
import React from 'react';

const WhoIsItFor = () => {
  const personas = [
    {
      icon: <Palette className="h-6 w-6" strokeWidth={1.5} />,
      title: 'Artists & Designers',
      emoji: '🎨',
      description: 'Generate unique AI visuals & concept art.',
      features: [
        'Extract prompts from reference images',
        'Create variations of existing artwork',
        'Build personal style libraries',
      ],
      gradient: 'from-purple-500 to-pink-500',
      bgPattern: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
    },
    {
      icon: <Video className="h-6 w-6" strokeWidth={1.5} />,
      title: 'Content Creators',
      emoji: '🎥',
      description: 'Create thumbnails, short videos, and cinematic content.',
      features: [
        'Generate video content with Sora 2',
        'Create engaging social media visuals',
        'Batch process multiple ideas quickly',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgPattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
    },
    {
      icon: <TrendingUp className="h-6 w-6" strokeWidth={1.5} />,
      title: 'Marketers & Agencies',
      emoji: '📈',
      description: 'Build ad creatives and campaign visuals faster.',
      features: [
        'Generate campaign-ready visuals',
        'A/B test different creative concepts',
        'Maintain brand consistency',
      ],
      gradient: 'from-green-500 to-emerald-500',
      bgPattern: 'radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)',
    },
    {
      icon: <Code2 className="h-6 w-6" strokeWidth={1.5} />,
      title: 'Developers & Startups',
      emoji: '💻',
      description: 'Build AI-powered applications with our advanced tools.',
      features: [
        'Custom integrations',
        'Scale with usage-based pricing',
        'Build AI-powered features',
      ],
      gradient: 'from-orange-500 to-red-500',
      bgPattern: 'radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-muted/30 py-24">
      <div className="container relative">
        <div className="mb-16 text-center">
          <h2 className="mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl">
            Who Is It For?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Built for creators, optimized for professionals
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="group hover:-translate-y-1 relative cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-2xl"
            >
              {/* Background pattern */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: persona.bgPattern }}
              />

              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />

              <div className="relative">
                {/* Icon with gradient background */}
                <div className="mb-6 flex items-start gap-4">
                  <div
                    className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                  >
                    <div className="text-white transition-transform duration-300 group-hover:rotate-6">
                      {persona.icon}
                    </div>
                  </div>
                  <span className="text-4xl opacity-20 transition-opacity duration-300 group-hover:opacity-40">
                    {persona.emoji}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mb-3 font-bold text-2xl transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/70 group-hover:bg-clip-text group-hover:text-transparent">
                  {persona.title}
                </h3>
                <p className="mb-4 text-lg text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/90">
                  {persona.description}
                </p>

                {/* Features list */}
                <ul className="space-y-2">
                  {persona.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${persona.gradient} mt-2 transition-transform duration-300 group-hover:scale-150`}
                      />
                      <span className="text-muted-foreground text-sm transition-colors duration-300 group-hover:text-foreground/80">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { WhoIsItFor };
