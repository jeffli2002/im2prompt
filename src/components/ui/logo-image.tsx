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
  unoptimized = true,
  title,
}: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-primary text-primary-foreground font-bold`}
        style={{ width, height }}
      >
        IM
      </div>
    );
  }

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
      onError={() => setError(true)}
    />
  );
}
