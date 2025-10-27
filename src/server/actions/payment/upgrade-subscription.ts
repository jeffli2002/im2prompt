'use server';

import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import type { ActionResult } from '@/payment/types';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

const upgradeErrorLogger = new ErrorLogger('upgrade-subscription');

export async function upgradeSubscription(
  subscriptionId: string,
  newPlanId: 'pro' | 'proplus',
  newInterval: 'month' | 'year',
  useProration = false
): Promise<ActionResult<{ upgraded: boolean }>> {
  let session: { user?: { id: string } } | null = null;

  try {
    session = await getSessionWithAuthBypass();
    if (!session?.user) {
      return {
        success: false,
        error: 'Please login first',
      };
    }

    const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return {
        success: false,
        error: 'Subscription not found or unauthorized',
      };
    }

    if (paymentRecord.status !== 'active' && paymentRecord.status !== 'trialing') {
      return {
        success: false,
        error: 'Only active subscriptions can be upgraded',
      };
    }

    const currentPlan = paymentRecord.priceId;
    const currentInterval = paymentRecord.interval;

    if (currentPlan === newPlanId && currentInterval === newInterval) {
      return {
        success: false,
        error: 'You are already on this plan',
      };
    }

    const newProductKey = `${newPlanId}_${newInterval === 'year' ? 'yearly' : 'monthly'}` as
      | 'pro_monthly'
      | 'pro_yearly'
      | 'proplus_monthly'
      | 'proplus_yearly';

    const result = await creemService.upgradeSubscription(
      subscriptionId,
      newProductKey,
      useProration
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to upgrade subscription',
      };
    }

    await paymentRepository.update(paymentRecord.id, {
      priceId: newPlanId,
      interval: newInterval,
    });

    await paymentRepository.createEvent({
      paymentId: paymentRecord.id,
      eventType: 'upgraded',
      eventData: JSON.stringify({
        subscriptionId,
        oldPlan: currentPlan,
        oldInterval: currentInterval,
        newPlan: newPlanId,
        newInterval: newInterval,
        useProration,
        upgradedAt: new Date().toISOString(),
      }),
    });

    const upgradeMessage = useProration
      ? 'Subscription upgraded immediately with prorated charge'
      : 'Subscription will be upgraded at the end of current period';

    return {
      success: true,
      data: {
        upgraded: true,
      },
      message: upgradeMessage,
    };
  } catch (error) {
    upgradeErrorLogger.logError(error as Error, {
      operation: 'upgradeSubscription',
      userId: session?.user?.id,
      subscriptionId,
      newPlanId,
      newInterval,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upgrade subscription',
    };
  }
}
