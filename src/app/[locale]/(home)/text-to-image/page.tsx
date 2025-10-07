'use client'

import { Suspense } from 'react'
import ImageGenerator from '@/components/image-generator'

export default function TextToImagePage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">AI Image Generator</h1>
        <p className="text-muted-foreground text-xl">
          Create stunning images with AI - Nano Banana, Flux, and more
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
        <ImageGenerator />
      </Suspense>
    </div>
  )
}
