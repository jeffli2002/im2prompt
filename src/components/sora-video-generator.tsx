'use client';

import UpgradePrompt from '@/components/auth/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { creditsConfig } from '@/config/credits.config';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/hooks/useQuota';
import { useVideoStore } from '@/store/video-store';
import {
  AlertCircle,
  Download,
  ImageIcon as ImageIconLucide,
  Loader2,
  Share2,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GenerationResult {
  taskId: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'success' | 'failed';
  error?: string;
}

type GenerationMode = 'text-to-video' | 'image-to-video';

interface SoraVideoGeneratorProps {
  defaultMode?: GenerationMode;
}

export default function SoraVideoGenerator({
  defaultMode = 'text-to-video',
}: SoraVideoGeneratorProps = {}) {
  const { user } = useAuth();
  const { usage, canGenerateVideo, trackVideoGeneration } = useQuota();
  const { setVideo, getLatestVideo } = useVideoStore();
  const [mode, setMode] = useState<GenerationMode>(defaultMode);
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const latestVideo = getLatestVideo();
    if (latestVideo && latestVideo.status === 'success') {
      setResult(latestVideo);
    }
  }, []);

  const maxPromptLength = 5000;
  const videoCreditCost = creditsConfig.consumption.videoGeneration['sora-2'];
  const textDefaultPrompt =
    'A professor stands at the front of a lively classroom, enthusiastically giving a lecture. On the blackboard behind him are colorful chalk diagrams. With an animated gesture, he declares to the students: "Sora 2 is now available on im2Prompt, making it easier than ever to create stunning videos." The students listen attentively, some smiling and taking notes.';
  const imageDefaultPrompt = 'Camera slowly zooms in, cinematic lighting, smooth motion';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file must be less than 10MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file must be less than 10MB');
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/v1/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          context: 'video',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      setEnhancedPrompt(data.enhancedPrompt || '');
    } catch (error) {
      console.error('Enhancement error:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    console.log('[Sora] handleGenerate called:', {
      mode,
      hasImageFile: !!imageFile,
      hasPrompt: !!prompt,
    });

    if (!user) {
      setShowUpgradeModal(true);
      return;
    }

    if (!canGenerateVideo()) {
      setShowUpgradeModal(true);
      return;
    }

    if (mode === 'text-to-video' && !prompt.trim()) {
      alert('Please enter a prompt for text-to-video generation');
      return;
    }

    if (mode === 'image-to-video' && !imageFile && !imagePreview) {
      alert('Please upload an image for image-to-video generation');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let createResponse: Response;
      let createData: any;

      if (mode === 'text-to-video') {
        // Text to video mode - use JSON API
        const requestBody = {
          mode: 'text-to-video',
          prompt: enhancedPrompt || prompt.trim(),
          aspect_ratio: aspectRatio,
          quality,
        };

        createResponse = await fetch('/api/v1/sora-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        try {
          createData = await createResponse.json();
        } catch (jsonError) {
          console.error('Failed to parse response:', jsonError);
          throw new Error('Failed to process server response. Please try again.');
        }
      } else {
        // Image to video mode - use FormData with sora-image-generate endpoint
        setIsUploading(true);

        if (!imageFile) {
          setIsUploading(false);
          throw new Error('Please select an image for image-to-video generation');
        }

        if (!prompt.trim()) {
          setIsUploading(false);
          throw new Error('Prompt is required for image-to-video');
        }

        const formData = new FormData();
        formData.append('prompt', enhancedPrompt || prompt.trim());
        formData.append('image', imageFile);
        formData.append('aspect_ratio', aspectRatio);
        formData.append('quality', quality);

        createResponse = await fetch('/api/v1/sora-image-generate', {
          method: 'POST',
          body: formData,
        });

        setIsUploading(false);

        // Log response for debugging
        console.log('[Image-to-Video] Response status:', createResponse.status);
        console.log(
          '[Image-to-Video] Response headers:',
          Object.fromEntries(createResponse.headers.entries())
        );

        // Check if response has content
        const responseText = await createResponse.text();
        console.log('[Image-to-Video] Response text length:', responseText.length);
        console.log('[Image-to-Video] Response text preview:', responseText.substring(0, 200));

        if (!responseText || responseText.trim() === '') {
          console.error('[Image-to-Video] Empty response received from API');
          throw new Error(
            'Server returned empty response. The service may be experiencing issues. Please try again.'
          );
        }

        try {
          createData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('[Image-to-Video] Failed to parse response:', jsonError);
          console.error('[Image-to-Video] Response was:', responseText);
          throw new Error(
            'Failed to process server response. The service may be experiencing issues. Please try again.'
          );
        }
      }

      if (!createResponse.ok) {
        if (createResponse.status === 429 || createResponse.status === 402) {
          setShowUpgradeModal(true);
          throw new Error(createData.error || 'Video generation limit reached');
        }

        // Handle face/people detection blocking
        if (
          createResponse.status === 400 &&
          createData.error &&
          (createData.error.toLowerCase().includes('face') ||
            createData.error.toLowerCase().includes('people') ||
            createData.error.toLowerCase().includes('person') ||
            createData.error.toLowerCase().includes('sora 2'))
        ) {
          // Show user-friendly error in the result area
          const blockErrorResult = {
            taskId: '',
            status: 'failed' as const,
            error: createData.error,
          };
          setResult(blockErrorResult);
          setIsGenerating(false);

          // Also show alert for immediate attention
          alert(
            `🚫 图片被阻止 / Image Blocked\n\n${createData.error}\n\n💡 建议 / Suggestion:\n请上传不包含人物或人脸的图片，如：\n- 风景照片 (Landscapes)\n- 物品照片 (Objects)\n- 建筑场景 (Architecture)\n- 动物照片 (Animals - no people)`
          );

          return; // Don't throw, just stop processing
        }

        throw new Error(createData.error || 'Failed to create task');
      }

      const taskId = createData.taskId;
      const generatingResult = { taskId, status: 'generating' as const };
      setResult(generatingResult);
      setVideo(taskId, generatingResult);

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/v1/sora-task-status?taskId=${taskId}`);

          let statusData;
          try {
            statusData = await statusResponse.json();
          } catch (jsonError) {
            throw new Error('Failed to check generation status. Please refresh the page.');
          }

          if (!statusResponse.ok) {
            throw new Error(statusData.error || 'Failed to query task');
          }

          if (statusData.state === 'success') {
            clearInterval(pollInterval);

            let resultUrls: string[] = [];
            try {
              if (!statusData.resultJson || statusData.resultJson.trim() === '') {
                throw new Error(
                  'Video generation completed but no result data was returned. The service may be experiencing issues. Please try again.'
                );
              }

              let parsedResult;
              try {
                parsedResult = JSON.parse(statusData.resultJson);
              } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                console.error('Result JSON:', statusData.resultJson);
                throw new Error(
                  'Invalid response format from video generation service. Please try again.'
                );
              }

              resultUrls = parsedResult.resultUrls || [];

              if (!resultUrls || resultUrls.length === 0) {
                throw new Error(
                  'Video generation completed but no video URL was provided. Please try again.'
                );
              }
            } catch (parseError) {
              clearInterval(pollInterval);
              const parseErrorResult = {
                taskId,
                status: 'failed' as const,
                error:
                  parseError instanceof Error
                    ? parseError.message
                    : 'Failed to process generation result',
              };
              setResult(parseErrorResult);
              setVideo(taskId, parseErrorResult);
              setIsGenerating(false);
              return;
            }

            const successResult = {
              taskId,
              videoUrl: resultUrls[0],
              status: 'success' as const,
            };
            setResult(successResult);
            setVideo(taskId, successResult);
            setIsGenerating(false);
            await trackVideoGeneration();
          } else if (statusData.state === 'fail') {
            clearInterval(pollInterval);
            let errorMessage = statusData.failMsg || 'Generation failed';

            if (errorMessage.includes('copyrighted material')) {
              errorMessage =
                'Generation blocked by copyright detection.\n\nPlease try using your own original photos or stock images with commercial licenses.';
            } else if (errorMessage.includes('safety') || errorMessage.includes('policy')) {
              errorMessage =
                'Generation failed: Content policy violation.\n\nPlease try using a different image or prompt.';
            }

            alert(errorMessage);

            const failedResult = {
              taskId,
              status: 'failed' as const,
              error: errorMessage,
            };
            setResult(failedResult);
            setVideo(taskId, failedResult);
            setIsGenerating(false);
          }
        } catch (error) {
          clearInterval(pollInterval);
          const errorResult = {
            taskId,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          setResult(errorResult);
          setVideo(taskId, errorResult);
          setIsGenerating(false);
        }
      }, 5000);

      setTimeout(() => {
        if (isGenerating) {
          clearInterval(pollInterval);
          const timeoutResult = {
            taskId,
            status: 'failed' as const,
            error: 'Generation timeout (5 minutes)',
          };
          setResult(timeoutResult);
          setVideo(taskId, timeoutResult);
          setIsGenerating(false);
        }
      }, 300000);
    } catch (error) {
      const catchErrorResult = {
        taskId: '',
        status: 'failed' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setResult(catchErrorResult);
      if (catchErrorResult.taskId) {
        setVideo(catchErrorResult.taskId, catchErrorResult);
      }
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sora-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(videoUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (!result?.videoUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sora 2 Generated Video',
          text: 'Check out this AI-generated video created with Sora 2!',
          url: result.videoUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(result.videoUrl);
      alert('Video URL copied to clipboard!');
    }
  };

  const canGenerate = mode === 'text-to-video' ? prompt.trim().length > 0 : imageFile !== null;

  return (
    <div className="mx-auto max-w-7xl">
      <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)} className="w-full">
        <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="text-to-video" className="font-light">
            <Video className="mr-2 h-4 w-4" />
            Text to Video
          </TabsTrigger>
          <TabsTrigger value="image-to-video" className="font-light">
            <ImageIconLucide className="mr-2 h-4 w-4" />
            Image to Video
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Generator Form */}
          <div className="space-y-6">
            <TabsContent value="text-to-video" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="font-light text-gray-700 text-sm dark:text-gray-300">
                  Video Description
                </label>
                <div className="relative">
                  <Textarea
                    placeholder={textDefaultPrompt}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                    rows={8}
                    className="resize-none border-gray-200 pr-24 pb-12 font-light focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <Button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    size="sm"
                    variant="outline"
                    className="absolute right-2 bottom-2 inline-flex items-center gap-2 rounded-lg border-2 border-purple-500 bg-purple-50 px-3 py-1.5 font-medium text-purple-700 text-sm shadow-sm transition-all duration-300 hover:bg-purple-100 dark:border-purple-400 dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                  </Button>
                </div>
                <div className="text-right font-light text-gray-400 text-xs dark:text-gray-500">
                  {prompt.length} / {maxPromptLength}
                </div>
                {enhancedPrompt && (
                  <div className="mt-4 rounded-xl border border-clean bg-muted/10 p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 font-semibold text-purple-900 text-sm dark:text-purple-100">
                        <Sparkles className="h-4 w-4" />
                        Enhanced Video Prompt
                      </h4>
                      <Button
                        onClick={() => setEnhancedPrompt('')}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={enhancedPrompt}
                      onChange={(e) => setEnhancedPrompt(e.target.value.slice(0, maxPromptLength))}
                      className="resize-none border border-clean bg-background text-sm shadow-inner"
                      rows={6}
                    />
                    <p className="mt-1 text-right text-purple-600 text-xs dark:text-purple-400">
                      {enhancedPrompt.length} / {maxPromptLength}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image-to-video" className="mt-0 space-y-6">
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-900 text-sm dark:text-amber-200">
                      Sora 2 Image Requirements
                    </p>
                    <p className="text-amber-700 text-xs leading-relaxed dark:text-amber-300">
                      Sora 2 has strict requirements for uploaded images.{' '}
                      <strong>Images containing people or faces are not supported</strong> and will
                      be automatically rejected. Please use images with landscapes, objects, or
                      scenes without any people.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-light text-gray-700 text-sm dark:text-gray-300">
                  Source Image
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="hover-card cursor-pointer rounded-xl border border-clean border-dashed p-8 text-center transition-colors"
                  >
                    <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <p className="mb-1 font-light text-gray-600 text-sm dark:text-gray-300">
                      Click to upload or drag and drop
                    </p>
                    <p className="font-light text-gray-400 text-xs dark:text-gray-500">
                      JPEG, PNG, or WebP (max 10MB)
                    </p>
                    <p className="mt-2 font-light text-amber-600 text-xs dark:text-amber-400">
                      ⚠️ No people or faces allowed
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="font-light text-gray-700 text-sm dark:text-gray-300">
                  Motion Prompt <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Textarea
                    placeholder={imageDefaultPrompt}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                    rows={4}
                    className="resize-none border-gray-200 pr-24 pb-12 font-light focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <Button
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    size="sm"
                    variant="outline"
                    className="absolute right-2 bottom-2 inline-flex items-center gap-2 rounded-lg border-2 border-purple-500 bg-purple-50 px-3 py-1.5 font-medium text-purple-700 text-sm shadow-sm transition-all duration-300 hover:bg-purple-100 dark:border-purple-400 dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isEnhancing ? 'Enhancing...' : 'Enhance'}
                  </Button>
                </div>
                <div className="text-right font-light text-gray-400 text-xs dark:text-gray-500">
                  {prompt.length} / {maxPromptLength}
                </div>
                {enhancedPrompt && (
                  <div className="mt-4 rounded-xl border border-clean bg-muted/10 p-4 shadow-card">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="flex items-center gap-2 font-semibold text-purple-900 text-sm dark:text-purple-100">
                        <Sparkles className="h-4 w-4" />
                        Enhanced Video Prompt
                      </h4>
                      <Button
                        onClick={() => setEnhancedPrompt('')}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-600 dark:text-gray-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={enhancedPrompt}
                      onChange={(e) => setEnhancedPrompt(e.target.value.slice(0, maxPromptLength))}
                      className="resize-none border border-clean bg-background text-sm shadow-inner"
                      rows={6}
                    />
                    <p className="mt-1 text-right text-purple-600 text-xs dark:text-purple-400">
                      {enhancedPrompt.length} / {maxPromptLength}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Common Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-light text-gray-700 text-sm dark:text-gray-300">
                  Aspect Ratio
                </label>
                <Select
                  value={aspectRatio}
                  onValueChange={(v: 'landscape' | 'portrait') => setAspectRatio(v)}
                >
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                    <SelectItem value="portrait">Portrait (9:16)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-light text-gray-700 text-sm dark:text-gray-300">
                  Quality
                </label>
                <Select value={quality} onValueChange={(v: 'standard' | 'hd') => setQuality(v)}>
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="hd">HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950/30">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>Credits:</strong> Dynamic based on model | Free quota:{' '}
                {usage.videoGeneration.dailyLimit}/day, {usage.videoGeneration.monthlyLimit}/month
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
              className="w-full transform border-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 font-bold text-lg text-white shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading Image...
                </>
              ) : isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Video Preview */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              {!result && (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/20">
                  <div className="space-y-3 text-center">
                    <Video className="mx-auto h-16 w-16 text-purple-300 dark:text-purple-400" />
                    <p className="font-light text-gray-500 text-sm dark:text-gray-400">
                      Your generated video will appear here
                    </p>
                  </div>
                </div>
              )}

              {result?.status === 'generating' && (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/20">
                  <div className="space-y-4 text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
                    <p className="font-light text-base text-gray-700 dark:text-gray-300">
                      Generating your video...
                    </p>
                    <p className="font-light text-gray-500 text-xs dark:text-gray-400">
                      This may take a few minutes
                    </p>
                  </div>
                </div>
              )}

              {result?.status === 'success' && result.videoUrl && (
                <div className="space-y-4">
                  <video
                    src={result.videoUrl}
                    controls
                    className="w-full rounded-xl"
                    autoPlay
                    loop
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDownload(result.videoUrl!)}
                      variant="outline"
                      className="border-gray-200 font-light"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="border-gray-200 font-light"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              )}

              {result?.status === 'failed' && (
                <div
                  className={`rounded-xl p-4 ${
                    result.error?.toLowerCase().includes('face') ||
                    result.error?.toLowerCase().includes('people') ||
                    result.error?.toLowerCase().includes('person')
                      ? 'border border-amber-300 bg-amber-50'
                      : 'border border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className={`mt-0.5 h-6 w-6 flex-shrink-0 ${
                        result.error?.toLowerCase().includes('face') ||
                        result.error?.toLowerCase().includes('people') ||
                        result.error?.toLowerCase().includes('person')
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p
                        className={`mb-1 font-medium ${
                          result.error?.toLowerCase().includes('face') ||
                          result.error?.toLowerCase().includes('people') ||
                          result.error?.toLowerCase().includes('person')
                            ? 'text-amber-900'
                            : 'text-red-900'
                        }`}
                      >
                        {result.error?.toLowerCase().includes('face') ||
                        result.error?.toLowerCase().includes('people') ||
                        result.error?.toLowerCase().includes('person')
                          ? '🚫 Image Blocked'
                          : '❌ Generation Failed'}
                      </p>
                      <p
                        className={`mb-3 font-light text-sm ${
                          result.error?.toLowerCase().includes('face') ||
                          result.error?.toLowerCase().includes('people') ||
                          result.error?.toLowerCase().includes('person')
                            ? 'text-amber-800'
                            : 'text-red-700'
                        }`}
                      >
                        {result.error}
                      </p>

                      {(result.error?.toLowerCase().includes('face') ||
                        result.error?.toLowerCase().includes('people') ||
                        result.error?.toLowerCase().includes('person')) && (
                        <div className="rounded-lg bg-white/70 p-3 text-xs dark:bg-gray-800/70">
                          <p className="mb-2 font-medium text-amber-900 dark:text-amber-100">
                            💡 Recommended Image Types:
                          </p>
                          <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                            <li>✓ Landscapes (mountains, ocean, sky)</li>
                            <li>✓ Buildings and cityscapes</li>
                            <li>✓ Objects and product photos</li>
                            <li>✓ Animal photos (without people)</li>
                            <li>✓ Abstract art and patterns</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          onClose={() => setShowUpgradeModal(false)}
          creditsUsed={0}
          creditsLimit={0}
          type="credits"
          isAuthenticated={!!user}
          limitType="daily"
        />
      )}
    </div>
  );
}
