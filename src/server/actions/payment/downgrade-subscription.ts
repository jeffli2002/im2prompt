'use server';

import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import type { ActionResult } from '@/payment/types';
import { logger } from '@/lib/monitoring/logger';

export async function downgradeSubscription(
  subscriptionId: string,
  newPlanId: 'pro' | 'free',
  newInterval: 'month' | 'year',
  scheduleAtPeriodEnd: boolean = true
): Promise<ActionResult<{ downgraded: boolean; scheduledAtPeriodEnd?: boolean }>> {
  try {
    const session = await getSessionWithAuthBypass();
    
    if (!session?.user?.id) {
      logger.warn('[Downgrade] Unauthorized downgrade attempt', {
        subscriptionId,
      });
      return {
        success: false,
        error: 'You must be logged in to downgrade subscription',
      };
    }

    const subscription = await paymentRepository.findBySubscriptionId(subscriptionId);
    
    if (!subscription) {
      logger.warn('[Downgrade] Subscription not found', {
        subscriptionId,
        userId: session.user.id,
      });
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    if (subscription.userId !== session.user.id) {
      logger.warn('[Downgrade] Unauthorized subscription access', {
        subscriptionId,
        userId: session.user.id,
        subscriptionUserId: subscription.userId,
      });
      return {
        success: false,
        error: 'You do not have permission to modify this subscription',
      };
    }

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      logger.warn('[Downgrade] Cannot downgrade inactive subscription', {
        subscriptionId,
        status: subscription.status,
      });
      return {
        success: false,
        error: `Cannot downgrade ${subscription.status} subscription`,
      };
    }

    const currentPlan = subscription.priceId;
    const currentInterval = subscription.interval;
    
    if (currentPlan === newPlanId && currentInterval === newInterval) {
      return {
        success: false,
        error: 'You are already on this plan',
      };
    }

    const isDowngrade = 
      (currentPlan === 'proplus' && newPlanId === 'pro') ||
      (currentPlan === 'pro' && newPlanId === 'free') ||
      (currentInterval === 'year' && newInterval === 'month');

    if (!isDowngrade) {
      return {
        success: false,
        error: 'This is not a downgrade. Please use the upgrade function instead.',
      };
    }

    logger.info('[Downgrade] Starting downgrade', {
      subscriptionId,
      userId: session.user.id,
      currentPlan,
      newPlanId,
      currentInterval,
      newInterval,
      scheduleAtPeriodEnd,
    });

    if (newPlanId === 'free') {
      if (scheduleAtPeriodEnd) {
        await paymentRepository.update(subscription.id, {
          cancelAtPeriodEnd: true,
        });
        
        await paymentRepository.createEvent({
          paymentId: subscription.id,
          eventType: 'updated',
          eventData: JSON.stringify({
            action: 'downgrade_to_free_scheduled',
            scheduleAtPeriodEnd: true,
            periodEnd: subscription.periodEnd?.toISOString(),
            userId: session.user.id,
          }),
        });

        logger.info('[Downgrade] Scheduled cancellation at period end', {
          subscriptionId,
          periodEnd: subscription.periodEnd,
        });

        return {
          success: true,
          data: {
            downgraded: true,
            scheduledAtPeriodEnd: true,
          },
          message: 'Your subscription will be canceled at the end of the current billing period',
        };
      } else {
        const result = await creemService.cancelSubscription(subscription.subscriptionId!);

        if (!result.success) {
          logger.error('[Downgrade] Failed to cancel subscription', {
            subscriptionId,
            error: result.error,
          });
          return {
            success: false,
            error: result.error || 'Failed to cancel subscription',
          };
        }

        await paymentRepository.update(subscription.id, {
          status: 'canceled',
          cancelAtPeriodEnd: false,
        });

        await paymentRepository.createEvent({
          paymentId: subscription.id,
          eventType: 'canceled',
          eventData: JSON.stringify({
            action: 'downgrade_to_free_immediate',
            userId: session.user.id,
            canceledAt: new Date().toISOString(),
          }),
        });

        logger.info('[Downgrade] Subscription canceled immediately', {
          subscriptionId,
        });

        return {
          success: true,
          data: {
            downgraded: true,
            scheduledAtPeriodEnd: false,
          },
          message: 'Your subscription has been canceled',
        };
      }
    }

    const newProductKey = `${newPlanId}_${newInterval === 'year' ? 'yearly' : 'monthly'}` as 
      'pro_monthly' | 'pro_yearly' | 'proplus_monthly' | 'proplus_yearly';

    const result = await creemService.downgradeSubscription(
      subscription.subscriptionId!,
      newProductKey,
      scheduleAtPeriodEnd
    );

    if (!result.success) {
      logger.error('[Downgrade] Downgrade failed', {
        subscriptionId,
        error: result.error,
      });
      return {
        success: false,
        error: result.error || 'Failed to downgrade subscription',
      };
    }

    if (scheduleAtPeriodEnd && result.scheduledAtPeriodEnd) {
      await paymentRepository.update(subscription.id, {
        priceId: newPlanId,
        interval: newInterval,
      });
      
      await paymentRepository.createEvent({
        paymentId: subscription.id,
        eventType: 'updated',
        eventData: JSON.stringify({
          action: 'downgrade_scheduled',
          oldPlan: currentPlan,
          oldInterval: currentInterval,
          newPlan: newPlanId,
          newInterval: newInterval,
          scheduledAtPeriodEnd: true,
          periodEnd: subscription.periodEnd?.toISOString(),
          userId: session.user.id,
        }),
      });

      logger.info('[Downgrade] Downgrade scheduled at period end', {
        subscriptionId,
        newPlanId,
        newInterval,
        periodEnd: subscription.periodEnd,
      });

      return {
        success: true,
        data: {
          downgraded: true,
          scheduledAtPeriodEnd: true,
        },
        message: `Your subscription will be downgraded to ${newPlanId.toUpperCase()} ${newInterval === 'year' ? 'yearly' : 'monthly'} at the end of the current billing period`,
      };
    } else {
      await paymentRepository.update(subscription.id, {
        status: 'canceled',
      });
      
      await paymentRepository.createEvent({
        paymentId: subscription.id,
        eventType: 'canceled',
        eventData: JSON.stringify({
          action: 'downgrade_immediate',
          oldPlan: currentPlan,
          oldInterval: currentInterval,
          newPlan: newPlanId,
          newInterval: newInterval,
          userId: session.user.id,
        }),
      });

      logger.info('[Downgrade] Old subscription canceled, new subscription needs to be created', {
        subscriptionId,
        newPlanId,
        newInterval,
      });

      return {
        success: true,
        data: {
          downgraded: true,
          scheduledAtPeriodEnd: false,
        },
        message: 'Your subscription has been downgraded. Please complete the checkout for the new plan.',
      };
    }
  } catch (error) {
    logger.error('[Downgrade] Unexpected error', {
      error,
      subscriptionId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
