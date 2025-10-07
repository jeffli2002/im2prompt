import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/credits/credit-service';
import { getModelCost } from '@/config/credits.config';
import { quotaService } from '@/lib/usage/quota-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const { mode, prompt, image_url, aspect_ratio = 'landscape', quality = 'standard' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (mode === 'image-to-video' && !image_url) {
      return NextResponse.json(
        { error: 'Image URL is required for image-to-video mode' },
        { status: 400 }
      );
    }
    
    const creditCost = getModelCost('videoGeneration', 'sora-2');
    
    const quotaCheck = await quotaService.checkVideoGenerationQuota(userId);
    let shouldChargeCredits = quotaCheck.shouldChargeCredits;
    
    if (shouldChargeCredits) {
      const hasCredits = await creditService.hasEnoughCredits(userId, creditCost);
      if (!hasCredits) {
        const limitType = quotaCheck.quotaRemaining === 0 ? 'daily' : 'monthly';
        return NextResponse.json(
          { error: `Insufficient credits. You have used your ${limitType} free quota (1/day, 3/month).` },
          { status: 402 }
        );
      }
    } else if (quotaCheck.quotaRemaining === 0 && quotaCheck.monthlyQuotaRemaining === 0) {
      return NextResponse.json(
        { error: 'Daily and monthly quota exceeded. Please use credits.' },
        { status: 429 }
      );
    } else if (quotaCheck.quotaRemaining === 0) {
      return NextResponse.json(
        { error: 'Daily quota exceeded (1/day). Try again tomorrow or use credits.' },
        { status: 429 }
      );
    } else if (quotaCheck.monthlyQuotaRemaining === 0) {
      return NextResponse.json(
        { error: 'Monthly quota exceeded (3/month). Please use credits.' },
        { status: 429 }
      );
    }

    const kieApiKey = process.env.KIE_API_KEY;
    if (!kieApiKey) {
      return NextResponse.json(
        { error: 'KIE API key not configured' },
        { status: 500 }
      );
    }

    if (mode === 'image-to-video') {
      const imageResponse = await fetch(image_url);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      
      try {
        const { checkForPeopleAndFaces } = await import('@/lib/google-vision');
        const visionCheck = await checkForPeopleAndFaces(imageBuffer);
        
        if (!visionCheck.success) {
          console.warn('Vision API check failed, proceeding without face detection:', visionCheck.error);
        } else if (visionCheck.blocked) {
          return NextResponse.json(
            { 
              error: visionCheck.reason || 'Image contains people or faces. Please use an image without people (landscapes, objects, scenes, etc.)',
              details: visionCheck.details,
            },
            { status: 400 }
          );
        }
      } catch (visionError) {
        console.warn('Vision API error, proceeding without face detection:', visionError);
      }
    }

    const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: mode === 'image-to-video' ? 'sora-2-image-to-video' : 'sora-2-text-to-video',
        input: mode === 'image-to-video' 
          ? {
              prompt,
              image_urls: [image_url],
              aspect_ratio,
              quality,
            }
          : {
              prompt,
              aspect_ratio,
              quality,
            },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('KIE API error:', errorData);
      return NextResponse.json(
        { error: errorData.msg || 'Failed to create video generation task' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.code !== 200) {
      return NextResponse.json(
        { error: data.msg || 'Failed to create video generation task' },
        { status: 400 }
      );
    }
    
    await quotaService.incrementVideoGenerationUsage(userId);
    
    if (shouldChargeCredits) {
      await creditService.spendCredits({
        userId,
        amount: creditCost,
        source: 'api_call',
        description: 'Video generation with Sora 2',
        metadata: { feature: 'video-generation', model: 'sora-2', prompt: prompt.substring(0, 100), taskId: data.data.taskId, usedFreeQuota: !shouldChargeCredits },
      });
    }

    return NextResponse.json({
      taskId: data.data.taskId,
      message: 'Video generation task created successfully',
      creditsUsed: shouldChargeCredits ? creditCost : 0,
      quotaRemaining: quotaCheck.quotaRemaining - 1,
      usedFreeQuota: !shouldChargeCredits,
    });
  } catch (error) {
    console.error('Error creating video generation task:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the video generation task. Please try again.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
