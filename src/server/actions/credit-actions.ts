'use server';

import { paymentConfig } from '@/config';
import { creditsConfig } from '@/config/credits.config';
import { auth } from '@/lib/auth/auth';
import { getSessionWithAuthBypass } from '@/lib/auth/auth-utils';
import { creditService } from '@/lib/credits';
import type { CreditTransaction, UserCreditAccount } from '@/lib/credits';
import { getCreditsForPlan, resolvePlanByIdentifier } from '@/lib/creem/plan-utils';
import { type QuotaService, quotaService, updateQuotaUsage } from '@/lib/quota/quota-service';
import type { ActionResult } from '@/payment/types';
import db from '@/server/db';
import { paymentRepository } from '@/server/db/repositories/payment-repository';
import { creditTransactions, userQuotaUsage } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export interface GetCreditBalanceResponse extends UserCreditAccount {
  availableBalance: number;
}

export interface GetCreditHistoryParams {
  limit?: number;
  offset?: number;
}

export interface GetQuotaUsageResponse {
  apiCalls?: {
    used: number;
    limit: number;
    isUnlimited: boolean;
  };
  storage: {
    used: number; // in bytes
    limit: number; // in bytes
    isUnlimited: boolean;
  };
  imageGeneration?: {
    daily: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
    monthly: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
  };
  videoGeneration?: {
    daily: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
    monthly: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
  };
  imageExtraction?: {
    daily: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
    monthly: {
      used: number;
      limit: number;
      isUnlimited: boolean;
    };
  };
}

/**
 * Get user's credit balance
 */
export async function getCreditBalance(): Promise<ActionResult<GetCreditBalanceResponse>> {
  try {
    const session = await getSessionWithAuthBypass();

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    let account = await creditService.getOrCreateCreditAccount(session.user.id);

    const granted = await ensureSubscriptionCredits(session.user.id);
    if (granted) {
      account = await creditService.getOrCreateCreditAccount(session.user.id);
    }

    return {
      success: true,
      data: {
        ...account,
        availableBalance: account.balance - account.frozenBalance,
      },
    };
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return {
      success: false,
      error: 'Failed to get credit balance',
    };
  }
}

