import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/auth-utils';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request.headers);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSubscription = await paymentRepository.findActiveSubscriptionByUserId(
      session.user.id
    );

    if (!activeSubscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      subscription: {
        id: activeSubscription.id,
        subscriptionId: activeSubscription.subscriptionId,
        status: activeSubscription.status,
        priceId: activeSubscription.priceId,
        interval: activeSubscription.interval,
        periodStart: activeSubscription.periodStart,
        periodEnd: activeSubscription.periodEnd,
        cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription' },
      { status: 500 }
    );
  }
}
