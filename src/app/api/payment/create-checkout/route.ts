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
    const { planId, interval = 'month', successUrl, cancelUrl } = body;

    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const activeSubscription = await paymentRepository.findActiveSubscriptionByUserId(
      session.user.id
    );

    // Check if user already has an active subscription
    if (activeSubscription) {
      const currentPlan = activeSubscription.priceId.includes('proplus') ? 'proplus' : 'pro';
      
      console.log(`[Create Checkout] User ${session.user.id} has active ${currentPlan} subscription`);
      
      // Prevent subscribing to the same plan
      if (currentPlan === planId) {
        return NextResponse.json(
          { 
            error: `You already have an active ${planId.toUpperCase()} subscription`,
            code: 'DUPLICATE_SUBSCRIPTION'
          },
          { status: 400 }
        );
      }

      // For plan changes, require cancellation first to avoid complexity
      // In the future, we can implement seamless plan changes via updateSubscription API
      return NextResponse.json(
        { 
          error: `You already have an active ${currentPlan.toUpperCase()} subscription. Please cancel it first before subscribing to a different plan.`,
          code: 'PLAN_CHANGE_REQUIRES_CANCELLATION',
          currentPlan,
          requestedPlan: planId
        },
        { status: 400 }
      );
    }

    const result = await creemService.createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      planId: planId as 'pro' | 'proplus',
      interval: interval as 'month' | 'year',
      successUrl,
      cancelUrl,
      currentPlan: activeSubscription ? (activeSubscription.priceId.includes('proplus') ? 'proplus' : 'pro') : 'free',
    });

    if (!result.success) {
      console.error('Creem checkout error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    console.log('[Create Checkout] Created Creem checkout session:', {
      sessionId: result.sessionId,
      planId,
      userId: session.user.id,
      email: session.user.email,
    });

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
