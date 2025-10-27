import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image to Video Generator - im2Prompt',
  description: 'Transform your images into stunning videos with AI',
  alternates: {
    canonical: 'https://www.im2prompt.com/image-to-video',
  },
};

export default function ImageToVideoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
