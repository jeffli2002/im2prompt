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
    <section className="py-32 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/98 to-muted/20" />
      
      <div className="container relative">
        {/* Enhanced section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 max-w-3xl mx-auto leading-relaxed">
            Professional tools to extract, enhance, and regenerate AI prompts at scale. 
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">Built for creators who demand excellence.</span>
          </p>
        </div>

        {/* Enhanced features grid - Apple-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
      className="group relative p-8 rounded-3xl bg-background/80 backdrop-blur-sm border border-border/50 hover:border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-2"
      style={{
        animationDelay: `${index * 100}ms`,
        animationDuration: '700ms',
      }}
    >
      {/* Enhanced icon with gradient background */}
      <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-lg group-hover:shadow-xl">
        <div className="text-primary group-hover:scale-110 transition-transform duration-300">{icon}</div>
      </div>

      {/* Enhanced content */}
      <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-base text-muted-foreground/80 leading-relaxed group-hover:text-muted-foreground transition-colors">
        {description}
      </p>

      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
