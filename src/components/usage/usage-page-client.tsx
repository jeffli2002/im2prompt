'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { creditsConfig } from '@/config/credits.config';
import type { CreditTransaction } from '@/lib/credits';
import type {
  GetCreditBalanceResponse,
  GetQuotaUsageResponse,
} from '@/server/actions/credit-actions';
import { formatDistance } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Coins,
  ImageIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Video,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UsagePageClientProps {
  initialBalance: GetCreditBalanceResponse | null;
  initialHistory: CreditTransaction[];
  initialQuota: GetQuotaUsageResponse | null;
  balanceError: string | null | undefined;
  historyError: string | null | undefined;
  quotaError: string | null | undefined;
}

export function UsagePageClient({
  initialBalance,
  initialHistory,
  initialQuota,
  balanceError,
  historyError,
  quotaError,
}: UsagePageClientProps) {
  const [creditBalance] = useState(initialBalance);
  const [transactions] = useState(initialHistory);
  const [quotaUsage] = useState(initialQuota);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const error = balanceError || historyError || quotaError;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Give a small delay for the UI feedback
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'spend':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'refund':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
  };

  const imageCredits = creditsConfig.consumption.imageGeneration['nano-banana'];
  const videoCredits = creditsConfig.consumption.videoGeneration['sora-2'];

  if (error) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl tracking-tight">Usage & Credits</h1>
          <p className="text-muted-foreground">
            Track your credit balance, usage history, and quota consumption
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Try
              Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shouldShowQuota = (quota?: { used: number; limit: number; isUnlimited: boolean }) => {
    if (!quota) return false;
    if (quota.isUnlimited) return true;
    const limit = quota.limit ?? 0;
    const used = quota.used ?? 0;
    return limit > 0 || used > 0;
  };

  const calculateUsagePercent = (quota?: { used: number; limit: number }) => {
    if (!quota || !quota.limit || quota.limit <= 0) return 0;
    return Math.min(100, ((quota.used || 0) / quota.limit) * 100);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Usage & Credits</h1>
        <p className="text-muted-foreground">
          Track your credit balance, usage history, and quota consumption
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Available Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{creditBalance?.availableBalance || 0}</div>
            <p className="text-muted-foreground text-xs">
              ~{Math.floor((creditBalance?.availableBalance || 0) / imageCredits)} images or{' '}
              {Math.floor((creditBalance?.availableBalance || 0) / videoCredits)} videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{creditBalance?.totalEarned || 0}</div>
            <p className="text-muted-foreground text-xs">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{creditBalance?.totalSpent || 0}</div>
            <p className="text-muted-foreground text-xs">All-time spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily & Monthly Quota Usage Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Image Generation - Daily */}
        {quotaUsage?.imageGeneration && shouldShowQuota(quotaUsage.imageGeneration.daily) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                Images (Daily)
              </CardTitle>
              <CardDescription>Today's generation limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Used</span>
                <span className="font-medium text-sm">
                  {quotaUsage.imageGeneration.daily.used || 0} /{' '}
                  {quotaUsage.imageGeneration.daily.isUnlimited
                    ? '∞'
                    : quotaUsage.imageGeneration.daily.limit || 0}
                </span>
              </div>
              {!quotaUsage.imageGeneration.daily.isUnlimited &&
                (quotaUsage.imageGeneration.daily.limit || 0) > 0 && (
                  <Progress
                    value={calculateUsagePercent(quotaUsage.imageGeneration.daily)}
                    className="h-2"
                  />
                )}
            </CardContent>
          </Card>
        )}

        {/* Image Generation - Monthly */}
        {quotaUsage?.imageGeneration && shouldShowQuota(quotaUsage.imageGeneration.monthly) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-indigo-500" />
                Images (Monthly)
              </CardTitle>
              <CardDescription>This month's generation limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Used</span>
                <span className="font-medium text-sm">
                  {quotaUsage.imageGeneration.monthly.used || 0} /{' '}
                  {quotaUsage.imageGeneration.monthly.isUnlimited
                    ? '∞'
                    : quotaUsage.imageGeneration.monthly.limit || 0}
                </span>
              </div>
              {!quotaUsage.imageGeneration.monthly.isUnlimited &&
                (quotaUsage.imageGeneration.monthly.limit || 0) > 0 && (
                  <Progress
                    value={calculateUsagePercent(quotaUsage.imageGeneration.monthly)}
                    className="h-2"
                  />
                )}
            </CardContent>
          </Card>
        )}

        {/* Video Generation - Daily */}
        {quotaUsage?.videoGeneration && shouldShowQuota(quotaUsage.videoGeneration.daily) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="h-5 w-5 text-purple-500" />
                Videos (Daily)
              </CardTitle>
              <CardDescription>Today's generation limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Used</span>
                <span className="font-medium text-sm">
                  {quotaUsage.videoGeneration.daily.used || 0} /{' '}
                  {quotaUsage.videoGeneration.daily.isUnlimited
                    ? '∞'
                    : quotaUsage.videoGeneration.daily.limit || 0}
                </span>
              </div>
              {!quotaUsage.videoGeneration.daily.isUnlimited &&
                (quotaUsage.videoGeneration.daily.limit || 0) > 0 && (
                  <Progress
                    value={calculateUsagePercent(quotaUsage.videoGeneration.daily)}
                    className="h-2"
                  />
                )}
            </CardContent>
          </Card>
        )}

        {/* Video Generation - Monthly */}
        {quotaUsage?.videoGeneration && shouldShowQuota(quotaUsage.videoGeneration.monthly) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Video className="h-5 w-5 text-pink-500" />
                Videos (Monthly)
              </CardTitle>
              <CardDescription>This month's generation limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Used</span>
                <span className="font-medium text-sm">
                  {quotaUsage.videoGeneration.monthly.used || 0} /{' '}
                  {quotaUsage.videoGeneration.monthly.isUnlimited
                    ? '∞'
                    : quotaUsage.videoGeneration.monthly.limit || 0}
                </span>
              </div>
              {!quotaUsage.videoGeneration.monthly.isUnlimited &&
                (quotaUsage.videoGeneration.monthly.limit || 0) > 0 && (
                  <Progress
                    value={calculateUsagePercent(quotaUsage.videoGeneration.monthly)}
                    className="h-2"
                  />
                )}
            </CardContent>
          </Card>
        )}

        {/* Image Extraction - Monthly */}
        {quotaUsage?.imageExtraction && shouldShowQuota(quotaUsage.imageExtraction.monthly) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-5 w-5 text-green-500" />
                Image-to-Prompt
              </CardTitle>
              <CardDescription>Monthly extraction quota</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Used</span>
                <span className="font-medium text-sm">
                  {quotaUsage.imageExtraction.monthly.used || 0} /{' '}
                  {quotaUsage.imageExtraction.monthly.isUnlimited
                    ? '∞'
                    : quotaUsage.imageExtraction.monthly.limit || 0}
                </span>
              </div>
              {!quotaUsage.imageExtraction.monthly.isUnlimited &&
                (quotaUsage.imageExtraction.monthly.limit || 0) > 0 && (
                  <Progress
                    value={calculateUsagePercent(quotaUsage.imageExtraction.monthly)}
                    className="h-2"
                  />
                )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Credit Transaction History
            </CardTitle>
            <CardDescription>Your recent credit activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No transaction history yet</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description || `${transaction.type} - ${transaction.source}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistance(new Date(transaction.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'spend' ? '-' : '+'}
                      {transaction.amount}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Balance: {transaction.balanceAfter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Credit Costs Reference</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nano Banana Image Generation</span>
            <span className="font-medium">{imageCredits} credits/image</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sora 2 Video Generation</span>
            <span className="font-medium">{videoCredits} credits/video</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
