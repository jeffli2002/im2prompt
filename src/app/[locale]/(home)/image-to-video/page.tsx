'use client'

import SoraVideoGenerator from '@/components/sora-video-generator'

export default function ImageToVideoPage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">AI Image to Video</h1>
        <p className="text-muted-foreground text-xl">
          Transform your images into stunning videos with AI
        </p>
      </div>

      {/* Video Generator Component - Default to image-to-video mode */}
      <SoraVideoGenerator defaultMode="image-to-video" />
    </div>
  )
}
