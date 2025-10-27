'use server';

import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import type { ActionResult, PaymentRecord } from '@/payment/types';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

const billingErrorLogger = new ErrorLogger('billing-info');

export interface BillingInfo {
  activeSubscription?: PaymentRecord;
  paymentHistory: PaymentRecord[];
}

export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  let session: { user?: { id: string } } | null = null;

  try {
    session = await getSessionWithAuthBypass();
    if (!session?.user) {
      return {
        success: false,
        error: 'Please login first',
      };
    }

    console.log(`[getBillingInfo] Getting billing info for user: ${session.user.id}`);

    // 获取用户的活跃订阅
    const activeSubscription = await paymentRepository.findActiveSubscriptionByUserId(
      session.user.id
    );

    console.log(
      '[getBillingInfo] Active subscription:',
      activeSubscription
        ? {
            priceId: activeSubscription.priceId,
            interval: activeSubscription.interval,
            status: activeSubscription.status,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null
    );

    // 获取用户的支付历史
    const paymentHistory = await paymentRepository.findByUserId(session.user.id);

    console.log(`[getBillingInfo] Payment history count: ${paymentHistory.length}`);

    return {
      success: true,
      data: {
        activeSubscription: activeSubscription || undefined,
        paymentHistory,
      },
    };
  } catch (error) {
    billingErrorLogger.logError(error as Error, {
      operation: 'getBillingInfo',
      userId: session?.user?.id,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get billing info',
    };
  }
}

export async function getUserSubscription(): Promise<ActionResult<PaymentRecord | null>> {
  let session: { user?: { id: string } } | null = null;

  try {
    session = await getSessionWithAuthBypass();
    if (!session?.user) {
      return {
        success: false,
        error: 'Please login first',
      };
    }

    const subscription = await paymentRepository.findActiveSubscriptionByUserId(session.user.id);

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    billingErrorLogger.logError(error as Error, {
      operation: 'getUserSubscription',
      userId: session?.user?.id,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user subscription',
    };
  }
}
