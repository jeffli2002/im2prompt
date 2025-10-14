import { NextRequest, NextResponse } from 'next/server';
import { generateCustomerPortalLink } from '@/server/actions/payment/generate-customer-portal';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const validation = portalSchema.safeParse(body);
    
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

    const { returnUrl } = validation.data;

    const result = await generateCustomerPortalLink(returnUrl);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Generate customer portal error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate customer portal link',
      },
      { status: 500 }
    );
  }
}
