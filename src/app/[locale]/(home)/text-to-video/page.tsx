'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Video, Clock, Sparkles } from 'lucide-react'

export default function TextToVideoPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-bold text-4xl">AI Video Generation</h1>
        <p className="text-muted-foreground text-xl">
          Transform your ideas into stunning videos with AI
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-6">
            <Video className="w-12 h-12 text-purple-600" />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
              Coming Soon
            </span>
          </div>
          
          <h2 className="text-2xl font-bold mb-3 text-center">
            🎬 AI Video Generation is On Its Way!
          </h2>
          
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We're working hard to bring you powerful AI video generation capabilities. Soon you'll be able to create amazing videos from text descriptions and images using cutting-edge AI technology.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 w-full max-w-lg">
            <p className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Coming Features:</span>
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <span><strong>Text to Video:</strong> Generate videos from text descriptions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🖼️</span>
                <span><strong>Image to Video:</strong> Bring your images to life with motion</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎨</span>
                <span><strong>Multiple Styles:</strong> Various video styles and effects</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚡</span>
                <span><strong>Fast Generation:</strong> Quick and high-quality results</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Stay tuned for updates! 🚀
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
