import { cn } from '@/lib/utils';
import { Globe, Image, Layers, Shield, Sparkles, Users, Wand2, Zap } from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'AI Prompt Extraction',
      description:
        'Advanced AI models analyze images and extract the prompts that created them with high accuracy.',
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: 'Multiple AI Models',
      description:
        'Support for Midjourney, Stable Diffusion, FLUX, DALL-E 3, and more AI generation models.',
      icon: <Layers className="h-6 w-6" />,
    },
    {
      title: 'Instant Generation',
      description: 'Preview and regenerate images instantly with extracted or refined prompts.',
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: 'Smart Variations',
      description:
        'AI generates multiple prompt variations and negative prompts for better results.',
      icon: <Wand2 className="h-6 w-6" />,
    },
    {
      title: 'Batch Processing',
      description:
        'Upload and extract prompts from multiple images at once for efficient workflows.',
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
      description: 'SOC2 compliant with end-to-end encryption and secure data handling.',
      icon: <Shield className="h-6 w-6" />,
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
              Everything You Need
            </span>
          </h2>
          <p className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in text-muted-foreground/80 text-xl leading-relaxed delay-100 duration-700 sm:text-2xl">
            Professional tools to extract, enhance, and regenerate AI prompts at scale.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">
              Built for creators who demand excellence.
            </span>
          </p>
        </div>

        {/* Enhanced features grid - Apple-style cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
      className="group fade-in slide-in-from-bottom-4 hover:-translate-y-2 relative animate-in rounded-3xl border border-border/50 bg-background/80 p-8 backdrop-blur-sm transition-all duration-500 hover:border-border hover:shadow-2xl hover:shadow-primary/10"
      style={{
        animationDelay: `${index * 100}ms`,
        animationDuration: '700ms',
      }}
    >
      {/* Enhanced icon with gradient background */}
      <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 p-4 shadow-lg transition-all duration-300 group-hover:from-primary/25 group-hover:via-primary/20 group-hover:to-primary/10 group-hover:shadow-xl">
        <div className="text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>

      {/* Enhanced content */}
      <h3 className="mb-3 font-bold text-xl transition-colors group-hover:text-primary">{title}</h3>
      <p className="text-base text-muted-foreground/80 leading-relaxed transition-colors group-hover:text-muted-foreground">
        {description}
      </p>

      {/* Subtle hover effect overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};
