'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  ImageIcon, 
  Video, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getCreditBalance, getCreditHistory, getQuotaUsage } from '@/server/actions/credit-actions';
import type { CreditTransaction } from '@/lib/credits';
import { formatDistance } from 'date-fns';
import { creditsConfig } from '@/config/credits.config';

interface CreditBalanceData {
  balance: number;
  availableBalance: number;
  totalEarned: number;
  totalSpent: number;
  frozenBalance: number;
}

interface QuotaUsageData {
  apiCalls: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  storage: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
}

export function UsagePage() {
  const [creditBalance, setCreditBalance] = useState<CreditBalanceData | null>(null);
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsageData | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceResult, historyResult, quotaResult] = await Promise.all([
        getCreditBalance(),
        getCreditHistory({ limit: 20 }),
        getQuotaUsage(),
      ]);

      if (balanceResult.success && balanceResult.data) {
        setCreditBalance(balanceResult.data);
      }

      if (historyResult.success && historyResult.data) {
        setTransactions(historyResult.data);
      }

      if (quotaResult.success && quotaResult.data) {
        setQuotaUsage(quotaResult.data);
      }
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const imageCredits = creditsConfig.consumption.imageGeneration.nanoBanana;
  const videoCredits = creditsConfig.consumption.videoGeneration.sora2;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Usage & Credits</h1>
        <p className="text-muted-foreground">
          Track your credit balance, usage history, and quota consumption
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditBalance?.availableBalance || 0}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.floor((creditBalance?.availableBalance || 0) / imageCredits)} images or{' '}
              {Math.floor((creditBalance?.availableBalance || 0) / videoCredits)} videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditBalance?.totalEarned || 0}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditBalance?.totalSpent || 0}</div>
            <p className="text-xs text-muted-foreground">All-time spending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image-to-Text Usage
            </CardTitle>
            <CardDescription>Monthly extraction quota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Used</span>
              <span className="text-sm font-medium">
                {quotaUsage?.apiCalls.used || 0} / {quotaUsage?.apiCalls.isUnlimited ? '∞' : quotaUsage?.apiCalls.limit || 0}
              </span>
            </div>
            {!quotaUsage?.apiCalls.isUnlimited && (
              <Progress 
                value={((quotaUsage?.apiCalls.used || 0) / (quotaUsage?.apiCalls.limit || 1)) * 100} 
                className="h-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>Monthly storage quota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Used</span>
              <span className="text-sm font-medium">
                {formatBytes(quotaUsage?.storage.used || 0)} / {quotaUsage?.storage.isUnlimited ? '∞' : formatBytes(quotaUsage?.storage.limit || 0)}
              </span>
            </div>
            {!quotaUsage?.storage.isUnlimited && (
              <Progress 
                value={((quotaUsage?.storage.used || 0) / (quotaUsage?.storage.limit || 1)) * 100} 
                className="h-2"
              />
            )}
          </CardContent>
        </Card>
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
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transaction history yet
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description || `${transaction.type} - ${transaction.source}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistance(new Date(transaction.createdAt), new Date(), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'spend' ? '-' : '+'}{transaction.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
