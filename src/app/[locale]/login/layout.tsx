import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - im2Prompt',
  description: 'Sign in to your im2Prompt account',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
