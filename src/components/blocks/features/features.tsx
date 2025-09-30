import { cn } from '@/lib/utils';
import {
  Sparkles,
  Image,
  Wand2,
  Layers,
  Globe,
  Zap,
  Shield,
  Users,
} from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'AI Prompt Extraction',
      description: 'Advanced AI models analyze images and extract the prompts that created them with high accuracy.',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: 'Multiple AI Models',
      description: 'Support for Midjourney, Stable Diffusion, FLUX, DALL-E 3, and more AI generation models.',
      icon: <Layers className="h-6 w-6" />,
    },
    {
      title: 'Instant Generation',
      description: 'Preview and regenerate images instantly with extracted or refined prompts.',
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: 'Smart Variations',
      description: 'AI generates multiple prompt variations and negative prompts for better results.',
      icon: <Wand2 className="h-6 w-6" />,
    },
    {
      title: 'Batch Processing',
      description: 'Upload and extract prompts from multiple images at once for efficient workflows.',
      icon: <Image className="h-6 w-6" />,
    },
    {
      title: 'Global Style Library',
      description: 'Save and apply custom style packs across all your prompt generations.',
      icon: <Globe className="h-6 w-6" />,
    },
    {
      title: 'Team Collaboration',
      description: 'Share prompt libraries and collaborate with your team in real-time.',
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: 'Enterprise Security',
      description: 'SOC2 compliant with end-to-end encryption and secure API access.',
      icon: <Shield className="h-6 w-6" />,
    },
  ];
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Professional tools to extract, enhance, and regenerate AI prompts at scale
          </p>
        </div>

        {/* Features grid - Apple-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className="group relative p-6 rounded-2xl bg-background border hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{
        animationDelay: `${index * 100}ms`,
        animationDuration: '700ms',
      }}
    >
      {/* Icon with gradient background */}
      <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
        <div className="text-primary">{icon}</div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};
