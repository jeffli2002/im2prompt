import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - im2Prompt',
  description: 'Privacy policy for im2Prompt AI platform',
  alternates: {
    canonical: 'https://www.im2prompt.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
