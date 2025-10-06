'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Copy, Download, Image as ImageIcon, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TextToPromptPage() {
  const [inputText, setInputText] = useState<string>('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('nano-banana');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 1024,
    height: 1024,
  });
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [rawMode, setRawMode] = useState<boolean>(false);

  const handleEnhancePrompt = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter a prompt', {
        description: 'You need to provide text to enhance',
      });
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/v1/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      setEnhancedPrompt(data.enhancedPrompt || data.prompt || '');

      toast.success('Prompt enhanced!', {
        description: 'Your prompt has been optimized for better results',
      });
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast.error('Enhancement failed', {
        description: error instanceof Error ? error.message : 'Failed to enhance prompt',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateImage = async () => {
    const promptToUse = enhancedPrompt || inputText;

    if (!promptToUse.trim()) {
      toast.error('No prompt available', {
        description: 'Please enter or enhance a prompt first',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImageUrl('');

    try {
      const requestBody: Record<string, unknown> = {
        prompt: promptToUse,
        model: selectedModel,
      };

      if (selectedModel === 'flux-1.1-ultra') {
        requestBody.aspect_ratio = aspectRatio;
        requestBody.raw = rawMode;
      } else {
        requestBody.width = imageSize.width;
        requestBody.height = imageSize.height;
      }

      const response = await fetch('/api/v1/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl || data.url || '');

      toast.success('Image generated!', {
        description: 'Your AI image has been created successfully',
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Failed to generate image',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!', {
      description: 'Prompt copied to clipboard',
    });
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Download started!', {
      description: 'Your image is being downloaded',
    });
  };

  const handleSizeChange = (value: string) => {
    const [width, height] = value.split('x').map(Number);
    setImageSize({ width: width || 1024, height: height || 1024 });
  };

  const isUltraModel = selectedModel === 'flux-1.1-ultra';

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">AI Text to Prompt & Image Generator</h1>
        <p className="text-muted-foreground text-xl">
          Transform simple text into enhanced prompts and generate stunning AI images
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Label className="mb-4 block font-semibold text-base">Step 1: Enter Your Idea</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Example: A serene mountain landscape at sunset with a crystal clear lake..."
                className="min-h-[200px] resize-none"
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !inputText.trim()}
                  className="flex-1"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Enhance Prompt
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Label className="font-semibold text-base">Enhanced Prompt</Label>
                {enhancedPrompt && (
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(enhancedPrompt)}>
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
              <div className="min-h-[150px] rounded-lg border bg-muted/30 p-4">
                {enhancedPrompt ? (
                  <p className="whitespace-pre-wrap text-sm">{enhancedPrompt}</p>
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Your enhanced prompt will appear here...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Label className="mb-4 block font-semibold text-base">Step 2: Generate Image</Label>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flux-1.1">Flux 1.1</SelectItem>
                      <SelectItem value="flux-1.1-pro">Flux 1.1 Pro</SelectItem>
                      <SelectItem value="flux-1.1-ultra">Flux 1.1 Ultra (4MP)</SelectItem>
                      <SelectItem value="flux-kontext-pro">Flux Kontext Pro (Fast, $0.04)</SelectItem>
                      <SelectItem value="flux-kontext-dev">Flux Kontext Dev (Editing Only, Free)</SelectItem>
                      <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                      <SelectItem value="nano-banana">Nano Banana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isUltraModel ? (
                  <>
                    <div>
                      <Label className="mb-2 block text-sm">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                          <SelectItem value="1:1">1:1 (Square)</SelectItem>
                          <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                          <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                          <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                          <SelectItem value="21:9">21:9 (Ultra Wide)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="raw-mode"
                        checked={rawMode}
                        onCheckedChange={(checked) => setRawMode(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="raw-mode"
                          className="flex items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Camera className="h-4 w-4" />
                          Raw Mode
                        </label>
                        <p className="text-muted-foreground text-xs">
                          More authentic, natural-looking results
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label className="mb-2 block text-sm">Image Size</Label>
                    <Select
                      value={`${imageSize.width}x${imageSize.height}`}
                      onValueChange={handleSizeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                        <SelectItem value="1024x768">Landscape (1024x768)</SelectItem>
                        <SelectItem value="768x1024">Portrait (768x1024)</SelectItem>
                        <SelectItem value="1920x1080">Wide (1920x1080)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || (!enhancedPrompt && !inputText.trim())}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Label className="font-semibold text-base">Generated Image</Label>
                {generatedImageUrl && (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={downloadImage}>
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              <div
                className="relative overflow-hidden rounded-lg border-2 border-dashed bg-muted/10"
                style={{ minHeight: '600px' }}
              >
                {generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="Generated"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-muted-foreground/25 border-dashed bg-muted/5">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-base text-foreground">
                          {isGenerating
                            ? 'Generating your image...'
                            : 'Your image will appear here'}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {isGenerating
                            ? 'This may take a few moments'
                            : 'Enter a prompt and click generate'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 space-y-6 text-center">
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-8">
            <h2 className="mb-4 font-bold text-2xl">Powered by Advanced AI</h2>
            <p className="text-muted-foreground">
              Our AI-powered prompt enhancement and image generation tools use cutting-edge models
              to transform your ideas into stunning visual content. Perfect for artists, designers,
              and creative professionals.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
