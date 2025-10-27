import { CreditsPage } from '@/components/credits/credits-page';
import { CreditsPageSkeleton } from '@/components/credits/credits-skeleton';
import { Suspense } from 'react';

export default function CreditsPageRoute() {
  return (
    <Suspense fallback={<CreditsPageSkeleton />}>
      <CreditsPage />
    </Suspense>
  );
}
