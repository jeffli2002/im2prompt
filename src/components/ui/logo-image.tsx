'use client';

import { useState, useEffect } from 'react';
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
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fallback SVG logo
  const fallbackLogo = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EI2P%3C/text%3E%3C/svg%3E`;

  // Reset states when src changes
  useEffect(() => {
    setShouldUseFallback(false);
    setIsLoading(true);
    
    // Pre-validate image exists by attempting to load it
    const img = new window.Image();
    
    img.onload = () => {
      // Image loaded successfully - use the real image
      setIsLoading(false);
      setShouldUseFallback(false);
      console.log('[LogoImage] Successfully loaded:', src);
    };
    
    img.onerror = () => {
      // Image failed to load - use fallback
      setIsLoading(false);
      setShouldUseFallback(true);
      console.warn('[LogoImage] Failed to load, using fallback:', src);
    };
    
    // Start loading the image
    img.src = src;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Always try to use the real image first, only fallback if it actually failed
  const imageSrc = shouldUseFallback ? fallbackLogo : src;

  return (
    <Image
      src={imageSrc}
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