'use client';

import { SubscriptionCard } from '@/components/payment/subscription-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { creditsConfig } from '@/config/credits.config';
import { usePaymentPlan } from '@/hooks/use-config';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { getBillingInfo } from '@/server/actions/payment/get-billing-info';
import type { BillingInfo } from '@/server/actions/payment/get-billing-info';
import { syncSingleSubscription } from '@/server/actions/payment/sync-subscription-periods';
import { Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const billingErrorLogger = new ErrorLogger('billing-page');

export function BillingPage() {
  const t = useTranslations('billing');
  const locale = useLocale();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const searchParams = useSearchParams();
  const freePlan = usePaymentPlan('free');
  const freeDailyQuota = creditsConfig.freeUser.imageToText.freeQuotaPerDay;
  const freeMonthlyQuota = creditsConfig.freeUser.imageToText.freeQuotaPerMonth;
  const signupBonusCredits = freePlan?.credits?.onSignup ?? 0;

  const loadBillingInfo = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await getBillingInfo();
      if (result.success && result.data) {
        setBillingInfo(result.data);
      } else {
        setError(result.error || t('toast.getBillingInfoFailed'));
      }
    } catch (err) {
      setError(t('toast.getBillingInfoFailed'));
      billingErrorLogger.logError(err as Error, {
        operation: 'loadBillingInfo',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSyncSubscription = useCallback(async () => {
    if (!billingInfo?.activeSubscription?.subscriptionId) {
      toast.error(t('toast.noSubscriptionFound'));
      return;
    }

    try {
      setSyncing(true);
      const result = await syncSingleSubscription(billingInfo.activeSubscription.subscriptionId);
      if (result.success) {
        toast.success(result.message || t('toast.syncSuccess'));
        await loadBillingInfo();
      } else {
        toast.error(result.error || t('toast.syncFailed'));
      }
    } catch (err) {
      toast.error(t('toast.syncFailed'));
      billingErrorLogger.logError(err as Error, {
        operation: 'syncSubscription',
        subscriptionId: billingInfo.activeSubscription.subscriptionId,
      });
    } finally {
      setSyncing(false);
    }
  }, [billingInfo?.activeSubscription?.subscriptionId, loadBillingInfo]);

  useEffect(() => {
    loadBillingInfo();
  }, [loadBillingInfo]);

  // Handle URL parameters to show payment result notifications
  useEffect(() => {
    // Prevent duplicate syncs
    if (syncCompleted) {
      return;
    }

    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const planId = searchParams.get('planId');

    if (success === 'true') {
      // Mark as completed immediately to prevent duplicate calls
      setSyncCompleted(true);

      // In dev mode, manually sync the subscription
      const syncSubscription = async () => {
        try {
          console.log('[Billing] Starting subscription sync...');

          // Get interval from URL params
          const interval = searchParams.get('interval') || 'month';
          const isYearly = interval === 'year';

          console.log('[Billing] Sync params:', { planId, interval, isYearly });

          const response = await fetch('/api/creem/sync-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Important for auth cookies
            body: JSON.stringify({
              checkoutId: `checkout_${Date.now()}`,
              planId: planId || 'pro',
              isYearly,
            }),
          });

          const data = await response.json();
          console.log('[Billing] Sync response:', data);

          if (response.ok) {
            toast.success(t('toast.paymentSuccess'), { duration: 5000 });
            await loadBillingInfo(); // Reload billing info
            // Clean URL without reloading page
            window.history.replaceState({}, '', window.location.pathname);
          } else {
            console.error('[Billing] Sync failed:', data);
            toast.warning(
              `Payment succeeded but sync failed: ${data.error}. Please refresh the page.`,
              { duration: 7000 }
            );
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('[Billing] Sync error:', error);
          toast.warning('Payment succeeded but sync failed. Please refresh the page.', {
            duration: 5000,
          });
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      };

      syncSubscription();
    } else if (canceled === 'true') {
      toast.info(t('toast.paymentCanceled'), {
        duration: 5000,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams, loadBillingInfo, t, syncCompleted]);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return t('unknown');
    return new Date(date).toLocaleDateString(locale);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: t('status.active'),
      trialing: t('status.trialing'),
      past_due: t('status.past_due'),
      canceled: t('status.canceled'),
      incomplete: t('status.incomplete'),
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'trialing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'past_due':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'canceled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>

        {/* Current subscription skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        {/* Payment history skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => `payment-skeleton-${i}`).map((key) => (
              <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        {billingInfo?.activeSubscription && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncSubscription}
              disabled={syncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? t('syncing') : t('syncButton')}
            </Button>
          </div>
        )}
      </div>

      {/* Current subscription */}
      {billingInfo?.activeSubscription ? (
        <SubscriptionCard
          subscription={billingInfo.activeSubscription}
          onUpdate={loadBillingInfo}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('freePlan.title')}</CardTitle>
            <CardDescription>{t('freePlan.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 rounded-xl border bg-muted/40 p-4">
              <div>
                <p className="font-medium text-sm">{t('freePlan.dailyQuotaTitle')}</p>
                <p className="text-muted-foreground text-sm">
                  {t('freePlan.dailyQuotaValue', { count: freeDailyQuota })}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">{t('freePlan.monthlyQuotaTitle')}</p>
                <p className="text-muted-foreground text-sm">
                  {t('freePlan.monthlyQuotaValue', { count: freeMonthlyQuota })}
                </p>
              </div>
              {signupBonusCredits > 0 && (
                <div>
                  <p className="font-medium text-sm">{t('freePlan.signupBonusTitle')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('freePlan.signupBonusValue', { credits: signupBonusCredits })}
                  </p>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{t('freePlan.ctaDescription')}</p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/#pricing">{t('freePlan.upgradeButton')}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('paymentHistory')}
          </CardTitle>
          <CardDescription>{t('allPaymentRecords')}</CardDescription>
        </CardHeader>
        <CardContent>
          {billingInfo?.paymentHistory && billingInfo.paymentHistory.length > 0 ? (
            <div className="space-y-4">
              {billingInfo.paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {payment.type === 'subscription' ? t('subscription') : t('oneTimePayment')}
                      </span>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(payment.createdAt)}</span>
                    </div>
                    {payment.interval && (
                      <div className="text-muted-foreground text-sm">
                        {t('billingCycle')}：
                        {payment.interval === 'month' ? t('monthly') : t('yearly')}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-sm">{t('priceId')}</div>
                    <div className="font-mono text-sm">{payment.priceId}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">{t('noPaymentRecords')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
