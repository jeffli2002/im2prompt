import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { CreemProvider } from '@/payment/creem/provider';
import { isCreemConfigured } from '@/payment/creem/client';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import { ErrorLogger } from '@/lib/logger/logger-utils';
import { z } from 'zod';

const errorLogger = new ErrorLogger('creem-subscription-manage');

const updateSchema = z.object({
  priceId: z.string().min(1).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    if (!isCreemConfigured) {
      return NextResponse.json(
        { error: 'Creem is not configured' },
        { status: 503 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscriptionId } = await params;
    const paymentRecord = await paymentRepository.findBySubscriptionId(
      subscriptionId
    );

    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const creemProvider = new CreemProvider();
    const subscription = await creemProvider.getSubscription(subscriptionId);

    return NextResponse.json(subscription);
  } catch (error) {
    const { subscriptionId } = await params;
    errorLogger.logError(error as Error, {
      operation: 'get-subscription',
      subscriptionId: subscriptionId,
    });
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    if (!isCreemConfigured) {
      return NextResponse.json(
        { error: 'Creem is not configured' },
        { status: 503 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscriptionId } = await params;
    const paymentRecord = await paymentRepository.findBySubscriptionId(
      subscriptionId
    );

    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const creemProvider = new CreemProvider();
    const result = await creemProvider.updateSubscription(
      subscriptionId,
      validatedData
    );

    return NextResponse.json(result);
  } catch (error) {
    const { subscriptionId } = await params;
    errorLogger.logError(error as Error, {
      operation: 'update-subscription',
      subscriptionId: subscriptionId,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    if (!isCreemConfigured) {
      return NextResponse.json(
        { error: 'Creem is not configured' },
        { status: 503 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { subscriptionId } = await params;
    const paymentRecord = await paymentRepository.findBySubscriptionId(
      subscriptionId
    );

    if (!paymentRecord || paymentRecord.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const creemProvider = new CreemProvider();
    const success = await creemProvider.cancelSubscription(subscriptionId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { subscriptionId } = await params;
    errorLogger.logError(error as Error, {
      operation: 'cancel-subscription',
      subscriptionId: subscriptionId,
    });
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}