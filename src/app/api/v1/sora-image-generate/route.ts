import { type NextRequest, NextResponse } from 'next/server';
import { checkForPeopleAndFaces } from '@/lib/google-vision';
import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/credits/credit-service';
import { getModelCost } from '@/config/credits.config';
import { quotaService } from '@/lib/usage/quota-service';

export async function POST(request: NextRequest) {
  console.log('[sora-image-generate] Request received');
  
  try {
    // Authentication check
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      console.log('[sora-image-generate] Unauthorized - no user session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('[sora-image-generate] User authenticated:', userId);

    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;
    const imageUrl = formData.get('imageUrl') as string | null;
    const aspect_ratio = formData.get('aspect_ratio') as string || 'landscape';
    const quality = formData.get('quality') as string || 'standard';

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Quota and credit check
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

    let imageUrls: string[] = [];
    let imageBuffer: Buffer | null = null;

    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      
      // Check for people and faces using Google Cloud Vision API
      try {
        console.log('[sora-image-generate] Checking image for people/faces with Vision API');
        const visionCheck = await checkForPeopleAndFaces(imageBuffer);
        
        if (!visionCheck.success) {
          // Vision API failed - log warning but continue
          // This prevents service unavailability due to Vision API issues
          console.warn('[sora-image-generate] Vision API check failed:', visionCheck.error);
          console.warn('[sora-image-generate] Proceeding without face detection for this request');
        } else if (visionCheck.blocked) {
          // Vision API succeeded and detected people/faces - block the request
          console.log('[sora-image-generate] Vision API blocked image:', visionCheck.reason);
          return NextResponse.json(
            { 
              error: visionCheck.reason || 'Image contains people or faces. Sora 2 does not support images with people or faces.',
              details: visionCheck.details,
            },
            { status: 400 }
          );
        } else {
          console.log('[sora-image-generate] Vision API check passed - no people/faces detected');
        }
      } catch (visionError) {
        // Vision API threw an exception - log error but continue
        // This ensures the service remains available even if Vision API is down
        console.error('[sora-image-generate] Vision API exception:', visionError);
        console.error('[sora-image-generate] Proceeding without face detection');
      }
      
      // Upload image to R2/S3 to get a public URL
      // KIE API doesn't provide file upload - it expects a publicly accessible image URL
      console.log('[sora-image-generate] Uploading image to storage, size:', imageBuffer.length, 'bytes');
      
      // TODO: Implement R2/S3 upload
      // For now, return a helpful error message
      return NextResponse.json(
        { 
          error: 'Image upload to storage not yet implemented. Please use an image URL instead.',
          message: 'Currently, image-to-video only works with image URLs. Upload your image to a hosting service first and use the imageUrl parameter.',
          workaround: 'Use the imageUrl parameter with a publicly accessible image URL'
        },
        { status: 501 }
      );
    } else if (imageUrl) {
      imageUrls = [imageUrl];
    } else {
      return NextResponse.json(
        { error: 'Either image file or image URL is required' },
        { status: 400 }
      );
    }

    console.log('[sora-image-generate] Creating video generation task');
    console.log('[sora-image-generate] Image URLs:', imageUrls);
    console.log('[sora-image-generate] Prompt:', prompt.substring(0, 100));
    
    const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora-2-image-to-video',
        input: {
          prompt,
          image_urls: imageUrls,
          aspect_ratio,
          quality,
        },
      }),
    });

    console.log('[sora-image-generate] KIE API response status:', response.status);

    const responseText = await response.text();
    console.log('[sora-image-generate] Response text length:', responseText.length);
    
    if (!responseText || responseText.trim() === '') {
      console.error('[sora-image-generate] Empty response from KIE API');
      return NextResponse.json(
        { error: 'Empty response from video generation service' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse error response:', responseText);
      }
      console.error('KIE API error:', errorData);
      return NextResponse.json(
        { error: errorData.msg || 'Failed to create image-to-video generation task' },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response. Response text:', responseText);
      console.error('Parse error:', error);
      return NextResponse.json(
        { error: 'Invalid response from video generation service. The service may be experiencing issues.' },
        { status: 500 }
      );
    }

    if (data.code !== 200) {
      return NextResponse.json(
        { error: data.msg || 'Failed to create image-to-video generation task' },
        { status: 400 }
      );
    }

    // Update quota and charge credits after successful task creation
    await quotaService.incrementVideoGenerationUsage(userId);
    
    if (shouldChargeCredits) {
      await creditService.spendCredits({
        userId,
        amount: creditCost,
        source: 'api_call',
        description: 'Image-to-video generation with Sora 2',
        metadata: { 
          feature: 'video-generation', 
          model: 'sora-2-image-to-video', 
          prompt: prompt.substring(0, 100), 
          taskId: data.data.taskId, 
          usedFreeQuota: !shouldChargeCredits 
        },
      });
    }

    return NextResponse.json({
      taskId: data.data.taskId,
      message: 'Image-to-video generation task created successfully',
      creditsUsed: shouldChargeCredits ? creditCost : 0,
      quotaRemaining: quotaCheck.quotaRemaining - 1,
      usedFreeQuota: !shouldChargeCredits,
    });
  } catch (error) {
    console.error('Error creating image-to-video generation task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
