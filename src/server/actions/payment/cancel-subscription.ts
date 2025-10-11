'use server';

import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import type { ActionResult } from '@/payment/types';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';

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
        error: '请先登录',
      };
    }

    const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return {
        success: false,
        error: '订阅不存在或无权操作',
      };
    }

    if (paymentRecord.status === 'canceled') {
      return {
        success: false,
        error: '订阅已经被取消',
      };
    }

    const result = await creemService.cancelSubscription(subscriptionId);
    if (!result.success) {
      if (result.error?.includes('订阅不存在')) {
        await paymentRepository.update(paymentRecord.id, {
          status: 'canceled',
        });
      }
      return {
        success: false,
        error: result.error || '取消订阅失败',
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
      message: '订阅已设置为在当前周期结束后取消',
    };

  } catch (error) {
    cancelErrorLogger.logError(error as Error, {
      operation: 'cancelSubscription',
      userId: session?.user?.id,
      subscriptionId,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : '取消订阅失败',
    };
  }
} 