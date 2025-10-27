import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - im2Prompt',
  description: 'Create your im2Prompt account',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
