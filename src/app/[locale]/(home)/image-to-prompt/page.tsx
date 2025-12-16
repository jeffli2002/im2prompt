'use client';

import UpgradePrompt from '@/components/auth/UpgradePrompt';
import { PromptPreview } from '@/components/prompt-preview';
import { Badge } from '@/components/ui/badge';
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
import { creditsConfig } from '@/config/credits.config';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/hooks/useQuota';
import {
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Palette,
  Plus,
  Sparkles,
  Upload,
  Video,
  Wand2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  gradient: string;
}

const aiModels: AIModel[] = [
  {
    id: 'general',
    name: 'General Image Prompt',
    description: 'Natural language description',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'Midjourney prompts with parameters',
    icon: <Palette className="h-5 w-5" />,
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'nanoBanana',
    name: 'Nano Banana',
    description: 'Nano Banana format',
    icon: <Wand2 className="h-5 w-5" />,
    gradient: 'from-pink-500/20 to-pink-600/20',
  },
  {
    id: 'flux',
    name: 'Flux',
    description: 'Photorealistic prompts',
    icon: <Sparkles className="h-5 w-5" />,
    gradient: 'from-cyan-500/20 to-blue-600/20',
  },
  {
    id: 'sora2',
    name: 'Sora 2',
    description: 'Cinematic video prompts',
    icon: <Video className="h-5 w-5" />,
    badge: 'NEW',
    gradient: 'from-red-500/20 to-orange-600/20',
  },
];

