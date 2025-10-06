'use client'

import SoraVideoGenerator from '@/components/sora-video-generator'

export default function TextToVideoPage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">AI Text to Video Generator</h1>
        <p className="text-muted-foreground text-xl">
          Transform your text into stunning videos with Sora 2 AI
        </p>
      </div>

      <SoraVideoGenerator />
    </div>
  )
}
