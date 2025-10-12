import { Upload, Wand2, Video, FolderOpen, ArrowRight, FileText, Image as ImageIcon, Sparkles, Camera } from 'lucide-react';
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Image/Text → Prompt",
      description: "Upload any image or write an idea — instantly extract structured, AI-ready prompts for models like Sora 2, Stable Diffusion, Flux, and Midjourney.",
      features: ["Image to prompt AI", "Text to prompt AI", "Prompt extractor"],
      icon: <Upload className="h-6 w-6" />,
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-600"
    },
    {
      number: "2",
      title: "Prompt Variations & Refinement",
      description: "Explore multiple prompt variations with automated negative prompts to filter unwanted elements. Refine prompts naturally: \"make this more cinematic,\" \"add cyberpunk mood.\"",
      features: ["AI prompt editor", "Negative prompt generator", "Creative prompt variations"],
      icon: <Wand2 className="h-6 w-6" />,
      gradient: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-600"
    },
    {
      number: "3",
      title: "Prompt → Image/Video",
      description: "Generate outputs across leading AI models:",
      features: [
        "HD visuals via Stable Diffusion, Flux, Midjourney",
        "Sora 2 – Long-form, cinematic-quality video with motion",
        "Advanced video generation with multiple AI models"
      ],
      icon: <Video className="h-6 w-6" />,
      gradient: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-600"
    },
    {
      number: "4",
      title: "Prompt Library & Collaboration",
      description: "Save, search, and tag your prompts. Collaborate with teams, remix prompts, and build your own personal style packs.",
      features: ["AI prompt library", "Team prompt collaboration", "Style packs"],
      icon: <FolderOpen className="h-6 w-6" />,
      gradient: "from-orange-500/20 to-orange-600/20",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden bg-muted/30">
      {/* Enhanced background with pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/30 to-muted/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-primary/4 to-transparent blur-3xl" />
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A seamless workflow from idea to creation
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-14 top-28 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent transition-opacity duration-300 group-hover:opacity-50" />
                )}

                <div className="group flex gap-8 p-6 rounded-2xl transition-all duration-300 hover:bg-muted/50 hover:shadow-lg hover:-translate-y-1 focus-within:bg-muted/50 focus-within:shadow-lg focus-within:-translate-y-1 cursor-pointer">
                  {/* Step number and icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} border border-border/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-focus-within:scale-110 group-focus-within:shadow-lg`}>
                        <span className={`${step.iconColor} transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110`}>{step.icon}</span>
                      </div>
                      <span className="absolute -top-2 -left-2 w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-focus-within:scale-110 group-focus-within:border-primary">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-semibold mb-3 transition-colors duration-300 group-hover:text-primary group-focus-within:text-primary">{step.title}</h3>
                    <p className="text-lg text-muted-foreground mb-4 transition-colors duration-300 group-hover:text-foreground group-focus-within:text-foreground">{step.description}</p>
                    
                    {/* Features list */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80 group-focus-within:text-foreground/80">
                          <ArrowRight className="h-4 w-4 text-primary/60 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1 group-focus-within:text-primary group-focus-within:translate-x-1" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Special content for step 3 */}
                    {step.number === "3" && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-purple-500/40 focus-within:scale-105 focus-within:shadow-md focus-within:border-purple-500/40 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <Camera className="h-5 w-5 text-purple-600 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-semibold transition-colors duration-300 group-hover:text-purple-600">Image Renders</span>
                          </div>
                          <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">HD visuals via multiple AI models</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-pink-500/40 focus-within:scale-105 focus-within:shadow-md focus-within:border-pink-500/40 cursor-pointer">
                          <div className="flex items-center gap-3 mb-2">
                            <Video className="h-5 w-5 text-pink-600 transition-transform duration-300 group-hover:scale-110" />
                            <span className="font-semibold transition-colors duration-300 group-hover:text-pink-600">Video Creation</span>
                          </div>
                          <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">Cinematic videos with Sora 2</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { HowItWorks };