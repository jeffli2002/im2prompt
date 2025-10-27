import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Text to Image Generator - im2Prompt',
  description: 'Generate stunning AI images from text prompts with multiple AI models',
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-image',
  },
};

export default function TextToImageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
