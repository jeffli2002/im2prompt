import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - im2Prompt',
  description: 'Refund policy for im2Prompt subscriptions',
  alternates: {
    canonical: 'https://www.im2prompt.com/refund',
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
