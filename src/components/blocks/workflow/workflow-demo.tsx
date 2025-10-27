'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Copy, Download, Image, RefreshCw, Sparkles, Upload } from 'lucide-react';
import React, { useState } from 'react';

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
    <section id="demo" className="relative py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-muted/20" />

      <div className="container relative">
        {/* Enhanced section header */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <h2 className="fade-in slide-in-from-bottom-4 mb-6 animate-in font-bold text-5xl duration-700 sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              See It In Action
            </span>
          </h2>
          <p className="fade-in slide-in-from-bottom-4 mx-auto max-w-3xl animate-in text-muted-foreground/80 text-xl leading-relaxed delay-100 duration-700 sm:text-2xl">
            Experience the complete workflow from image to prompt to new creation.
            <br className="hidden sm:block" />
            <span className="text-muted-foreground/70">Watch the magic happen in real-time.</span>
          </p>
        </div>

        {/* Enhanced workflow steps */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`group relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-500 ${
                activeStep === index
                  ? 'scale-105 border-primary bg-primary/5 shadow-2xl shadow-primary/20'
                  : 'border-border/50 hover:border-primary/50 hover:bg-background/80 hover:shadow-xl'
              }
              `}
              onClick={() => setActiveStep(index)}
              style={{
                animationDelay: `${index * 100 + 200}ms`,
              }}
            >
              {index < steps.length - 1 && (
                <div className="-right-4 -translate-y-1/2 absolute top-1/2 z-10 hidden transform md:block">
                  <div className="rounded-full border border-border/50 bg-background p-2 shadow-lg">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                </div>
              )}

              {/* Step number */}
              <div className="-top-3 -left-3 absolute flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm shadow-lg">
                {index + 1}
              </div>

              <div
                className={`mb-6 inline-flex rounded-2xl p-4 transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-primary/15 shadow-lg'
                    : 'bg-muted/50 group-hover:bg-primary/10'
                }`}
              >
                <step.icon
                  className={`h-7 w-7 transition-colors duration-300 ${
                    activeStep === index
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-primary'
                  }`}
                />
              </div>

              <h3 className="mb-3 font-bold text-xl transition-colors group-hover:text-primary">
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground/80 leading-relaxed transition-colors group-hover:text-muted-foreground">
                {step.description}
              </p>

              {/* Active state indicator */}
              {activeStep === index && (
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Enhanced interactive demo area */}
        <Card className="fade-in slide-in-from-bottom-4 animate-in overflow-hidden border-0 bg-background/80 shadow-2xl backdrop-blur-sm delay-500 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Enhanced left side - Image upload/preview */}
            <div className="border-border/50 border-r bg-gradient-to-br from-muted/20 to-muted/40 p-10">
              <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-muted-foreground/30 border-dashed bg-background shadow-inner transition-all duration-300 hover:border-primary/60">
                {activeStep === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6 rounded-2xl bg-primary/10 p-4">
                      <Upload className="h-16 w-16 text-primary" />
                    </div>
                    <p className="mb-2 font-semibold text-lg">Drop your image here</p>
                    <p className="mb-6 text-muted-foreground text-sm">PNG, JPG up to 4MB</p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-xl border-2 hover:border-primary/50"
                    >
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="text-center">
                        <div className="mb-4 inline-block rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                          <Image className="h-12 w-12 text-white" />
                        </div>
                        <p className="font-semibold text-lg text-white">Sample AI Image</p>
                        <p className="mt-1 text-sm text-white/80">Ready for analysis</p>
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
                  <div className="py-16 text-center">
                    <div className="mb-6 inline-block rounded-2xl bg-muted/30 p-4">
                      <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-lg text-muted-foreground">
                      Upload an image to begin the magic
                    </p>
                    <p className="mt-2 text-muted-foreground/70 text-sm">
                      Our AI will analyze and extract the prompt
                    </p>
                  </div>
                )}

                {activeStep >= 1 && (
                  <>
                    <div>
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-xl">Extracted Prompt</h3>
                        <Badge
                          variant="secondary"
                          className="rounded-xl bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Extracted
                        </Badge>
                      </div>
                      <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 shadow-inner">
                        <p className="font-medium text-base leading-relaxed">{examplePrompt}</p>
                        <div className="mt-6 flex gap-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl border border-border/50 hover:border-primary/50"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Prompt
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-xl border border-border/50 hover:border-primary/50"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>

                    {activeStep >= 2 && (
                      <>
                        <div>
                          <h3 className="mb-6 font-bold text-xl">Prompt Variations</h3>
                          <div className="space-y-4">
                            {variations.map((variation, index) => (
                              <div
                                key={index}
                                className="group cursor-pointer rounded-2xl border border-border/50 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50"
                              >
                                <p className="font-medium text-base transition-colors group-hover:text-primary">
                                  {variation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-6 font-bold text-xl">Generate with</h3>
                          <Tabs defaultValue="midjourney" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/30 p-1">
                              <TabsTrigger
                                value="midjourney"
                                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                Midjourney
                              </TabsTrigger>
                              <TabsTrigger
                                value="stable"
                                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                Stable Diffusion
                              </TabsTrigger>
                              <TabsTrigger
                                value="flux"
                                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                FLUX
                              </TabsTrigger>
                              <TabsTrigger
                                value="dalle"
                                className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
                              >
                                DALL-E
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="midjourney" className="mt-6">
                              <Button className="w-full rounded-2xl py-6 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                                Generate with Midjourney
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
        <div className="fade-in slide-in-from-bottom-4 mt-16 animate-in text-center delay-700 duration-700">
          <p className="mb-6 font-medium text-muted-foreground/80 text-xl">
            Ready to extract prompts from your images?
          </p>
          <Button
            size="lg"
            className="rounded-2xl px-10 py-6 font-semibold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl"
          >
            Try Image to Prompt
          </Button>
          <p className="mt-4 text-muted-foreground/60 text-sm">
            No credit card required • Start immediately
          </p>
        </div>
      </div>
    </section>
  );
}
