'use server';

import { getSession } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import { ActionResult } from '@/payment/types';
import { logger } from '@/lib/monitoring/logger';

export async function reactivateSubscription(
  subscriptionId: string
): Promise<ActionResult<{ reactivated: boolean }>> {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      logger.warn('[Reactivate] Unauthorized reactivation attempt', {
        subscriptionId,
      });
      return {
        success: false,
        error: 'You must be logged in to reactivate subscription',
      };
    }

    const subscription = await paymentRepository.findBySubscriptionId(subscriptionId);
    
    if (!subscription) {
      logger.warn('[Reactivate] Subscription not found', {
        subscriptionId,
        userId: session.user.id,
      });
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    if (subscription.userId !== session.user.id) {
      logger.warn('[Reactivate] Unauthorized subscription access', {
        subscriptionId,
        userId: session.user.id,
        subscriptionUserId: subscription.userId,
      });
      return {
        success: false,
        error: 'You do not have permission to modify this subscription',
      };
    }

    if (!subscription.cancelAtPeriodEnd) {
      logger.info('[Reactivate] Subscription not set to cancel', {
        subscriptionId,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      });
      return {
        success: false,
        error: 'This subscription is not scheduled for cancellation',
      };
    }

    if (subscription.status === 'canceled') {
      logger.warn('[Reactivate] Cannot reactivate already canceled subscription', {
        subscriptionId,
        status: subscription.status,
      });
      return {
        success: false,
        error: 'This subscription has already been canceled and cannot be reactivated',
      };
    }

    logger.info('[Reactivate] Starting reactivation', {
      subscriptionId,
      userId: session.user.id,
      currentStatus: subscription.status,
    });

    const result = await creemService.reactivateSubscription(subscription.subscriptionId!);

    if (!result.success) {
      logger.error('[Reactivate] Reactivation failed', {
        subscriptionId,
        error: result.error,
      });
      return {
        success: false,
        error: result.error || 'Failed to reactivate subscription',
      };
    }

    await paymentRepository.update(subscription.id, {
      cancelAtPeriodEnd: false,
    });

    await paymentRepository.createEvent({
      paymentId: subscription.id,
      eventType: 'updated',
      eventData: JSON.stringify({
        action: 'reactivated',
        userId: session.user.id,
        reactivatedAt: new Date().toISOString(),
        previousCancelAtPeriodEnd: true,
      }),
    });

    logger.info('[Reactivate] Subscription reactivated successfully', {
      subscriptionId,
      userId: session.user.id,
    });

    return {
      success: true,
      data: {
        reactivated: true,
      },
      message: 'Your subscription has been reactivated and will continue at the end of the current billing period',
    };
  } catch (error) {
    logger.error('[Reactivate] Unexpected error', {
      error,
      subscriptionId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
