import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/auth-utils';
import { creemService } from '@/lib/creem/creem-service';
import { paymentRepository } from '@/server/db/repositories/payment-repository';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request.headers);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription ID' },
        { status: 400 }
      );
    }

    const paymentRecord = await paymentRepository.findBySubscriptionId(subscriptionId);
    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found or unauthorized' },
        { status: 404 }
      );
    }

    const result = await creemService.cancelSubscription(subscriptionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await paymentRepository.update(paymentRecord.id, {
      status: 'canceled',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
