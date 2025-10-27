import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image to Prompt Generator - im2Prompt',
  description: 'Convert Image to Prompt to generate your own image with AI',
  alternates: {
    canonical: 'https://www.im2prompt.com/image-to-prompt',
  },
};

export default function ImageToPromptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
