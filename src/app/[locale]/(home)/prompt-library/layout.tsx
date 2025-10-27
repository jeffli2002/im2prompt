import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Library - im2Prompt',
  description: 'Explore our collection of AI prompts for image and video generation',
  alternates: {
    canonical: 'https://www.im2prompt.com/prompt-library',
  },
};

export default function PromptLibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
