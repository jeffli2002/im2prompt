import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Video Generation - im2Prompt',
  description: 'Transform your ideas into stunning videos with AI',
  alternates: {
    canonical: 'https://www.im2prompt.com/text-to-video',
  },
};

export default function TextToVideoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
