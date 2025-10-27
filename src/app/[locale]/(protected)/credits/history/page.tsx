import { CreditHistoryPage } from '@/components/credits/credit-history-page';
import { CreditsPageSkeleton } from '@/components/credits/credits-skeleton';
import { Suspense } from 'react';

export default function CreditHistoryPageRoute() {
  return (
    <Suspense fallback={<CreditsPageSkeleton />}>
      <CreditHistoryPage />
    </Suspense>
  );
}
