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

    // Handle existing active subscription
    if (activeSubscription) {
      const currentPlan: 'pro' | 'proplus' = activeSubscription.priceId.includes('proplus') ? 'proplus' : 'pro';
      const currentInterval = activeSubscription.interval;
      
      console.log(`[Create Checkout] User ${session.user.id} has active ${currentPlan} ${currentInterval} subscription`);
      
      // Prevent subscribing to the exact same plan and interval
      if (currentPlan === planId && currentInterval === interval) {
        return NextResponse.json(
          { 
            error: `You already have an active ${planId.toUpperCase()} ${interval === 'year' ? 'yearly' : 'monthly'} subscription`,
            code: 'DUPLICATE_SUBSCRIPTION'
          },
          { status: 400 }
        );
      }

      // Auto-cancel existing subscription when switching plans
      // The new subscription will be scheduled to start at the end of current period
      if (!activeSubscription.cancelAtPeriodEnd) {
        console.log(`[Create Checkout] Auto-canceling existing ${currentPlan} subscription for plan change`);
        
        try {
          if (!activeSubscription.subscriptionId) {
            console.log(`[Create Checkout] No subscription ID found for subscription ${activeSubscription.id}`);
            return NextResponse.json(
              { error: 'Invalid subscription data' },
              { status: 400 }
            );
          }
          
          const cancelResult = await creemService.cancelSubscription(activeSubscription.subscriptionId);
          
          if (cancelResult.success) {
            await paymentRepository.update(activeSubscription.id, {
              cancelAtPeriodEnd: true,
            });
            
            await paymentRepository.createEvent({
              paymentId: activeSubscription.id,
              eventType: 'canceled',
              eventData: JSON.stringify({
                subscriptionId: activeSubscription.subscriptionId,
                canceledAt: new Date().toISOString(),
                cancelAtPeriodEnd: true,
                reason: 'plan_change',
                newPlan: planId,
                newInterval: interval,
              }),
            });
            
            console.log(`[Create Checkout] Successfully canceled ${currentPlan} subscription, proceeding with ${planId} checkout`);
          } else {
            console.warn(`[Create Checkout] Failed to cancel subscription: ${cancelResult.error}`);
            // Continue anyway - user might need to manually cancel
          }
        } catch (error) {
          console.error('[Create Checkout] Error canceling existing subscription:', error);
          // Continue with checkout - better to let user proceed than block them
        }
      } else {
        console.log(`[Create Checkout] Existing subscription already set to cancel, proceeding with new checkout`);
      }
    }

    let currentPlanForCheckout: 'free' | 'pro' | 'proplus' = 'free';
    if (activeSubscription) {
      currentPlanForCheckout = activeSubscription.priceId.includes('proplus') ? 'proplus' : 'pro';
    }

    const result = await creemService.createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      planId: planId as 'pro' | 'proplus',
      interval: interval as 'month' | 'year',
      successUrl,
      cancelUrl,
      currentPlan: currentPlanForCheckout,
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
