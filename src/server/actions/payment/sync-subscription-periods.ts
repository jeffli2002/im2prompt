'use server';

import { auth } from '@/lib/auth/auth';
import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import type { ActionResult } from '@/payment/types';
import { headers } from 'next/headers';
import { ErrorLogger } from '@/lib/logger/logger-utils';

const syncErrorLogger = new ErrorLogger('sync-subscription-periods');

export async function syncSubscriptionPeriods(): Promise<ActionResult<{ updated: number }>> {
  let session: { user?: { id: string } } | null = null;
  
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    const subscriptions = await paymentRepository.findByUserId(session.user.id);
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.type === 'subscription' && 
      sub.subscriptionId && 
      ['active', 'trialing', 'past_due'].includes(sub.status) &&
      (!sub.periodStart || !sub.periodEnd)
    );

    let updatedCount = 0;

    for (const subscription of activeSubscriptions) {
      try {
        if (!subscription.subscriptionId) continue;
        
        const result = await creemService.getSubscription(subscription.subscriptionId);
        
        if (result.success && result.subscription) {
          const creemSub = result.subscription;
          
          await paymentRepository.update(subscription.id, {
            periodStart: creemSub.current_period_start_date ? new Date(creemSub.current_period_start_date) : undefined,
            periodEnd: creemSub.current_period_end_date ? new Date(creemSub.current_period_end_date) : undefined,
            status: creemSub.status as any,
            cancelAtPeriodEnd: creemSub.cancel_at_period_end || false,
          });
          
          updatedCount++;
        }
      } catch (error) {
        syncErrorLogger.logError(error as Error, {
          operation: 'syncSubscriptionPeriods',
          subscriptionId: subscription.subscriptionId,
          userId: session.user.id,
        });
      }
    }

    return {
      success: true,
      data: { updated: updatedCount },
      message: `Successfully updated ${updatedCount} subscription(s)`,
    };

  } catch (error) {
    syncErrorLogger.logError(error as Error, {
      operation: 'syncSubscriptionPeriods',
      userId: session?.user?.id,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : '同步订阅期间失败',
    };
  }
}

export async function syncSingleSubscription(subscriptionId: string): Promise<ActionResult<{ updated: boolean }>> {
  let session: { user?: { id: string } } | null = null;
  
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    // Verify subscription belongs to current user
    const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return {
        success: false,
        error: '订阅不存在或无权操作',
      };
    }

    const result = await creemService.getSubscription(subscriptionId);
    
    if (!result.success || !result.subscription) {
      return {
        success: false,
        error: result.error || '获取订阅信息失败',
      };
    }

    const creemSub = result.subscription;

    if (!creemSub.current_period_start_date || !creemSub.current_period_end_date) {
      return {
        success: false,
        error: `订阅缺少期间信息 - status: ${creemSub.status}`,
      };
    }

    const periodStart = new Date(creemSub.current_period_start_date);
    const periodEnd = new Date(creemSub.current_period_end_date);
    const trialStart = creemSub.trial_start_date ? new Date(creemSub.trial_start_date) : undefined;
    const trialEnd = creemSub.trial_end_date ? new Date(creemSub.trial_end_date) : undefined;

    await paymentRepository.update(paymentRecord.id, {
      periodStart,
      periodEnd,
      status: creemSub.status as any,
      cancelAtPeriodEnd: creemSub.cancel_at_period_end || false,
      trialStart,
      trialEnd,
    });

    return {
      success: true,
      data: { updated: true },
      message: `订阅信息同步成功 - 期间: ${periodStart?.toLocaleDateString()} 到 ${periodEnd?.toLocaleDateString()}`,
    };

  } catch (error) {
    syncErrorLogger.logError(error as Error, {
      operation: 'syncSingleSubscription',
      subscriptionId,
      userId: session?.user?.id,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : '同步订阅信息失败',
    };
  }
} 