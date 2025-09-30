'use client';

import React, { useState } from 'react';
import { Upload, ArrowRight, Copy, Download, RefreshCw, Sparkles } from 'lucide-react';
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
    <section id="demo" className="py-24 relative">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Experience the complete workflow from image to prompt to new creation
          </p>
        </div>

        {/* Workflow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer
                ${activeStep === index 
                  ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
              `}
              onClick={() => setActiveStep(index)}
              style={{
                animationDelay: `${index * 100 + 200}ms`,
              }}
            >
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                activeStep === index ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <step.icon className={`h-6 w-6 ${
                  activeStep === index ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Interactive demo area */}
        <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left side - Image upload/preview */}
            <div className="p-8 bg-muted/30 border-r">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-background border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                {activeStep === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-2">Drop your image here</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 4MB</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Browse Files
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300">
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <p className="text-white/80 font-medium">Sample AI Image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Prompt extraction/editing */}
            <div className="p-8">
              <div className="space-y-6">
                {activeStep === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Upload an image to begin</p>
                  </div>
                )}

                {activeStep >= 1 && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Extracted Prompt</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Sparkles className="mr-1 h-3 w-3" />
                          AI Extracted
                        </Badge>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm leading-relaxed">{examplePrompt}</p>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="ghost">
                            <Copy className="mr-2 h-3 w-3" />
                            Copy
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="mr-2 h-3 w-3" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>

                    {activeStep >= 2 && (
                      <>
                        <div>
                          <h3 className="font-semibold mb-3">Prompt Variations</h3>
                          <div className="space-y-2">
                            {variations.map((variation, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                              >
                                <p className="text-sm">{variation}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3">Generate with</h3>
                          <Tabs defaultValue="midjourney" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="midjourney">Midjourney</TabsTrigger>
                              <TabsTrigger value="stable">Stable Diffusion</TabsTrigger>
                              <TabsTrigger value="flux">FLUX</TabsTrigger>
                              <TabsTrigger value="dalle">DALL-E</TabsTrigger>
                            </TabsList>
                            <TabsContent value="midjourney" className="mt-4">
                              <Button className="w-full">
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

        {/* CTA */}
        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <p className="text-muted-foreground mb-4">Ready to extract prompts from your images?</p>
          <Button size="lg" className="px-8">
            Try It Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}