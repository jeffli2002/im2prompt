import { ArrowLeftRight, Video, Palette, Wrench, FolderOpen, Zap, ArrowRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

const WhyChoose = () => {
  const features = [
    {
      icon: <ArrowLeftRight className="h-6 w-6" />,
      title: "🔄 Seamless AI Flow",
      description: "AI Image/Text ⇄ Prompt ⇄ Image/Video",
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "🎬 Sora 2 Cinematic Prompts",
      description: "Story-driven, realistic video generation",
      gradient: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-600"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "🖌️ Multi-Model Support",
      description: "Stable Diffusion, Flux, Midjourney, Veo3, Sora 2",
      gradient: "from-pink-500/20 to-pink-600/20",
      iconColor: "text-pink-600"
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "🛠️ AI Prompt Editing",
      description: "Refine prompts with natural language",
      gradient: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-600"
    },
    {
      icon: <FolderOpen className="h-6 w-6" />,
      title: "📂 Organized Library",
      description: "Save, tag, remix, and reuse prompts",
      gradient: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-600"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "⚡ Scalable & Fast",
      description: "Built on modern, secure infrastructure",
      gradient: "from-yellow-500/20 to-yellow-600/20",
      iconColor: "text-yellow-600"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Why Choose This Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform ideas into stunning visuals and videos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} border border-border/50 flex items-center justify-center mb-4`}>
                  <span className={feature.iconColor}>{feature.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Try it free button */}
        <div className="text-center mt-12">
          <Button 
            asChild 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <a href="/image-to-prompt">
              Try It Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export { WhyChoose };