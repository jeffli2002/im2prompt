import { paymentConfig } from '@/config/payment.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getPlanPriceByPriceId } from '@/lib/admin/revenue-utils';
import { db } from '@/server/db';
import {
  creditTransactions,
  generatedAsset,
  payment,
  subscription,
  user,
} from '@/server/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const _parsePurchaseMetadata = (metadata: string | null) => {
  if (!metadata) {
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0 };
  }
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    const productId = typeof parsed.productId === 'string' ? parsed.productId : undefined;
    const creditsValue =
      typeof parsed.credits === 'number' ? parsed.credits : Number(parsed.credits) || undefined;
    const pack =
      paymentConfig.creditPacks.find((pack) => pack.creemProductKey === productId) ||
      (typeof creditsValue === 'number'
        ? paymentConfig.creditPacks.find((pack) => pack.credits === creditsValue)
        : undefined);
    const rawAmount = Number(parsed.amount);
    const amount = Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : (pack?.price ?? 0);
    return {
      amount,
      currency: typeof parsed.currency === 'string' ? parsed.currency : 'USD',
      provider: typeof parsed.provider === 'string' ? parsed.provider : 'unknown',
      credits: creditsValue ?? pack?.credits ?? 0,
    };
  } catch (error) {
    console.error('Failed to parse purchase metadata:', error);
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0 };
  }
};

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    let startDate: Date;
    let endDate: Date;

    if (range === 'custom') {
      const startParam = searchParams.get('start');
      const endParam = searchParams.get('end');
      if (!startParam || !endParam) {
        return NextResponse.json(
          { error: 'Custom range requires start and end dates' },
          { status: 400 }
        );
      }
      startDate = new Date(startParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    // Wrap all database queries in try-catch to handle missing tables gracefully
    let registrations = [{ count: 0 }];
    try {
      registrations = await db
        .select({ count: sql<number>`count(*)` })
        .from(user)
        .where(and(gte(user.createdAt, startDate), sql`${user.createdAt} <= ${endDate}`));
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }

    let subscriptionUsersResult = [{ count: 0 }];
    try {
      subscriptionUsersResult = await db
        .select({ count: sql<number>`count(DISTINCT ${payment.userId})` })
        .from(payment)
        .where(and(gte(payment.createdAt, startDate), sql`${payment.createdAt} <= ${endDate}`));
    } catch (error) {
      console.error('Error fetching subscription users:', error);
    }

    // Credit pack purchases removed
    const packPurchaseUsersResult = [{ count: 0 }];

    let subscriptionPayments: Array<{ priceId: string; createdAt: Date | null }> = [];
    try {
      subscriptionPayments = await db
        .select({
          priceId: payment.priceId,
          createdAt: payment.createdAt,
        })
        .from(payment)
        .where(and(gte(payment.createdAt, startDate), sql`${payment.createdAt} <= ${endDate}`));
    } catch (error) {
      console.error('Error fetching subscription payments:', error);
    }

    const subscriptionRevenue = subscriptionPayments.reduce(
      (sum, row) => sum + getPlanPriceByPriceId(row.priceId),
      0
    );

    // Credit pack purchases removed
    const packRevenue = 0;

    const totalRevenue = subscriptionRevenue; // Only subscription revenue, pack revenue removed

    // Credits from generated assets - handle case where table might not exist
    let imageCredits = 0;
    let videoCredits = 0;
    try {
      const imageCreditsResult = await db
        .select({ total: sql<number>`COALESCE(SUM(credits_spent), 0)` })
        .from(generatedAsset)
        .where(
          and(
            eq(generatedAsset.assetType, 'image'),
            eq(generatedAsset.status, 'completed'),
            gte(generatedAsset.createdAt, startDate),
            sql`${generatedAsset.createdAt} <= ${endDate}`
          )
        );

      const videoCreditsResult = await db
        .select({ total: sql<number>`COALESCE(SUM(credits_spent), 0)` })
        .from(generatedAsset)
        .where(
          and(
            eq(generatedAsset.assetType, 'video'),
            eq(generatedAsset.status, 'completed'),
            gte(generatedAsset.createdAt, startDate),
            sql`${generatedAsset.createdAt} <= ${endDate}`
          )
        );

      imageCredits = Number(imageCreditsResult[0]?.total) || 0;
      videoCredits = Number(videoCreditsResult[0]?.total) || 0;
    } catch (error) {
      console.error('Error fetching credits (generatedAsset table may not exist):', error);
      // Use default values if table doesn't exist
      imageCredits = 0;
      videoCredits = 0;
    }
    
    const totalCredits = imageCredits + videoCredits;

    // Registration trend
    let registrationTrend;
    try {
      registrationTrend = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::int as count
        FROM ${user}
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
    } catch (error) {
      console.error('Error fetching registration trend:', error);
      registrationTrend = { rows: [] };
    }

    // Credits trend - handle case where table might not exist
    let creditsTrend;
    try {
      creditsTrend = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(CASE WHEN asset_type = 'image' AND status = 'completed' THEN credits_spent ELSE 0 END), 0)::int as "imageCredits",
          COALESCE(SUM(CASE WHEN asset_type = 'video' AND status = 'completed' THEN credits_spent ELSE 0 END), 0)::int as "videoCredits"
        FROM ${generatedAsset}
        WHERE created_at >= ${startDate} AND created_at <= ${endDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);
    } catch (error) {
      console.error('Error fetching credits trend (table may not exist):', error);
      // Return empty trend if table doesn't exist
      creditsTrend = { rows: [] };
    }

    const response = NextResponse.json({
      kpis: {
        registrations: Number(registrations[0]?.count) || 0,
        subscriptionUsers: Number(subscriptionUsersResult[0]?.count) || 0,
        packPurchaseUsers: Number(packPurchaseUsersResult[0]?.count) || 0,
        totalRevenue,
        subscriptionRevenue,
        packRevenue,
        totalCredits,
        imageCredits,
        videoCredits,
      },
      revenueSummary: {
        subscriptionRevenueInRange: subscriptionRevenue,
        packRevenueInRange: 0, // Removed
        totalRevenueInRange: totalRevenue,
      },
      trends: {
        registrations: registrationTrend.rows,
        credits: creditsTrend.rows,
      },
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin stats error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check for database errors
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('Database table missing. Please run migrations.');
        return NextResponse.json(
          { 
            error: 'Database table missing. Please run migrations.',
            details: error.message 
          }, 
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
