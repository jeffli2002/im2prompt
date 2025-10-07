import db from '@/server/db';
import { usageTracking, monthlyUsageTracking } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { creditsConfig } from '@/config/credits.config';

export interface QuotaCheckResult {
  canProceed: boolean;
  quotaRemaining: number;
  quotaUsed: number;
  quotaLimit: number;
  shouldChargeCredits: boolean;
  monthlyQuotaRemaining?: number;
  monthlyQuotaUsed?: number;
  monthlyQuotaLimit?: number;
}

export const quotaService = {
  async checkImageToPromptQuota(userId: string): Promise<QuotaCheckResult> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7); // YYYY-MM
    const dailyLimit = creditsConfig.freeUser.imageToText.freeQuotaPerDay;
    const monthlyLimit = creditsConfig.freeUser.imageToText.freeQuotaPerMonth;

    // Check daily usage
    const dailyUsage = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    // Check monthly usage
    const monthlyUsage = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    const dailyUsed = dailyUsage?.imageToTextCount || 0;
    const monthlyUsed = monthlyUsage?.imageToTextCount || 0;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    // User must satisfy both daily AND monthly limits
    const shouldChargeCredits = dailyUsed >= dailyLimit || monthlyUsed >= monthlyLimit;

    return {
      canProceed: true,
      quotaRemaining: dailyRemaining,
      quotaUsed: dailyUsed,
      quotaLimit: dailyLimit,
      shouldChargeCredits,
      monthlyQuotaRemaining: monthlyRemaining,
      monthlyQuotaUsed: monthlyUsed,
      monthlyQuotaLimit: monthlyLimit,
    };
  },

  async checkImageGenerationQuota(userId: string): Promise<QuotaCheckResult> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7);
    const dailyLimit = creditsConfig.freeUser.imageGeneration.freeQuotaPerDay;
    const monthlyLimit = creditsConfig.freeUser.imageGeneration.freeQuotaPerMonth;

    // Check daily usage
    const dailyUsage = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    // Check monthly usage
    const monthlyUsage = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    const dailyUsed = dailyUsage?.imageGenerationCount || 0;
    const monthlyUsed = monthlyUsage?.imageGenerationCount || 0;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    // User must satisfy both daily AND monthly limits
    const shouldChargeCredits = dailyUsed >= dailyLimit || monthlyUsed >= monthlyLimit;

    return {
      canProceed: true,
      quotaRemaining: dailyRemaining,
      quotaUsed: dailyUsed,
      quotaLimit: dailyLimit,
      shouldChargeCredits,
      monthlyQuotaRemaining: monthlyRemaining,
      monthlyQuotaUsed: monthlyUsed,
      monthlyQuotaLimit: monthlyLimit,
    };
  },

  async checkVideoGenerationQuota(userId: string): Promise<QuotaCheckResult> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7);
    const dailyLimit = creditsConfig.freeUser.videoGeneration.freeQuotaPerDay;
    const monthlyLimit = creditsConfig.freeUser.videoGeneration.freeQuotaPerMonth;

    // Check daily usage
    const dailyUsage = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    // Check monthly usage
    const monthlyUsage = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    const dailyUsed = dailyUsage?.videoGenerationCount || 0;
    const monthlyUsed = monthlyUsage?.videoGenerationCount || 0;
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);

    // User must satisfy both daily AND monthly limits
    const shouldChargeCredits = dailyUsed >= dailyLimit || monthlyUsed >= monthlyLimit;

    return {
      canProceed: true,
      quotaRemaining: dailyRemaining,
      quotaUsed: dailyUsed,
      quotaLimit: dailyLimit,
      shouldChargeCredits,
      monthlyQuotaRemaining: monthlyRemaining,
      monthlyQuotaUsed: monthlyUsed,
      monthlyQuotaLimit: monthlyLimit,
    };
  },

  async incrementImageToPromptUsage(userId: string): Promise<void> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7);

    // Update daily tracking
    const existingDaily = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    if (existingDaily) {
      await db
        .update(usageTracking)
        .set({
          imageToTextCount: existingDaily.imageToTextCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.date, today)
        ));
    } else {
      await db.insert(usageTracking).values({
        id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        date: today,
        imageToTextCount: 1,
        imageGenerationCount: 0,
        videoGenerationCount: 0,
        creditsUsedDaily: 0,
        creditsUsedMonthly: 0,
      });
    }

    // Update monthly tracking
    const existingMonthly = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    if (existingMonthly) {
      await db
        .update(monthlyUsageTracking)
        .set({
          imageToTextCount: existingMonthly.imageToTextCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(monthlyUsageTracking.userId, userId),
          eq(monthlyUsageTracking.month, currentMonth)
        ));
    } else {
      await db.insert(monthlyUsageTracking).values({
        id: `monthly_usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        month: currentMonth,
        imageToTextCount: 1,
        imageGenerationCount: 0,
        videoGenerationCount: 0,
      });
    }
  },

  async incrementImageGenerationUsage(userId: string): Promise<void> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7);

    // Update daily tracking
    const existingDaily = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    if (existingDaily) {
      await db
        .update(usageTracking)
        .set({
          imageGenerationCount: existingDaily.imageGenerationCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.date, today)
        ));
    } else {
      await db.insert(usageTracking).values({
        id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        date: today,
        imageToTextCount: 0,
        imageGenerationCount: 1,
        videoGenerationCount: 0,
        creditsUsedDaily: 0,
        creditsUsedMonthly: 0,
      });
    }

    // Update monthly tracking
    const existingMonthly = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    if (existingMonthly) {
      await db
        .update(monthlyUsageTracking)
        .set({
          imageGenerationCount: existingMonthly.imageGenerationCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(monthlyUsageTracking.userId, userId),
          eq(monthlyUsageTracking.month, currentMonth)
        ));
    } else {
      await db.insert(monthlyUsageTracking).values({
        id: `monthly_usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        month: currentMonth,
        imageToTextCount: 0,
        imageGenerationCount: 1,
        videoGenerationCount: 0,
      });
    }
  },

  async incrementVideoGenerationUsage(userId: string): Promise<void> {
    const today: string = new Date().toISOString().split('T')[0];
    const currentMonth: string = new Date().toISOString().substring(0, 7);

    // Update daily tracking
    const existingDaily = await db.query.usageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.date, today)
      ),
    });

    if (existingDaily) {
      await db
        .update(usageTracking)
        .set({
          videoGenerationCount: existingDaily.videoGenerationCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.date, today)
        ));
    } else {
      await db.insert(usageTracking).values({
        id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        date: today,
        imageToTextCount: 0,
        imageGenerationCount: 0,
        videoGenerationCount: 1,
        creditsUsedDaily: 0,
        creditsUsedMonthly: 0,
      });
    }

    // Update monthly tracking
    const existingMonthly = await db.query.monthlyUsageTracking.findFirst({
      where: (table, { eq, and }) => and(
        eq(table.userId, userId),
        eq(table.month, currentMonth)
      ),
    });

    if (existingMonthly) {
      await db
        .update(monthlyUsageTracking)
        .set({
          videoGenerationCount: existingMonthly.videoGenerationCount + 1,
          updatedAt: new Date(),
        })
        .where(and(
          eq(monthlyUsageTracking.userId, userId),
          eq(monthlyUsageTracking.month, currentMonth)
        ));
    } else {
      await db.insert(monthlyUsageTracking).values({
        id: `monthly_usage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        month: currentMonth,
        imageToTextCount: 0,
        imageGenerationCount: 0,
        videoGenerationCount: 1,
      });
    }
  },

  async getOrCreateGuestUserId(ipAddress?: string, userAgent?: string): Promise<string> {
    const identifier = `${ipAddress || 'unknown'}_${userAgent || 'unknown'}`;
    const hash = Buffer.from(identifier).toString('base64').substring(0, 16);
    return `guest_${hash}`;
  },
};
