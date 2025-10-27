import { downgradeSubscription } from '@/server/actions/payment/downgrade-subscription';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const downgradeSchema = z.object({
  newPlanId: z.enum(['pro', 'free']),
  newInterval: z.enum(['month', 'year']),
  scheduleAtPeriodEnd: z.boolean().optional().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    const { subscriptionId } = await params;
    const body = await request.json();

    const validation = downgradeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { newPlanId, newInterval, scheduleAtPeriodEnd } = validation.data;

    const result = await downgradeSubscription(
      subscriptionId,
      newPlanId,
      newInterval,
      scheduleAtPeriodEnd
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Downgrade subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to downgrade subscription',
      },
      { status: 500 }
    );
  }
}
