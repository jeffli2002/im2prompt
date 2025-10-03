'use client';

import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Loader2, Check, Video, Palette, Wand2, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PromptPreview } from '@/components/prompt-preview';

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
    description: 'Natural language description of the image',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-blue-500/20 to-blue-600/20'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'Tailored for Midjourney generation with parameters',
    icon: <Palette className="h-5 w-5" />,
    gradient: 'from-purple-500/20 to-purple-600/20'
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'Formatted for Stable Diffusion models',
    icon: <Wand2 className="h-5 w-5" />,
    gradient: 'from-pink-500/20 to-pink-600/20'
  },
  {
    id: 'flux',
    name: 'Flux',
    description: 'Photorealistic AI image generation',
    icon: <Sparkles className="h-5 w-5" />,
    gradient: 'from-cyan-500/20 to-blue-600/20'
  },
  {
    id: 'sora2',
    name: 'Sora 2',
    description: 'Cinematic video prompts with motion and storytelling',
    icon: <Video className="h-5 w-5" />,
    badge: 'NEW',
    gradient: 'from-red-500/20 to-orange-600/20'
  },
  {
    id: 'veo3',
    name: 'Veo3',
    description: 'Short-form video prompts for Canva integration',
    icon: <Video className="h-5 w-5" />,
    badge: 'HOT',
    gradient: 'from-green-500/20 to-emerald-600/20'
  }
];

export default function ImageToPromptPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<string>('general');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [promptHistory, setPromptHistory] = useState<Array<{prompt: string, model: string, timestamp: Date}>>([]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload an image less than 4MB",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageUrl(''); // Clear URL if file is uploaded
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload({ target: { files: [file] } } as any);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleGeneratePrompt = async () => {
    if (!imageFile && !imageUrl) {
      toast.error("No image provided", {
        description: "Please upload an image or provide an image URL",
      });
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
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedPrompt(data.data.prompt);
        setNegativePrompt(data.data.negativePrompt || '');
        
        // Add to history
        setPromptHistory(prev => [{
          prompt: data.data.prompt,
          model: selectedModel,
          timestamp: new Date()
        }, ...prev.slice(0, 4)]); // Keep last 5

        toast.success("Prompt generated successfully!", {
          description: `Credits used: ${data.data.creditsUsed}. Remaining: ${data.data.remainingCredits}`,
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Failed to generate prompt",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", {
      description: "Prompt copied to clipboard",
    });
  };

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Free Image to Prompt Generator</h1>
        <p className="text-xl text-muted-foreground">
          Convert Image to Prompt to generate your own image
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 1. Image Upload/Preview Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Step 1: Upload Image</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant={!imageUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setImageUrl('')}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  File
                </Button>
                <Button 
                  variant={imageUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  URL
                </Button>
              </div>
            </div>

            {!imageUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`relative border-2 border-dashed rounded-lg transition-all ${
                  imagePreview 
                    ? 'border-transparent bg-muted/10' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer'
                }`}
                style={{ minHeight: '400px' }}
                onClick={() => !imagePreview && document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <div className="relative h-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-contain rounded-lg"
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
                        <Upload className="h-3 w-3 mr-1" />
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
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="mx-auto h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/5">
                          <Plus className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <ImageIcon className="absolute bottom-0 right-0 h-6 w-6 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground mb-1">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
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
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                {imageUrl && (
                  <div className="relative border rounded-lg overflow-hidden bg-muted/10" style={{ minHeight: '350px' }}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                      style={{ maxHeight: '350px' }}
                      onError={() => toast.error("Failed to load image from URL")}
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
            <Label className="text-base font-semibold mb-4 block">Step 2: Select AI Model Style</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {aiModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all group ${
                    selectedModel === model.id 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-muted-foreground/50 hover:bg-muted/5'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${model.gradient} group-hover:scale-110 transition-transform`}>
                      {model.icon}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <h3 className="font-semibold text-xs">{model.name}</h3>
                        {model.badge && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{model.description}</p>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="h-3.5 w-3.5 text-primary absolute top-1.5 right-1.5" />
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
            <Label className="text-base font-semibold mb-4 block">Step 3: Generate Prompt</Label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Language Selection and Generate Button */}
              <div className="lg:col-span-1 space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Prompt Language</Label>
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
              </div>

              {/* Generated Prompt Output */}
              <div className="lg:col-span-2">
                <Label className="text-sm mb-3 block">Generated Prompt</Label>
                {generatedPrompt ? (
                  <PromptPreview 
                    prompt={generatedPrompt} 
                    negativePrompt={negativePrompt}
                    modelStyle={selectedModel}
                  />
                ) : (
                  <div className="min-h-[300px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    {isLoading ? "Generating your prompt..." : "Your generated prompt will appear here..."}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* View History Link */}
        {promptHistory.length > 0 && (
          <div className="text-center">
            <Button variant="link" onClick={() => router.push('/prompt-library')}>
              View History →
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="text-center space-y-6 mt-12">
        <p className="text-sm text-muted-foreground">
          Want to analyze specific aspects like art style or describe people in the image? Try our{' '}
          <a href="#" className="text-primary hover:underline">AI Describe Image</a>{' '}
          tool for detailed analysis.
        </p>
        
        <Card className="mx-auto max-w-3xl">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Highly Accurate Image to Prompt Generation</h2>
            <p className="text-muted-foreground">
              Convert original images to prompts and regenerated with AI to see our prompt accuracy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}