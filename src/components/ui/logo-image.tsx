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
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);
  
  // Fallback SVG logo
  const fallbackLogo = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EI2P%3C/text%3E%3C/svg%3E`;

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setImageSrc(src);
  }, [src]);

  // Handle image load error by using a different approach
  // We'll pre-check if the image exists
  useEffect(() => {
    if (src && !imageError) {
      const img = new window.Image();
      img.onload = () => {
        // Image loaded successfully, keep using original src
        setImageSrc(src);
      };
      img.onerror = () => {
        // Image failed to load, switch to fallback
        console.warn('[LogoImage] Failed to load:', src);
        setImageError(true);
        setImageSrc(fallbackLogo);
      };
      img.src = src;
    }
  }, [src, imageError, fallbackLogo]);

  return (
    <Image
      src={imageError ? fallbackLogo : imageSrc}
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