import { auth } from '@/lib/auth/auth';
import db from '@/server/db';
import { creditTransactions, prompts, userCredits } from '@/server/db/schema';
import { and, count, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// Credit costs for image-to-prompt
const CREDITS_PER_EXTRACTION = 1;

export async function POST(req: NextRequest) {
  try {
    // Try to get session, but don't require it for first 3 attempts
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    let userId = session?.user?.id;
    const isAuthenticated = !!userId;
    let isFreeTrial = false;

    // If no session, use a temporary user ID for free trial
    if (!userId) {
      userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      isFreeTrial = true;
    }

    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const rawModelStyle = (formData.get('modelStyle') as string | null) || 'general';
    const imageUrl = formData.get('imageUrl') as string | null;
    const language = (formData.get('language') as string) || 'english';

    // Validate input
    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide either an image file or image URL' },
        { status: 400 }
      );
    }

    // Validate model style
    const validStyles = ['general', 'midjourney', 'nanoBanana', 'flux', 'sora2', 'veo3'] as const;
    type ModelStyle = (typeof validStyles)[number];
    const styleAliasMap: Record<string, ModelStyle> = {
      'stable-diffusion': 'nanoBanana',
    };
    const maybeAlias = styleAliasMap[rawModelStyle] || rawModelStyle;
    if (!validStyles.includes(maybeAlias as ModelStyle)) {
      return NextResponse.json({ error: 'Invalid model style' }, { status: 400 });
    }
    const modelStyle = maybeAlias as ModelStyle;

    // Check user credits (skip for free trial users)
    let userCreditRecord = null;
    let remainingCredits = 0;

    if (isAuthenticated) {
      userCreditRecord = await db.query.userCredits.findFirst({
        where: (credits, { eq }) => eq(credits.userId, userId),
      });

      if (!userCreditRecord || userCreditRecord.balance < CREDITS_PER_EXTRACTION) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
      }
      remainingCredits = userCreditRecord.balance - CREDITS_PER_EXTRACTION;
    } else {
      // For free trial, start with 3 free attempts
      remainingCredits = 3;
    }

    // Generate mock prompt based on model style
    const mockPrompts: Record<ModelStyle, string> = {
      general:
        'A beautiful landscape with mountains in the background, a serene lake in the foreground, golden hour lighting, photorealistic style, high quality, detailed',
      midjourney:
        'A stunning mountain landscape at sunset, crystal clear lake reflection, dramatic clouds, golden hour lighting, photorealistic, highly detailed, 8k resolution --ar 16:9 --v 6',
      nanoBanana:
        'A majestic mountain landscape during golden hour, pristine lake with perfect reflections, dramatic sky with clouds, photorealistic, highly detailed, 8k, masterpiece, best quality',
      flux: 'A breathtaking mountain landscape at sunset, crystal clear alpine lake, dramatic cloud formations, golden hour lighting, photorealistic, ultra detailed, 8k resolution, professional photography',
      sora2:
        'A cinematic shot of a serene mountain landscape at sunset, camera slowly panning across a crystal clear lake reflecting the golden sky, dramatic clouds moving overhead, golden hour lighting, photorealistic, 4k video quality',
      veo3: 'A peaceful mountain landscape at golden hour, camera gently moving across a pristine lake with perfect reflections, dramatic clouds drifting in the sky, warm lighting, cinematic quality, photorealistic',
    };

    const extractedPrompt = mockPrompts[modelStyle] || mockPrompts.general;
    const negativePrompt =
      modelStyle === 'nanoBanana'
        ? 'blurry, low quality, distorted, ugly, bad anatomy, bad proportions, deformed, low resolution'
        : undefined;

    // Start a database transaction (only for authenticated users)
    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (isAuthenticated && userCreditRecord) {
      try {
        await db.transaction(async (tx) => {
          // Deduct credits
          await tx
            .update(userCredits)
            .set({
              balance: userCreditRecord.balance - CREDITS_PER_EXTRACTION,
              totalSpent: userCreditRecord.totalSpent + CREDITS_PER_EXTRACTION,
              updatedAt: new Date(),
            })
            .where(eq(userCredits.userId, userId));

          // Record credit transaction
          await tx.insert(creditTransactions).values({
            id: transactionId,
            userId,
            type: 'spend',
            amount: CREDITS_PER_EXTRACTION,
            balanceAfter: userCreditRecord.balance - CREDITS_PER_EXTRACTION,
            source: 'api_call',
            description: `Image to ${modelStyle} prompt extraction (mock)`,
            referenceId: promptId,
            metadata: JSON.stringify({
              feature: 'image-to-prompt',
              modelStyle,
              mock: true,
            }),
          });

          // Save the prompt
          await tx.insert(prompts).values({
            id: promptId,
            userId,
            promptText: extractedPrompt,
            negativePrompt: negativePrompt || null,
            modelStyle,
            s3KeyOriginal: null,
            creditsSpent: CREDITS_PER_EXTRACTION,
            metadata: JSON.stringify({
              mock: true,
              imageSource: imageFile ? 'upload' : 'url',
            }),
            tags: [modelStyle, 'extracted', 'mock'],
          });
        });
      } catch (dbError) {
        console.error('Database transaction error:', dbError);
        return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
      }
    }

    // Return the extracted prompt
    return NextResponse.json({
      success: true,
      data: {
        id: promptId,
        prompt: extractedPrompt,
        negativePrompt: negativePrompt || undefined,
        modelStyle,
        creditsUsed: isAuthenticated ? CREDITS_PER_EXTRACTION : 0,
        remainingCredits: remainingCredits,
        isFreeTrial: isFreeTrial,
        isAuthenticated: isAuthenticated,
        mock: true,
        message: isFreeTrial
          ? 'This is a free trial. Sign up to save your prompts and get more credits!'
          : undefined,
      },
    });
  } catch (error) {
    console.error('Image to prompt mock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
