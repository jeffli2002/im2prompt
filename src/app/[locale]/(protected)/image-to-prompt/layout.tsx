import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { ProtectedLayoutClient } from '@/components/dashboard/protected-layout-client';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

type Props = {
  children: ReactNode;
};

export default function ImageToPromptLayout({ children }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AuthGuard useSkeletonFallback>
        <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
      </AuthGuard>
    </Suspense>
  );
}