async function ensureSubscriptionCredits(userId: string): Promise<boolean> {
  try {
    // Skip if user already has subscription-based credit history
    const existingSubscriptionCredit = await db
      .select({ id: creditTransactions.id })
      .from(creditTransactions)
      .where(
        and(eq(creditTransactions.userId, userId), eq(creditTransactions.source, 'subscription'))
      )
      .limit(1);

    if (existingSubscriptionCredit.length > 0) {
      return false;
    }

    const subscription = await paymentRepository.findActiveSubscriptionByUserId(userId);
    if (!subscription) {
      return false;
    }

    const interval = subscription.interval === 'year' ? 'year' : 'month';
    const creditInfo = getCreditsForPlan(subscription.priceId, interval);

    if (!creditInfo.plan || creditInfo.amount <= 0) {
      return false;
    }

    await creditService.earnCredits({
      userId,
      amount: creditInfo.amount,
      source: 'subscription',
      description: `${creditInfo.plan.name} subscription credits`,
      referenceId: `auto_grant_${subscription.subscriptionId || subscription.id}_${Date.now()}`,
      metadata: {
        planId: creditInfo.planId,
        interval,
        provider: subscription.provider,
        reason: 'auto_grant_missing_subscription_credits',
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to ensure subscription credits:', error);
    return false;
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
  params: GetCreditHistoryParams = {}
): Promise<ActionResult<CreditTransaction[]>> {
  try {
    const session = await getSessionWithAuthBypass();

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const { limit = 50, offset = 0 } = params;
    const transactions = await creditService.getTransactionHistory(session.user.id, limit, offset);

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error('Error getting credit history:', error);
    return {
      success: false,
      error: 'Failed to get credit history',
    };
  }
}

/**
 * Get user's quota usage for current month and day
 */
export async function getQuotaUsage(): Promise<ActionResult<GetQuotaUsageResponse>> {
  try {
    const session = await getSessionWithAuthBypass();

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get current periods
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const currentDailyPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

    // Get user's current subscription to determine limits
    const subscription = await paymentRepository.findActiveSubscriptionByUserId(session.user.id);

    // Get monthly usage records
    const monthlyUsageRecords = await db
      .select({
        service: userQuotaUsage.service,
        usedAmount: userQuotaUsage.usedAmount,
      })
      .from(userQuotaUsage)
      .where(
        and(eq(userQuotaUsage.userId, session.user.id), eq(userQuotaUsage.period, currentPeriod))
      );

    // Get daily usage records
    const dailyUsageRecords = await db
      .select({
        service: userQuotaUsage.service,
        usedAmount: userQuotaUsage.usedAmount,
      })
      .from(userQuotaUsage)
      .where(
        and(
          eq(userQuotaUsage.userId, session.user.id),
          eq(userQuotaUsage.period, currentDailyPeriod)
        )
      );

    // Extract usage data
    const storageUsage =
      monthlyUsageRecords.find((record) => record.service === 'storage')?.usedAmount || 0;
    const monthlyImageGenUsage =
      monthlyUsageRecords.find((record) => record.service === 'image_generation')?.usedAmount || 0;
    const monthlyVideoGenUsage =
      monthlyUsageRecords.find((record) => record.service === 'video_generation')?.usedAmount || 0;
    const monthlyImageExtUsage =
      monthlyUsageRecords.find((record) => record.service === 'image_extraction')?.usedAmount || 0;
    const dailyImageGenUsage =
      dailyUsageRecords.find((record) => record.service === 'image_generation')?.usedAmount || 0;
    const dailyVideoGenUsage =
      dailyUsageRecords.find((record) => record.service === 'video_generation')?.usedAmount || 0;
    const dailyImageExtUsage =
      dailyUsageRecords.find((record) => record.service === 'image_extraction')?.usedAmount || 0;

    // Get limits from payment config
    const resolvedPlan = subscription
      ? resolvePlanByIdentifier(subscription.priceId, subscription.interval || undefined)
      : resolvePlanByIdentifier('free');

    const userPlan = resolvedPlan?.plan || paymentConfig.plans.find((p) => p.id === 'free');
    const planLimits = userPlan?.limits || paymentConfig.plans[0]?.limits || {}; // Default to free plan

    // Determine limits
    const baseStorageLimit = creditsConfig.freeUser.storage.freeQuotaGB * 1024 * 1024 * 1024;
    let storageLimit = baseStorageLimit;
    let isStorageUnlimited = false;

    if (subscription) {
      switch (subscription.priceId) {
        case process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY:
        case process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY:
          storageLimit = 10 * 1024 * 1024 * 1024;
          break;
        case process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY:
        case process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_YEARLY:
          isStorageUnlimited = true;
          break;
      }
    }

    return {
      success: true,
      data: {
        storage: {
          used: storageUsage,
          limit: storageLimit,
          isUnlimited: isStorageUnlimited,
        },
        imageGeneration: {
          daily: {
            used: dailyImageGenUsage,
            limit: planLimits.dailyImages || 0,
            isUnlimited: (planLimits.dailyImages || 0) === -1,
          },
          monthly: {
            used: monthlyImageGenUsage,
            limit: planLimits.images || 0,
            isUnlimited: (planLimits.images || 0) === -1,
          },
        },
        videoGeneration: {
          daily: {
            used: dailyVideoGenUsage,
            limit: planLimits.dailyVideos || 0,
            isUnlimited: (planLimits.dailyVideos || 0) === -1,
          },
          monthly: {
            used: monthlyVideoGenUsage,
            limit: planLimits.videos || 0,
            isUnlimited: (planLimits.videos || 0) === -1,
          },
        },
        imageExtraction: {
          daily: {
            used: dailyImageExtUsage,
            limit: planLimits.extractions || 0,
            isUnlimited: (planLimits.extractions || 0) === -1,
          },
          monthly: {
            used: monthlyImageExtUsage,
            limit: planLimits.extractions || 0,
            isUnlimited: (planLimits.extractions || 0) === -1,
          },
        },
      },
    };
  } catch (error) {
    console.error('Error getting quota usage:', error);
    return {
      success: false,
      error: 'Failed to get quota usage',
    };
  }
}

/**
 * Admin function to grant credits to a user
 */
export async function grantCreditsToUser(
  userId: string,
  amount: number,
  description?: string
): Promise<ActionResult<CreditTransaction>> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Check if current user is admin (implement your admin check logic)
    // For now, we'll assume only certain users can do this
    // Note: The user type from better-auth might not have role by default
    const userWithRole = session.user as typeof session.user & { role?: string };
    const isAdmin = userWithRole.role === 'admin';

    if (!isAdmin) {
      return {
        success: false,
        error: 'Admin access required',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be positive',
      };
    }

    const transaction = await creditService.earnCredits({
      userId,
      amount,
      source: 'admin',
      description: description || `Admin granted ${amount} credits`,
      referenceId: `admin_${session.user.id}_${Date.now()}`,
      metadata: {
        grantedBy: session.user.id,
        grantedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      data: transaction,
      message: `Successfully granted ${amount} credits to user`,
    };
  } catch (error) {
    console.error('Error granting credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to grant credits',
    };
  }
}

/**
 * Spend credits for a specific service
 */
export async function spendCredits(
  amount: number,
  service: 'api_call' | 'storage',
  description?: string,
  referenceId?: string
): Promise<ActionResult<CreditTransaction>> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be positive',
      };
    }

    // Check if user has enough credits
    const hasEnough = await creditService.hasEnoughCredits(session.user.id, amount);
    if (!hasEnough) {
      return {
        success: false,
        error: 'Insufficient credits',
      };
    }

    const transaction = await creditService.spendCredits({
      userId: session.user.id,
      amount,
      source: service,
      description: description || `${service.replace('_', ' ')} usage`,
      referenceId,
      metadata: {
        service,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.error('Error spending credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to spend credits',
    };
  }
}

/**
 * Update user quota usage for a specific service
 */
export async function updateUserQuotaUsage(
  service: QuotaService,
  amount: number
): Promise<ActionResult<{ used: number; service: QuotaService }>> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const updatedRecord = await updateQuotaUsage({
      userId: session.user.id,
      service,
      amount,
    });

    return {
      success: true,
      data: {
        used: updatedRecord.usedAmount,
        service: updatedRecord.service,
      },
    };
  } catch (error) {
    console.error('Error updating quota usage:', error);
    return {
      success: false,
      error: 'Failed to update quota usage',
    };
  }
}

/**
 * Initialize quota usage for current user (useful for new users)
 */
export async function initializeUserQuotaUsage(): Promise<ActionResult<{ message: string }>> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: Object.fromEntries(headersList.entries()),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    await quotaService.initializeForUser(session.user.id);

    return {
      success: true,
      data: {
        message: 'Quota usage initialized successfully',
      },
    };
  } catch (error) {
    console.error('Error initializing quota usage:', error);
    return {
      success: false,
      error: 'Failed to initialize quota usage',
    };
  }
}
