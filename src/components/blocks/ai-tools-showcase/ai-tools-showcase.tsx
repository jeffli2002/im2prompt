import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Simple arrow SVG component
function SimpleArrow({ direction = 'right' }: { direction?: 'right' | 'down' }) {
  if (direction === 'down') {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-purple-600 dark:text-purple-400 animate-arrow-float"
      >
        <path
          d="M12 5v14m0 0l-7-7m7 7l7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-600 dark:text-purple-400 animate-arrow-float"
    >
      <path
        d="M5 12h14m0 0l-7-7m7 7l-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AIToolsIntro() {
  const tools = [
    {
      id: 'image-to-prompt',
      title: 'Image to Prompt',
      description: 'Transform your image into detailed image prompt with Image to Prompt, enhancing your creative process and optimizing AI-driven design efficiency.',
      ctaText: 'Generate Prompt',
      href: '/image-to-prompt',
      demoImage: '/images/img2prompt.png',
      demoImageAlt: 'Image to Prompt demonstration - upload an image and get AI-generated prompts',
      imagePosition: 'left' as const,
    },
    {
      id: 'text-to-prompt',
      title: 'Image Prompt Generator',
      description: 'Enhance your AI image generation with our Image Prompt Generator. Turn your idea into detailed, AI-optimized prompts, whether you\'re fluent in English or not.',
      ctaText: 'Generate Prompt',
      href: '/text-to-prompt',
      demoImage: '/images/text2prompt.png',
      demoImageAlt: 'Text to Prompt demonstration - enhance simple text into detailed AI prompts',
      imagePosition: 'right' as const,
    },
    {
      id: 'text-to-image',
      title: 'AI Image Generator',
      description: 'Use Image Prompt to effortlessly generate stunning images, enhancing creativity and streamlining your design process with AI-powered precision.',
      ctaText: 'Generate Image Now!',
      href: '/text-to-image',
      demoImage: '/images/prompt2imgv2.png',
      demoImageAlt: 'Text to Image demonstration - AI-generated image from prompt',
      imagePosition: 'left' as const,
    },
    {
      id: 'text-to-video',
      title: 'Text to Video with Sora 2',
      description: 'Create cinematic motion with Sora 2. Transform your ideas into stunning videos with AI-powered video generation.',
      ctaText: 'Generate Video',
      href: '/text-to-video',
      demoImage: '/images/demos/text-to-video-demo.jpg',
      demoImageAlt: 'Text to Video demonstration - Sora 2 generated video frame',
      imagePosition: 'right' as const,
      badge: 'New',
      isVideo: true,
      videoPublicId: 'homepage-videos/text2video-demo',
      videoOverlayText: 'A dog is riding a roller coaster.',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            From Idea to Creation — Powered by AI tools
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Four powerful tools working together. Real examples, real results.
          </p>
        </div>

        {/* Vertical stacked rows with alternating layout */}
        <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
          {tools.map((tool, index) => (
            <ToolRow key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {/* Simple CTA */}
        <div className="text-center mt-12">
          <p className="text-base text-muted-foreground/70">
            Choose a tool above to get started, or try our most popular feature
          </p>
        </div>
      </div>
    </section>
  );
}

interface ToolRowProps {
  tool: {
    id: string;
    title: string;
    description: string;
    ctaText: string;
    href: string;
    demoImage: string;
    demoImageAlt: string;
    imagePosition: 'left' | 'right';
    badge?: string;
    isVideo?: boolean;
    videoPublicId?: string;
    videoOverlayText?: string;
  };
  index: number;
}

function ToolRow({ tool, index }: ToolRowProps) {
  const isImageLeft = tool.imagePosition === 'left';

  return (
    <div className="w-full">
      <div 
        className={cn(
          'group relative rounded-3xl',
          'bg-white/50 dark:bg-gray-900/50',
          'border border-gray-200/60 dark:border-gray-700/60',
          'shadow-sm hover:shadow-xl transition-all duration-500',
          'hover:border-purple-300/50 dark:hover:border-purple-700/50',
          'p-6 md:p-8 lg:p-12',
          'backdrop-blur-sm'
        )}
      >
        {/* Two-column grid layout with arrow */}
        <div className={cn(
          'relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center',
          // On desktop, reverse the order for alternating layout
          isImageLeft ? '' : 'lg:grid-flow-dense'
        )}>
          
          {/* Transformation Arrow - Desktop */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <SimpleArrow direction="right" />
          </div>

          {/* Transformation Arrow - Mobile (vertical) */}
          <div className="flex lg:hidden justify-center my-4 pointer-events-none">
            <SimpleArrow direction="down" />
          </div>
          
          {/* Image Container */}
          <div className={cn(
            'relative w-full',
            // Control column order on desktop
            isImageLeft ? 'lg:col-start-1' : 'lg:col-start-2'
          )}>
            {/* Badge - positioned over image */}
            {tool.badge && (
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold shadow-lg">
                  {tool.badge}
                </span>
              </div>
            )}

            <div 
              className={cn(
                'relative w-full aspect-[4/3] overflow-hidden rounded-2xl',
                'bg-white dark:bg-gray-900',
                'shadow-md border border-gray-200/60 dark:border-gray-700/60',
                'cursor-pointer group-hover:shadow-2xl',
                'transition-all duration-500 ease-out',
                'hover:scale-[1.02] hover:-translate-y-1',
                'hover:border-purple-300 dark:hover:border-purple-600'
              )}
            >
              {tool.isVideo && tool.videoPublicId ? (
                <>
                  <video
                    className={cn(
                      'w-full h-full object-cover',
                      'transition-all duration-700 ease-out',
                      'group-hover:scale-110',
                      'group-hover:brightness-105'
                    )}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvskpqqvv'}/video/upload/so_0,q_auto/${tool.videoPublicId}.jpg`}
                    loading="lazy"
                  >
                    <source 
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvskpqqvv'}/video/upload/q_auto,f_auto/${tool.videoPublicId}.mp4`}
                      type="video/mp4"
                    />
                  </video>
                  {tool.videoOverlayText && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-white text-sm font-medium">{tool.videoOverlayText}</p>
                    </div>
                  )}
                </>
              ) : (
                <Image
                  src={tool.demoImage}
                  alt={tool.demoImageAlt}
                  fill
                  className={cn(
                    'object-cover',
                    'transition-all duration-700 ease-out',
                    'group-hover:scale-110',
                    'group-hover:brightness-105'
                  )}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={index < 2}
                />
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className={cn(
            'flex flex-col justify-center space-y-4 md:space-y-6',
            // Control column order on desktop
            isImageLeft ? 'lg:col-start-2' : 'lg:col-start-1',
            // Text alignment
            'text-left'
          )}>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {tool.title}
            </h3>
            
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {tool.description}
            </p>

            <div className="pt-2">
              <Link
                href={tool.href}
                className={cn(
                  'inline-flex items-center justify-center',
                  'px-6 py-3 sm:px-8 sm:py-3.5',
                  'rounded-xl font-semibold text-base sm:text-lg',
                  'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
                  'text-white',
                  'shadow-md hover:shadow-xl hover:shadow-purple-500/30',
                  'transition-all duration-300',
                  'hover:-translate-y-1 active:translate-y-0',
                  'hover:scale-105 active:scale-100',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
                )}
              >
                {tool.ctaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
