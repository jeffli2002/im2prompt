'use client';

import React, { useState } from 'react';
import { Upload, ArrowRight, Copy, Download, RefreshCw, Sparkles, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'upload',
      title: 'Upload Image',
      description: 'Drag and drop or click to upload any AI-generated image',
      icon: Upload,
    },
    {
      id: 'extract',
      title: 'Extract Prompt',
      description: 'Our AI analyzes and extracts the original prompt',
      icon: Sparkles,
    },
    {
      id: 'refine',
      title: 'Refine & Generate',
      description: 'Edit the prompt and regenerate with your preferred AI model',
      icon: RefreshCw,
    },
  ];

  const examplePrompt = `A serene Japanese garden at sunset, cherry blossoms in full bloom, 
traditional wooden bridge over a koi pond, soft pink and orange sky, 
photorealistic, highly detailed, 8k resolution, cinematic lighting`;

  const variations = [
    'Add more vibrant colors and dramatic lighting',
    'Make it winter scene with snow coverage',
    'Transform to cyberpunk style with neon lights',
  ];

  return (
    <section id="demo" className="py-32 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-muted/20" />
      
      <div className="container relative">
        {/* Enhanced section header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              See It In Action
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 max-w-3xl mx-auto leading-relaxed">
            Experience the complete workflow from image to prompt to new creation.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">Watch the magic happen in real-time.</span>
          </p>
        </div>

        {/* Enhanced workflow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer group
                ${activeStep === index 
                  ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-105' 
                  : 'border-border/50 hover:border-primary/50 hover:bg-background/80 hover:shadow-xl'
                }
              `}
              onClick={() => setActiveStep(index)}
              style={{
                animationDelay: `${index * 100 + 200}ms`,
              }}
            >
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 hidden md:block z-10">
                  <div className="p-2 rounded-full bg-background border border-border/50 shadow-lg">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                </div>
              )}
              
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>
              
              <div className={`inline-flex p-4 rounded-2xl mb-6 transition-all duration-300 ${
                activeStep === index 
                  ? 'bg-primary/15 shadow-lg' 
                  : 'bg-muted/50 group-hover:bg-primary/10'
              }`}>
                <step.icon className={`h-7 w-7 transition-colors duration-300 ${
                  activeStep === index ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                }`} />
              </div>
              
              <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground/80 leading-relaxed group-hover:text-muted-foreground transition-colors">
                {step.description}
              </p>
              
              {/* Active state indicator */}
              {activeStep === index && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Enhanced interactive demo area */}
        <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Enhanced left side - Image upload/preview */}
            <div className="p-10 bg-gradient-to-br from-muted/20 to-muted/40 border-r border-border/50">
              <div className="aspect-square relative rounded-3xl overflow-hidden bg-background border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 transition-all duration-300 shadow-inner">
                {activeStep === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="p-4 rounded-2xl bg-primary/10 mb-6">
                      <Upload className="h-16 w-16 text-primary" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Drop your image here</p>
                    <p className="text-sm text-muted-foreground mb-6">PNG, JPG up to 4MB</p>
                    <Button variant="outline" size="lg" className="rounded-xl border-2 hover:border-primary/50">
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 inline-block">
                          <Image className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-white font-semibold text-lg">Sample AI Image</p>
                        <p className="text-white/80 text-sm mt-1">Ready for analysis</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced right side - Prompt extraction/editing */}
            <div className="p-10">
              <div className="space-y-8">
                {activeStep === 0 && (
                  <div className="text-center py-16">
                    <div className="p-4 rounded-2xl bg-muted/30 inline-block mb-6">
                      <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">Upload an image to begin the magic</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Our AI will analyze and extract the prompt</p>
                  </div>
                )}

                {activeStep >= 1 && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl">Extracted Prompt</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-4 py-2 rounded-xl">
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Extracted
                        </Badge>
                      </div>
                      <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 shadow-inner">
                        <p className="text-base leading-relaxed font-medium">{examplePrompt}</p>
                        <div className="flex gap-3 mt-6">
                          <Button size="sm" variant="ghost" className="rounded-xl border border-border/50 hover:border-primary/50">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Prompt
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-xl border border-border/50 hover:border-primary/50">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>

                    {activeStep >= 2 && (
                      <>
                        <div>
                          <h3 className="font-bold text-xl mb-6">Prompt Variations</h3>
                          <div className="space-y-4">
                            {variations.map((variation, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-2xl border border-border/50 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-all duration-200 group"
                              >
                                <p className="text-base font-medium group-hover:text-primary transition-colors">{variation}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-xl mb-6">Generate with</h3>
                          <Tabs defaultValue="midjourney" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/30 p-1">
                              <TabsTrigger value="midjourney" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Midjourney</TabsTrigger>
                              <TabsTrigger value="stable" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Stable Diffusion</TabsTrigger>
                              <TabsTrigger value="flux" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">FLUX</TabsTrigger>
                              <TabsTrigger value="dalle" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">DALL-E</TabsTrigger>
                            </TabsList>
                            <TabsContent value="midjourney" className="mt-6">
                              <Button className="w-full py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                Generate with Midjourney
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced CTA */}
        <div className="text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <p className="text-xl text-muted-foreground/80 mb-6 font-medium">Ready to extract prompts from your images?</p>
          <Button size="lg" className="px-10 py-6 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            Try Image to Prompt
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground/60 mt-4">No credit card required • Start immediately</p>
        </div>
      </div>
    </section>
  );
}