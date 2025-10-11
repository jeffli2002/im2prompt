import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/auth-utils';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import db from '@/server/db';
import { userCredits, creditTransactions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

async function grantSubscriptionCredits(
  userId: string,
  planId: string,
  subscriptionId: string,
  isYearly: boolean
) {
  try {
    const creditsToGrant = isYearly
      ? planId === 'proplus'
        ? 10800
        : 6000
      : planId === 'proplus'
      ? 900
      : 500;

    await db.transaction(async (tx) => {
      const [userCredit] = await tx
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .limit(1);

      if (userCredit) {
        const newBalance = userCredit.balance + creditsToGrant;
        await tx
          .update(userCredits)
          .set({
            balance: newBalance,
            totalEarned: userCredit.totalEarned + creditsToGrant,
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId));
      } else {
        await tx.insert(userCredits).values({
          id: uuidv4(),
          userId,
          balance: creditsToGrant,
          totalEarned: creditsToGrant,
          totalSpent: 0,
          frozenBalance: 0,
        });
      }

      await tx.insert(creditTransactions).values({
        id: uuidv4(),
        userId,
        type: 'earn',
        amount: creditsToGrant,
        balanceAfter: userCredit ? userCredit.balance + creditsToGrant : creditsToGrant,
        source: 'subscription',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} subscription credits (Creem)`,
        referenceId: `creem_${subscriptionId}`,
        metadata: JSON.stringify({
          planId,
          isYearly,
          subscriptionId,
          provider: 'creem',
        }),
      });
    });

    console.log(
      `[Creem Sync] Granted ${creditsToGrant} credits to user ${userId} for ${planId} subscription`
    );
  } catch (error) {
    console.error('[Creem Sync] Error granting subscription credits:', error);
  }
}

/**
 * Manual sync endpoint for development mode
 * Call this after successful payment to sync subscription status
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Creem Sync] Received sync request');
    
    const session = await getSessionFromRequest(request.headers);

    if (!session?.user) {
      console.error('[Creem Sync] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`[Creem Sync] User authenticated: ${session.user.id}`);

    const body = await request.json();
    const { checkoutId } = body;

    if (!checkoutId) {
      console.error('[Creem Sync] Missing checkoutId');
      return NextResponse.json(
        { error: 'Missing checkoutId' },
        { status: 400 }
      );
    }

    console.log(`[Creem Sync] Syncing checkout ${checkoutId} for user ${session.user.id}`);

    // In development, we'll create a mock subscription record
    // In production, this would fetch from Creem API
    const planId = body.planId || 'pro'; // Default to pro if not specified
    const isYearly = body.isYearly || false;

    // Check if subscription already exists
    const existingSubscription = await paymentRepository.findActiveSubscriptionByUserId(
      session.user.id
    );

    if (existingSubscription) {
      const currentPlan = existingSubscription.priceId.includes('proplus') ? 'proplus' : 'pro';
      const currentInterval = existingSubscription.interval;
      const newInterval = isYearly ? 'year' : 'month';
      
      console.log(`[Creem Sync] User already has active subscription: ${currentPlan} ${currentInterval}`);
      console.log(`[Creem Sync] Attempting to create: ${planId} ${newInterval}`);
      
      // If subscription is set to cancel at period end, immediately cancel it and create new one
      if (existingSubscription.cancelAtPeriodEnd) {
        console.log(`[Creem Sync] Existing subscription is set to cancel, immediately canceling it`);
        
        // Immediately cancel the old subscription
        await paymentRepository.update(existingSubscription.id, {
          status: 'canceled',
          cancelAtPeriodEnd: false,
        });
        
        await paymentRepository.createEvent({
          paymentId: existingSubscription.id,
          eventType: 'canceled',
          eventData: JSON.stringify({
            subscriptionId: existingSubscription.subscriptionId,
            canceledAt: new Date().toISOString(),
            reason: 'plan_upgraded',
            newPlan: planId,
            newInterval: newInterval,
          }),
        });
        
        console.log(`[Creem Sync] Old subscription canceled, proceeding with new subscription`);
      } else if (currentPlan === planId && currentInterval === newInterval) {
        // If trying to subscribe to the exact same plan AND interval without cancellation, reject
        return NextResponse.json({
          success: false,
          error: `You already have an active ${planId.toUpperCase()} ${newInterval === 'year' ? 'yearly' : 'monthly'} subscription`,
        }, { status: 400 });
      } else {
        // For different plans or intervals without cancellation, reject
        return NextResponse.json({
          success: false,
          error: `You already have an active ${currentPlan.toUpperCase()} ${currentInterval === 'year' ? 'yearly' : 'monthly'} subscription. Please cancel it before subscribing to a different plan.`,
        }, { status: 400 });
      }
    }

    // Create subscription record
    const subscriptionId = `sub_${checkoutId}`;
    const customerId = `cus_${session.user.id}`;
    
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (isYearly ? 12 : 1));

    await paymentRepository.create({
      id: subscriptionId,
      provider: 'creem',
      priceId: planId,
      type: 'subscription',
      interval: isYearly ? 'year' : 'month',
      userId: session.user.id,
      customerId,
      subscriptionId,
      status: 'active',
      periodStart: now,
      periodEnd,
    });

    // Grant subscription credits
    await grantSubscriptionCredits(session.user.id, planId, subscriptionId, isYearly);

    console.log(`[Creem Sync] Successfully synced subscription for user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        id: subscriptionId,
        planId,
        status: 'active',
      },
    });
  } catch (error) {
    console.error('[Creem Sync] Error syncing checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync checkout';
    console.error('[Creem Sync] Error details:', errorMessage);
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
