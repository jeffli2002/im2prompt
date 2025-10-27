import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Text to Prompt & Image Generator - im2Prompt',
  description: 'Transform simple text into enhanced prompts and generate stunning AI images',
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-prompt',
  },
};

export default function TextToPromptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
