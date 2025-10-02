import { 
  Palette,
  Video,
  TrendingUp,
  Code2
} from 'lucide-react';
import React from 'react';

const WhoIsItFor = () => {
  const personas = [
    {
      icon: <Palette className="h-6 w-6" strokeWidth={1.5} />,
      title: "Artists & Designers",
      emoji: "🎨",
      description: "Generate unique AI visuals & concept art.",
      features: [
        "Extract prompts from reference images",
        "Create variations of existing artwork",
        "Build personal style libraries"
      ],
      gradient: "from-purple-500 to-pink-500",
      bgPattern: "radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)"
    },
    {
      icon: <Video className="h-6 w-6" strokeWidth={1.5} />,
      title: "Content Creators",
      emoji: "🎥",
      description: "Create thumbnails, short videos, and cinematic content.",
      features: [
        "Generate video content with Sora 2",
        "Create engaging social media visuals",
        "Batch process multiple ideas quickly"
      ],
      gradient: "from-blue-500 to-cyan-500",
      bgPattern: "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
    },
    {
      icon: <TrendingUp className="h-6 w-6" strokeWidth={1.5} />,
      title: "Marketers & Agencies",
      emoji: "📈",
      description: "Build ad creatives and campaign visuals faster.",
      features: [
        "Generate campaign-ready visuals",
        "A/B test different creative concepts",
        "Maintain brand consistency"
      ],
      gradient: "from-green-500 to-emerald-500",
      bgPattern: "radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)"
    },
    {
      icon: <Code2 className="h-6 w-6" strokeWidth={1.5} />,
      title: "Developers & Startups",
      emoji: "💻",
      description: "Embed prompt-to-image/video APIs into your apps.",
      features: [
        "Access powerful API endpoints",
        "Scale with usage-based pricing",
        "Build AI-powered features"
      ],
      gradient: "from-orange-500 to-red-500",
      bgPattern: "radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-muted/30">
      <div className="container relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Who Is It For?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for creators, optimized for professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* Background pattern */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: persona.bgPattern }}
              />
              
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Icon with gradient background */}
                <div className="flex items-start gap-4 mb-6">
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white group-hover:rotate-6 transition-transform duration-300">
                      {persona.icon}
                    </div>
                  </div>
                  <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                    {persona.emoji}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/70 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {persona.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-4 group-hover:text-muted-foreground/90 transition-colors duration-300">
                  {persona.description}
                </p>
                
                {/* Features list */}
                <ul className="space-y-2">
                  {persona.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${persona.gradient} mt-2 group-hover:scale-150 transition-transform duration-300`} />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{feature}</span>
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