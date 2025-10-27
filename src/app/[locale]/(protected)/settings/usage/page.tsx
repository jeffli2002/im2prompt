import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UsagePageClient } from '@/components/usage/usage-page-client';
import { getCreditBalance, getCreditHistory, getQuotaUsage } from '@/server/actions/credit-actions';
import { Suspense } from 'react';

function UsagePageSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => `credit-skeleton-${i}`).map((key) => (
          <Card key={key}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-24" />
              <Skeleton className="mt-2 h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => `usage-skeleton-${i}`).map((key) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

async function UsagePageServer() {
  // Fetch all data on the server
  const [balanceResult, historyResult, quotaResult] = await Promise.all([
    getCreditBalance(),
    getCreditHistory({ limit: 20 }),
    getQuotaUsage(),
  ]);
  const initialBalance = balanceResult.success ? balanceResult.data ?? null : null;
  const initialHistory = historyResult.success ? historyResult.data ?? [] : [];
  const initialQuota = quotaResult.success ? quotaResult.data ?? null : null;

  return (
    <UsagePageClient
      initialBalance={initialBalance}
      initialHistory={initialHistory}
      initialQuota={initialQuota}
      balanceError={balanceResult.success ? null : balanceResult.error}
      historyError={historyResult.success ? null : historyResult.error}
      quotaError={quotaResult.success ? null : quotaResult.error}
    />
  );
}

export default function UsagePageRoute() {
  return (
    <Suspense fallback={<UsagePageSkeleton />}>
      <UsagePageServer />
    </Suspense>
  );
}
