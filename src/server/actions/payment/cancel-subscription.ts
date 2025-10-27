'use server';

import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import type { ActionResult } from '@/payment/types';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

const cancelErrorLogger = new ErrorLogger('cancel-subscription');

export async function cancelSubscription(
  subscriptionId: string
): Promise<ActionResult<{ canceled: boolean }>> {
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

    if (paymentRecord.status === 'canceled') {
      return {
        success: false,
        error: 'Subscription already canceled',
      };
    }

    const result = await creemService.cancelSubscription(subscriptionId);
    if (!result.success) {
      if (result.error?.includes('does not exist') || result.error?.includes('not found')) {
        await paymentRepository.update(paymentRecord.id, {
          status: 'canceled',
        });
      }
      return {
        success: false,
        error: result.error || 'Failed to cancel subscription',
      };
    }

    await paymentRepository.update(paymentRecord.id, {
      cancelAtPeriodEnd: true,
    });

    await paymentRepository.createEvent({
      paymentId: paymentRecord.id,
      eventType: 'canceled',
      eventData: JSON.stringify({
        subscriptionId,
        canceledAt: new Date().toISOString(),
        cancelAtPeriodEnd: true,
      }),
    });

    return {
      success: true,
      data: {
        canceled: true,
      },
      message: 'Subscription will be canceled at the end of current period',
    };
  } catch (error) {
    cancelErrorLogger.logError(error as Error, {
      operation: 'cancelSubscription',
      userId: session?.user?.id,
      subscriptionId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    };
  }
}
