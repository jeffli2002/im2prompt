'use client';

import Image from 'next/image';

interface LogoImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  title?: string;
}

export function LogoImage({ src, alt, width, height, className, priority, unoptimized, title }: LogoImageProps) {
  // For now, let's just trust Next.js Image to handle the image loading
  // and remove the complex fallback logic that might be causing issues
  
  console.log('[LogoImage] Rendering with src:', src);
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
      title={title}
    />
  );
}