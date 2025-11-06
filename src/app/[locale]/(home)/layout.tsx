import { Footer } from '@/components/blocks/footer/footer';
import { NavbarWrapper } from '@/components/blocks/navbar/navbar-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import { metadata as homeMetadata } from './metadata';

export { metadata } from './metadata';

type Props = {
  children: ReactNode;
};

export default function MarketingLayout({ children }: Props) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <NavbarWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
