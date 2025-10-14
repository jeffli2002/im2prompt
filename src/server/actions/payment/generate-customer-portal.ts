'use server';

import { getSession } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import { ActionResult } from '@/payment/types';
import { logger } from '@/lib/monitoring/logger';
import { env } from '@/env';

export async function generateCustomerPortalLink(
  returnUrl?: string
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      logger.warn('[Customer Portal] Unauthorized portal access attempt');
      return {
        success: false,
        error: 'You must be logged in to access the customer portal',
      };
    }

    const subscription = await paymentRepository.findActiveSubscriptionByUserId(session.user.id);
    
    if (!subscription) {
      logger.warn('[Customer Portal] No active subscription found', {
        userId: session.user.id,
      });
      return {
        success: false,
        error: 'No active subscription found. You must have an active subscription to access the customer portal.',
      };
    }

    if (!subscription.customerId) {
      logger.error('[Customer Portal] No customer ID found', {
        userId: session.user.id,
        subscriptionId: subscription.id,
      });
      return {
        success: false,
        error: 'Customer ID not found for your subscription',
      };
    }

    const finalReturnUrl = returnUrl || `${env.NEXT_PUBLIC_APP_URL}/settings/billing`;

    logger.info('[Customer Portal] Generating portal link', {
      userId: session.user.id,
      customerId: subscription.customerId,
      returnUrl: finalReturnUrl,
    });

    const result = await creemService.generateCustomerPortalLink(
      subscription.customerId,
      finalReturnUrl
    );

    if (!result.success || !result.url) {
      logger.error('[Customer Portal] Failed to generate portal link', {
        userId: session.user.id,
        customerId: subscription.customerId,
        error: result.error,
      });
      return {
        success: false,
        error: result.error || 'Failed to generate customer portal link',
      };
    }

    await paymentRepository.createEvent({
      paymentId: subscription.id,
      eventType: 'updated',
      eventData: JSON.stringify({
        action: 'customer_portal_accessed',
        userId: session.user.id,
        accessedAt: new Date().toISOString(),
      }),
    });

    logger.info('[Customer Portal] Portal link generated successfully', {
      userId: session.user.id,
      customerId: subscription.customerId,
    });

    return {
      success: true,
      data: {
        url: result.url,
      },
      message: 'Customer portal link generated successfully',
    };
  } catch (error) {
    logger.error('[Customer Portal] Unexpected error', {
      error,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