export default function ImageToPromptPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { usage, canUseImageToText, trackImageToText } = useQuota();
  const [selectedModel, setSelectedModel] = useState<string>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<
    Array<{ prompt: string; model: string; timestamp: Date }>
  >([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Please upload an image less than 4MB',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageUrl('');
      setUploadMode('file');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file?.type.startsWith('image/')) {
        handleImageUpload({ target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleGeneratePrompt = async () => {
    if (!imageFile && !imageUrl) {
      toast.error('No image provided', {
        description: 'Please upload an image or provide an image URL',
      });
      return;
    }

    if (!canUseImageToText()) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsLoading(true);
    setGeneratedPrompt('');
    setNegativePrompt('');

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }
      formData.append('modelStyle', selectedModel);
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/v1/image-to-prompt', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 429 || response.status === 402) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate prompt');
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedPrompt(data.data.prompt);
        setNegativePrompt(data.data.negativePrompt || '');

        await trackImageToText();

        setPromptHistory((prev) => [
          {
            prompt: data.data.prompt,
            model: selectedModel,
            timestamp: new Date(),
          },
          ...prev.slice(0, 4),
        ]);

        toast.success('Prompt generated successfully!', {
          description: `Credits used: ${data.data.creditsUsed}. Remaining: ${data.data.remainingCredits}`,
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Failed to generate prompt',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!', {
      description: 'Prompt copied to clipboard',
    });
  };

  return (
    <div className="container max-w-7xl py-8">
      {showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          creditsUsed={usage.imageToText.daily}
          creditsLimit={usage.imageToText.dailyLimit}
          type="imageToText"
          isAuthenticated={!!user}
          limitType="daily"
        />
      )}

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">
          Image to Prompt Tool — Extract Sora 2, Nano Banana & Midjourney Prompts
        </h1>
        <p className="text-muted-foreground text-xl">
          Upload any image and extract perfect AI prompts for Sora 2 video, Nano Banana YouTube
          thumbnails, Midjourney, Flux, Stable Diffusion. Free online tool with downloadable prompt
          templates.
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl space-y-6">
        {/* 1. Image Upload/Preview Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Step 1: Upload Image</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={uploadMode === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setUploadMode('file');
                    setImageUrl('');
                  }}
                  className="text-xs"
                >
                  <Upload className="mr-1 h-3 w-3" />
                  File
                </Button>
                <Button
                  variant={uploadMode === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setUploadMode('url');
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-xs"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  URL
                </Button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative rounded-lg border-2 border-dashed transition-all ${
                  imagePreview
                    ? 'border-transparent bg-muted/10'
                    : 'cursor-pointer border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                style={{ minHeight: '400px' }}
                onClick={() => !imagePreview && document.getElementById('image-upload')?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !imagePreview) {
                    e.preventDefault();
                    document.getElementById('image-upload')?.click();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {imagePreview ? (
                  <div className="relative h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-contain"
                      style={{ maxHeight: '400px' }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('image-upload')?.click();
                        }}
                        className="shadow-sm"
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        Replace
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="shadow-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="relative">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-muted-foreground/25 border-dashed bg-muted/5">
                          <Plus className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <ImageIcon className="absolute right-0 bottom-0 h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-base text-foreground">
                          Drop your image here
                        </p>
                        <p className="text-muted-foreground text-sm">or click to browse</p>
                        <p className="mt-2 text-muted-foreground text-xs">
                          PNG, JPG, or WebP up to 4MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                {imageUrl && (
                  <div
                    className="relative overflow-hidden rounded-lg border bg-muted/10"
                    style={{ minHeight: '350px' }}
                  >
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-contain"
                      style={{ maxHeight: '350px' }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Model Selection */}
        <Card>
          <CardContent className="p-6">
            <Label className="mb-4 block font-semibold text-base">
              Step 2: Select AI Model Style
            </Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {aiModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model.id)}
                  className={`group relative cursor-pointer rounded-lg border-2 p-3 transition-all ${
                    selectedModel === model.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-muted-foreground/50 hover:bg-muted/5'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`rounded-lg bg-gradient-to-br p-2.5 ${model.gradient} transition-transform group-hover:scale-110`}
                    >
                      {model.icon}
                    </div>
                    <div className="w-full">
                      <div className="mb-0.5 flex items-center justify-center gap-1.5">
                        <h3 className="font-semibold text-xs">{model.name}</h3>
                        {model.badge && (
                          <Badge variant="secondary" className="h-4 px-1 py-0 text-[10px]">
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-[10px] text-muted-foreground leading-tight">
                        {model.description}
                      </p>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Language Selection, Generate Button, and Generated Prompt - All in one row */}
        <Card>
          <CardContent className="p-6">
            <Label className="mb-4 block font-semibold text-base">Step 3: Generate Prompt</Label>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Language Selection and Generate Button */}
              <div className="space-y-3 lg:col-span-1">
                <div>
                  <Label className="mb-2 block text-sm">Prompt Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGeneratePrompt}
                  disabled={isLoading || (!imageFile && !imageUrl)}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Prompt...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Prompt
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="mt-2 text-center text-muted-foreground text-xs">
                    {creditsConfig.consumption.imageToPrompt[
                      selectedModel as keyof typeof creditsConfig.consumption.imageToPrompt
                    ] || 2}{' '}
                    credits per generation
                  </p>
                )}

                {user && usage.imageToText.daily >= usage.imageToText.dailyLimit && (
                  <p className="mt-2 text-center text-muted-foreground text-xs">
                    {creditsConfig.consumption.imageToPrompt[
                      selectedModel as keyof typeof creditsConfig.consumption.imageToPrompt
                    ] || 2}{' '}
                    credits per generation
                  </p>
                )}
              </div>

              {/* Generated Prompt Output */}
              <div className="lg:col-span-2">
                <Label className="mb-3 block text-sm">Generated Prompt</Label>
                {generatedPrompt ? (
                  <PromptPreview
                    prompt={generatedPrompt}
                    negativePrompt={negativePrompt}
                    modelStyle={selectedModel}
                  />
                ) : (
                  <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground text-sm">
                    {isLoading
                      ? 'Generating your prompt...'
                      : 'Your generated prompt will appear here...'}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 space-y-6 text-center">
        <p className="text-muted-foreground text-sm">
          Want to enhance your prompts further? Try our{' '}
          <a href="/text-to-prompt" className="text-primary hover:underline">
            text to prompt enhancer
          </a>{' '}
          or generate images directly with our{' '}
          <a href="/text-to-image" className="text-primary hover:underline">
            AI image generator
          </a>
          .
        </p>

        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-8">
            <h2 className="mb-4 font-bold text-2xl">
              Sora 2 Prompt Examples & Nano Banana YouTube Thumbnail Prompts
            </h2>
            <p className="mb-4 text-muted-foreground">
              Convert original images to prompts optimized for Sora 2 video generation, Nano Banana
              YouTube thumbnails, and Midjourney portraits. Our AI extracts highly accurate prompts
              that work perfectly with each model's specific requirements.
            </p>
            <h3 className="mb-2 font-semibold text-xl">
              How to Generate YouTube Thumbnail with AI
            </h3>
            <p className="mb-4 text-muted-foreground">
              Upload your image, select Nano Banana format, and generate prompts optimized for
              YouTube thumbnails. Download the prompt template and use it with AI image generators
              to create eye-catching thumbnails that increase click-through rates.
            </p>
            <h3 className="mb-2 font-semibold text-xl">How to Prompt Sora 2</h3>
            <p className="text-muted-foreground">
              Use our image-to-prompt tool to convert images into Sora 2 video prompts. Select Sora
              2 format to get cinematic video prompts with proper structure and keywords that Sora 2
              understands best.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
