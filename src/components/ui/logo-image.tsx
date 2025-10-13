'use client';

import Image from 'next/image';
import { useState } from 'react';

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

export function LogoImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  unoptimized,
  title,
}: LogoImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const fallbackLogo = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='16' font-weight='bold'%3EI2P%3C/text%3E%3C/svg%3E`;

  const handleError = () => {
    if (!hasError) {
      console.log('[LogoImage] Failed to load:', imgSrc, '- using fallback');
      setHasError(true);
      setImgSrc(fallbackLogo);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized={unoptimized || hasError}
      title={title}
      onError={handleError}
    />
  );
}