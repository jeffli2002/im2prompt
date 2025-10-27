import { creditsConfig } from '@/config/credits.config';
import { auth } from '@/lib/auth/auth';
import db from '@/server/db';
import { usageTracking } from '@/server/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { type, credits } = await request.json();

    if (!['imageToText', 'imageGeneration', 'videoGeneration'].includes(type)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0] as string;

    // Get credit cost based on type
    let creditCost = 0;
    if (type === 'imageGeneration') {
      creditCost = credits || creditsConfig.consumption.imageGeneration['nano-banana'];
    } else if (type === 'videoGeneration') {
      creditCost = credits || creditsConfig.consumption.videoGeneration['sora-2'];
    }

    const [existing] = await db
      .select()
      .from(usageTracking)
      .where(and(eq(usageTracking.userId, userId), eq(usageTracking.date, today)))
      .limit(1);

    if (existing) {
      const updates: any = {
        updatedAt: new Date(),
      };

      if (type === 'imageToText') {
        updates.imageToTextCount = sql`${usageTracking.imageToTextCount} + 1`;
      } else {
        // For image/video generation, update credits
        updates.creditsUsedDaily = sql`${usageTracking.creditsUsedDaily} + ${creditCost}`;
        updates.creditsUsedMonthly = sql`${usageTracking.creditsUsedMonthly} + ${creditCost}`;
      }

      await db.update(usageTracking).set(updates).where(eq(usageTracking.id, existing.id));
    } else {
      const insertData: any = {
        id: uuidv4(),
        userId,
        date: today,
        imageToTextCount: type === 'imageToText' ? 1 : 0,
        creditsUsedDaily: type !== 'imageToText' ? creditCost : 0,
        creditsUsedMonthly: type !== 'imageToText' ? creditCost : 0,
      };

      await db.insert(usageTracking).values(insertData);
    }

    return NextResponse.json({ success: true, creditsUsed: creditCost });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
