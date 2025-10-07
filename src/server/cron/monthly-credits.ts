import { and, eq, inArray, isNull, not, or } from 'drizzle-orm';
import db from '@/server/db';
import { user, payment } from '@/server/db/schema';
import { creditService } from '@/lib/credits';
import { paymentConfig } from '@/config/payment.config';
import { quotaService } from '@/lib/quota/quota-service';

/**
 * Grant monthly free credits to users without active subscriptions
 * and update quota usage records for all users
 * This should be run on the 1st of each month
 */
export async function grantMonthlyFreeCredits() {
  console.log('🎁 Starting monthly free credits distribution and quota update...');
  
  try {
    // Get all users who don't have active subscriptions (free users)
    const freeUsers = await db
      .select({ 
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      })
      .from(user)
      .leftJoin(payment, eq(payment.userId, user.id))
      .where(
        or(
          isNull(payment.status),
          not(inArray(payment.status, ['active', 'trialing']))
        )
      );

    console.log(`Found ${freeUsers.length} free users`);

    const freePlan = paymentConfig.plans.find(p => p.id === 'free');
    const freeCredits = freePlan?.credits?.monthly || 0;
    
    if (!freeCredits || freeCredits <= 0) {
      console.log('ℹ️ No monthly credits configured for free plan (free users get one-time signup bonus only)');
      console.log('✅ Monthly credits distribution completed (0 free users to process)');
      return { 
        success: true, 
        totalUsers: 0,
        successCount: 0,
        errorCount: 0,
        creditsPerUser: 0,
        totalCreditsDistributed: 0,
        quotaUpdateSuccessCount: 0,
        quotaUpdateErrorCount: 0,
        message: 'Free users do not receive monthly credits'
      };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    // Process each free user
    for (const user of freeUsers) {
      try {
        // Check if user already has a credit account, create if not
        await creditService.getOrCreateCreditAccount(user.userId);
        
        // Grant monthly credits
        await creditService.earnCredits({
          userId: user.userId,
          amount: freeCredits,
          source: 'subscription',
          description: 'Monthly free credits',
          referenceId: `free_${new Date().toISOString().slice(0, 7)}`, // YYYY-MM format
          metadata: {
            type: 'monthly_free_credits',
            planId: 'free',
            month: new Date().toISOString().slice(0, 7),
          },
        });

        successCount++;
        console.log(`✅ Granted ${freeCredits} credits to ${user.userEmail} (${user.userId})`);
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ userId: user.userId, error: errorMessage });
        console.error(`❌ Failed to grant credits to ${user.userEmail} (${user.userId}):`, errorMessage);
      }
    }

    console.log('🎯 Monthly free credits distribution completed:');
    console.log(`   ✅ Success: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   💰 Total credits distributed: ${successCount * freeCredits}`);
    
    // Update quota usage records for all users (reset monthly usage)
    console.log('📊 Updating quota usage records for all users...');
    let quotaUpdateSuccessCount = 0;
    let quotaUpdateErrorCount = 0;
    const quotaErrors: Array<{ userId: string; error: string }> = [];
    
    // Get all users for quota update
    const allUsers = await db.select({ id: user.id, email: user.email }).from(user);
    console.log(`Found ${allUsers.length} users for quota update`);
    
    for (const userData of allUsers) {
      try {
        await quotaService.initializeForUser(userData.id);
        quotaUpdateSuccessCount++;
        console.log(`✅ Updated quota records for ${userData.email} (${userData.id})`);
      } catch (error) {
        quotaUpdateErrorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        quotaErrors.push({ userId: userData.id, error: errorMessage });
        console.error(`❌ Failed to update quota for ${userData.email} (${userData.id}):`, errorMessage);
      }
    }
    
    console.log('📊 Quota update completed:');
    console.log(`   ✅ Success: ${quotaUpdateSuccessCount} users`);
    console.log(`   ❌ Errors: ${quotaUpdateErrorCount} users`);

    return {
      success: true,
      totalUsers: freeUsers.length,
      successCount,
      errorCount,
      creditsPerUser: freeCredits,
      totalCreditsDistributed: successCount * freeCredits,
      quotaUpdateSuccessCount,
      quotaUpdateErrorCount,
      errors: errors.length > 0 ? errors : undefined,
      quotaErrors: quotaErrors.length > 0 ? quotaErrors : undefined,
    };
  } catch (error) {
    console.error('💥 Fatal error in monthly credits distribution:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually trigger monthly credits distribution (for testing or manual runs)
 */
export async function triggerMonthlyCredits() {
  console.log('🔧 Manually triggering monthly credits distribution...');
  return await grantMonthlyFreeCredits();
}
