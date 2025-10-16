import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/auth-utils';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import db from '@/server/db';
import { userCredits, creditTransactions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getCreditsForPlan, formatPlanName } from '@/lib/creem/plan-utils';

export const dynamic = 'force-dynamic';

async function grantSubscriptionCredits(
  userId: string,
  planIdentifier: string,
  subscriptionId: string,
  interval: 'month' | 'year'
) {
  const creditInfo = getCreditsForPlan(planIdentifier, interval);

  if (!creditInfo.plan || creditInfo.amount <= 0) {
    console.log(
      `[Creem Sync] No credits configured for plan identifier ${planIdentifier} (interval=${interval})`
    );
    return;
  }

  const creditsToGrant = creditInfo.amount;
  const normalizedPlanId = creditInfo.planId;
  const planDisplayName = formatPlanName(creditInfo.plan, normalizedPlanId);
  const isYearly = creditInfo.interval === 'year';

  try {
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
        description: `${planDisplayName} subscription credits (Creem)`,
        referenceId: `creem_${subscriptionId}`,
        metadata: JSON.stringify({
          planId: normalizedPlanId,
          planIdentifier,
          isYearly,
          subscriptionId,
          provider: 'creem',
        }),
      });
    });

    console.log(
      `[Creem Sync] Granted ${creditsToGrant} credits to user ${userId} for ${normalizedPlanId} subscription`
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
    const newInterval = isYearly ? 'year' : 'month';
    
    console.log(`[Creem Sync] Requested plan: ${planId} ${newInterval}`);

    // Check if subscription already exists
    const existingSubscription = await paymentRepository.findActiveSubscriptionByUserId(
      session.user.id
    );

    if (existingSubscription) {
      const currentPlan = existingSubscription.priceId;
      const currentInterval = existingSubscription.interval;
      
      console.log(`[Creem Sync] User already has active subscription: ${currentPlan} ${currentInterval}`);
      console.log(`[Creem Sync] Attempting to create: ${planId} ${newInterval}`);
      
      // Check if this is the exact same subscription (idempotency check)
      // If subscription was created within the last 30 seconds with same plan/interval, it's likely a duplicate request
      const subscriptionAge = Date.now() - new Date(existingSubscription.createdAt).getTime();
      const isRecentDuplicate = 
        currentPlan === planId && 
        currentInterval === newInterval && 
        subscriptionAge < 30000; // 30 seconds
      
      if (isRecentDuplicate) {
        console.log(`[Creem Sync] Duplicate request detected - subscription created ${subscriptionAge}ms ago`);
        return NextResponse.json({
          success: true,
          message: 'Subscription already exists (duplicate request ignored)',
          subscription: {
            id: existingSubscription.id,
            planId: existingSubscription.priceId,
            status: existingSubscription.status,
          },
        });
      }
      
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
        console.log(`[Creem Sync] Plan/interval change detected: ${currentPlan} ${currentInterval} → ${planId} ${newInterval}`);
        
        const isUpgrade = 
          (currentPlan === 'pro' && planId === 'proplus') ||
          (currentInterval === 'month' && newInterval === 'year');
        
        if (isUpgrade) {
          console.log(`[Creem Sync] This is an upgrade - scheduling for period end`);
          
          await paymentRepository.update(existingSubscription.id, {
            priceId: planId,
            interval: newInterval,
          });
          
          await paymentRepository.createEvent({
            paymentId: existingSubscription.id,
            eventType: 'upgraded',
            eventData: JSON.stringify({
              subscriptionId: existingSubscription.subscriptionId,
              oldPlan: currentPlan,
              oldInterval: currentInterval,
              newPlan: planId,
              newInterval: newInterval,
              scheduledAt: new Date().toISOString(),
              effectiveAt: existingSubscription.periodEnd?.toISOString(),
            }),
          });
          
          console.log(`[Creem Sync] Upgrade scheduled for period end: ${existingSubscription.periodEnd?.toISOString()}`);
          
          return NextResponse.json({
            success: true,
            message: `Subscription will be upgraded to ${planId.toUpperCase()} ${newInterval === 'year' ? 'yearly' : 'monthly'} at the end of current period`,
            subscription: {
              id: existingSubscription.id,
              planId: planId,
              status: existingSubscription.status,
              currentPeriodEnd: existingSubscription.periodEnd?.toISOString(),
            },
          });
        } else {
          console.log(`[Creem Sync] This is a downgrade - canceling old and creating new`);
          
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
              reason: 'plan_changed',
              oldPlan: currentPlan,
              oldInterval: currentInterval,
              newPlan: planId,
              newInterval: newInterval,
            }),
          });
          
          console.log(`[Creem Sync] Old subscription canceled, proceeding with new subscription`);
        }
      }
    }

    // Create subscription record
    const subscriptionId = `sub_${checkoutId}`;
    const customerId = `cus_${session.user.id}`;
    
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (isYearly ? 12 : 1));

    const newSubscriptionData = {
      id: subscriptionId,
      provider: 'creem' as const,
      priceId: planId,
      type: 'subscription' as const,
      interval: isYearly ? 'year' as const : 'month' as const,
      userId: session.user.id,
      customerId,
      subscriptionId,
      status: 'active' as const,
      periodStart: now,
      periodEnd,
    };

    console.log(`[Creem Sync] Creating new subscription:`, newSubscriptionData);

    await paymentRepository.create(newSubscriptionData);

    console.log(`[Creem Sync] Subscription created successfully in database`);

    // Grant subscription credits
    await grantSubscriptionCredits(
      session.user.id,
      planId,
      subscriptionId,
      newInterval
    );

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
