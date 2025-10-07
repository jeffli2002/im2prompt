'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Image as ImageIcon, Download, AlertCircle, Share2, Upload, Sparkles, X } from 'lucide-react'
import UpgradePrompt from '@/components/auth/UpgradePrompt'
import { useAuth } from '@/contexts/AuthContext'
import { useQuota } from '@/hooks/useQuota'
import { creditsConfig } from '@/config/credits.config'

interface GenerationResult {
  imageUrl: string
  prompt: string
  model: string
  error?: string
}

type GenerationMode = 'text-to-image' | 'image-to-image'

export default function ImageGenerator() {
  const searchParams = useSearchParams()
  const initialMode = searchParams?.get('mode') as GenerationMode || 'text-to-image'
  
  const { user } = useAuth()
  const { usage, canGenerateImage, trackImageGeneration } = useQuota()
  const [mode, setMode] = useState<GenerationMode>(initialMode)
  const [prompt, setPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<string>('1:1')
  const [model, setModel] = useState<string>('nano-banana')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxPromptLength = 2000
  const imageCreditCost = creditsConfig.consumption.imageGeneration['nano-banana']
  const textDefaultPrompt = 'A serene Japanese garden with cherry blossoms in full bloom, koi fish swimming in a crystal-clear pond, traditional wooden bridge, soft morning light filtering through maple trees, ultra-realistic, high detail'
  const imageDefaultPrompt = 'Transform this image into a watercolor painting style, soft pastel colors, artistic brush strokes'

  useEffect(() => {
    if (searchParams?.get('mode')) {
      setMode(searchParams.get('mode') as GenerationMode)
    }
  }, [searchParams])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file must be less than 10MB')
      return
    }

    setImageFile(file)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!user) {
      setShowUpgradeModal(true)
      return
    }
    
    if (!canGenerateImage()) {
      setShowUpgradeModal(true)
      return
    }
    
    if (!prompt.trim()) {
      alert('Please enter a prompt')
      return
    }

    if (mode === 'image-to-image' && !imageFile && !imagePreview) {
      alert('Please upload an image for image-to-image generation')
      return
    }

    setIsGenerating(true)
    setResult(null)

    try {
      let finalPrompt = prompt.trim()

      if (mode === 'image-to-image' && imagePreview) {
        finalPrompt = `${prompt.trim()}\n\n[Image attached: ${imageFile?.name || 'uploaded image'}]`
      }

      const requestBody: any = {
        prompt: finalPrompt,
        model: model,
        aspect_ratio: aspectRatio,
      }

      if (mode === 'image-to-image' && imagePreview) {
        requestBody.image = imagePreview
      }

      const response = await fetch('/api/v1/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          setShowUpgradeModal(true)
          throw new Error(data.error || 'Image generation limit reached')
        }
        
        throw new Error(data.error || 'Failed to generate image')
      }

      if (!data.imageUrl) {
        throw new Error('No image URL in response')
      }

      setResult({
        imageUrl: data.imageUrl,
        prompt: prompt,
        model: data.model
      })
      
      await trackImageGeneration()
      setIsGenerating(false)

    } catch (error) {
      setResult({
        imageUrl: '',
        prompt: prompt,
        model: 'nano-banana',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      setIsGenerating(false)
    }
  }

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nano-banana-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      window.open(imageUrl, '_blank')
    }
  }

  const handleShare = async () => {
    if (!result?.imageUrl) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nano Banana Generated Image',
          text: 'Check out this AI-generated image created with Nano Banana!',
          url: result.imageUrl
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(result.imageUrl)
      alert('Image URL copied to clipboard!')
    }
  }

  const canGenerate = prompt.trim().length > 0

  return (
    <div className="max-w-7xl mx-auto">
      <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="text-to-image" className="font-light">
            <Sparkles className="w-4 h-4 mr-2" />
            Text to Image
          </TabsTrigger>
          <TabsTrigger value="image-to-image" className="font-light">
            <ImageIcon className="w-4 h-4 mr-2" />
            Image to Image
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <TabsContent value="text-to-image" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Image Description</label>
                <Textarea
                  placeholder={textDefaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                  rows={8}
                  className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light"
                />
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image-to-image" className="mt-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Source Image</label>
                
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-light text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs font-light text-gray-400">
                      JPEG, PNG, or WebP (max 10MB)
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
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
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
                <label className="text-sm font-light text-gray-700">
                  Transformation Prompt <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder={imageDefaultPrompt}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, maxPromptLength))}
                  rows={4}
                  className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 font-light"
                />
                <div className="text-xs text-gray-400 text-right font-light">
                  {prompt.length} / {maxPromptLength}
                </div>
              </div>
            </TabsContent>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Model</label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nano-banana">Nano Banana (Gemini 2.5 Flash) - {creditsConfig.consumption.imageGeneration['nano-banana']} credits</SelectItem>
                    <SelectItem value="flux-1.1-pro">Flux 1.1 Pro - {creditsConfig.consumption.imageGeneration['flux-1.1-pro']} credits</SelectItem>
                    <SelectItem value="flux-1.1-ultra">Flux 1.1 Ultra - {creditsConfig.consumption.imageGeneration['flux-1.1-ultra']} credits</SelectItem>
                    <SelectItem value="stable-diffusion">Stable Diffusion 3 - {creditsConfig.consumption.imageGeneration['stable-diffusion']} credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-light text-gray-700">Aspect Ratio</label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="border-gray-200 font-light">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">Square (1:1)</SelectItem>
                    <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    <SelectItem value="4:3">Standard (4:3)</SelectItem>
                    <SelectItem value="3:2">Photo (3:2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm">
              <p className="text-foreground">
                <strong>Credits:</strong> {imageCreditCost} credits per image | 
                Free quota: {usage.imageGeneration.dailyLimit}/day, {usage.imageGeneration.monthlyLimit}/month
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-light"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Generate Image ({imageCreditCost} credits)
                </>
              )}
            </Button>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              {!result && (
                <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/40" />
                    <p className="text-sm font-light text-muted-foreground">Your generated image will appear here</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="aspect-square bg-muted/30 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-base font-light text-foreground">Generating your image...</p>
                    <p className="text-xs font-light text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              )}

              {result && !result.error && result.imageUrl && (
                <div className="space-y-4">
                  <img
                    src={result.imageUrl}
                    alt="Generated"
                    className="w-full rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleDownload(result.imageUrl)}
                      variant="outline"
                      className="font-light border-gray-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="font-light border-gray-200"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}

              {result?.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-light text-red-900">Generation Failed</p>
                    <p className="text-sm font-light text-red-700">{result.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>

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
  )
}
