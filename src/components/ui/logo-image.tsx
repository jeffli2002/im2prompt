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
  const [fallbackError, setFallbackError] = useState(false);

  if (error && fallbackError) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white`}
        style={{ width, height }}
      >
        IM
      </div>
    );
  }

  if (error) {
    return (
      <Image
        src="/images/logo3.png"
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        unoptimized={unoptimized}
        title={title}
        onError={() => setFallbackError(true)}
      />
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
