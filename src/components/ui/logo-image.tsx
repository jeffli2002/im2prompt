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
