import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import db from '@/server/db';
import { prompts, creditTransactions, userCredits } from '@/server/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';

// Coze API configuration
const COZE_API_URL = 'https://api.coze.cn/v3/chat';
const COZE_BOT_ID = '7550263539588399142';
const COZE_API_KEY = process.env.COZE_API_KEY;

// Credit costs for image-to-prompt
const CREDITS_PER_EXTRACTION = 1;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const modelStyle = formData.get('modelStyle') as string || 'general';
    const imageUrl = formData.get('imageUrl') as string | null;

    // Validate input
    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide either an image file or image URL' },
        { status: 400 }
      );
    }

    // Validate model style
    const validStyles = ['general', 'midjourney', 'stable-diffusion', 'flux', 'sora2', 'veo3'];
    if (!validStyles.includes(modelStyle)) {
      return NextResponse.json(
        { error: 'Invalid model style' },
        { status: 400 }
      );
    }

    // Handle file upload validation
    let imageBase64 = '';
    let uploadedImageKey = '';
    
    if (imageFile) {
      // Check file size (max 4MB)
      if (imageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size must be less than 4MB' },
          { status: 400 }
        );
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Supported: JPEG, PNG, WebP, GIF' },
          { status: 400 }
        );
      }

      // Convert image to base64 for Coze API
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageBase64 = buffer.toString('base64');
      
      // TODO: Upload to S3 and get the key
      // uploadedImageKey = await uploadToS3(buffer, imageFile.type);
    }

    // Check user credits
    const userCreditRecord = await db.query.userCredits.findFirst({
      where: (credits, { eq }) => eq(credits.userId, userId),
    });

    if (!userCreditRecord || userCreditRecord.balance < CREDITS_PER_EXTRACTION) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      );
    }

    // Prepare the prompt for Coze API based on model style
    const stylePrompts = {
      general: 'Analyze this image and provide a detailed description that could be used as a prompt to recreate it. Focus on the subject, style, composition, colors, lighting, and mood.',
      midjourney: 'Analyze this image and create a Midjourney prompt. Include artistic style, detailed subject description, lighting, composition, camera angle, and end with parameters like --ar, --v, etc.',
      'stable-diffusion': 'Analyze this image and create a Stable Diffusion prompt. Include positive prompt with detailed description, art style, quality tags. Also provide a negative prompt with things to avoid.',
      flux: 'Analyze this image and create a Flux AI prompt. Focus on photorealistic details, lighting, textures, and technical camera settings.',
      sora2: 'Analyze this video frame/image and create a Sora2 video generation prompt. Describe the scene, actions, camera movements, transitions, and temporal elements in detail.',
      veo3: 'Analyze this image and create a Veo3 video generation prompt. Include scene description, motion dynamics, camera work, and cinematic style.'
    };

    const analysisPrompt = stylePrompts[modelStyle as keyof typeof stylePrompts];

    // Call Coze API
    const cozePayload = {
      bot_id: COZE_BOT_ID,
      stream: false,
      auto_save_history: false,
      additional_messages: [
        {
          role: 'user',
          content: analysisPrompt,
          content_type: 'text'
        }
      ]
    };

    // Add image to the message
    if (imageBase64) {
      cozePayload.additional_messages.push({
        role: 'user',
        content: imageBase64,
        content_type: 'image'
      } as any);
    } else if (imageUrl && cozePayload.additional_messages[0]) {
      cozePayload.additional_messages[0].content = `${analysisPrompt}\n\nImage URL: ${imageUrl}`;
    }

    const cozeResponse = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cozePayload),
    });

    if (!cozeResponse.ok) {
      console.error('Coze API error:', await cozeResponse.text());
      return NextResponse.json(
        { error: 'Failed to analyze image' },
        { status: 500 }
      );
    }

    const cozeData = await cozeResponse.json();
    
    // Extract the prompt from Coze response
    let extractedPrompt = '';
    let negativePrompt = '';
    
    if (cozeData.data && cozeData.data.messages && cozeData.data.messages.length > 0) {
      const assistantMessage = cozeData.data.messages.find((msg: any) => msg.role === 'assistant');
      if (assistantMessage) {
        extractedPrompt = assistantMessage.content;
        
        // For Stable Diffusion, try to extract negative prompt
        if (modelStyle === 'stable-diffusion' && extractedPrompt.includes('Negative prompt:')) {
          const parts = extractedPrompt.split('Negative prompt:');
          extractedPrompt = parts[0]?.replace('Positive prompt:', '').trim() || '';
          negativePrompt = parts[1]?.trim() || '';
        }
      }
    }

    if (!extractedPrompt) {
      return NextResponse.json(
        { error: 'Failed to extract prompt from image' },
        { status: 500 }
      );
    }

    // Start a database transaction
    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
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
          description: `Image to ${modelStyle} prompt extraction`,
          referenceId: promptId,
          metadata: JSON.stringify({
            feature: 'image-to-prompt',
            modelStyle,
          }),
        });

        // Save the prompt
        await tx.insert(prompts).values({
          id: promptId,
          userId,
          promptText: extractedPrompt,
          negativePrompt: negativePrompt || null,
          modelStyle: modelStyle as 'general' | 'midjourney' | 'stable-diffusion' | 'flux' | 'sora2' | 'veo3',
          s3KeyOriginal: uploadedImageKey || null,
          creditsSpent: CREDITS_PER_EXTRACTION,
          metadata: JSON.stringify({
            cozeConversationId: cozeData.data?.conversation_id,
            imageSource: imageFile ? 'upload' : 'url',
          }),
          tags: [modelStyle, 'extracted'],
        });
      });
    } catch (dbError) {
      console.error('Database transaction error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save prompt' },
        { status: 500 }
      );
    }

    // Return the extracted prompt
    return NextResponse.json({
      success: true,
      data: {
        id: promptId,
        prompt: extractedPrompt,
        negativePrompt: negativePrompt || undefined,
        modelStyle,
        creditsUsed: CREDITS_PER_EXTRACTION,
        remainingCredits: userCreditRecord.balance - CREDITS_PER_EXTRACTION,
      },
    });

  } catch (error) {
    console.error('Image to prompt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's prompts
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const modelStyle = searchParams.get('modelStyle') as string | null;
    const offset = (page - 1) * limit;

    // Build query with conditional filters
    const conditions = [eq(prompts.userId, userId)];
    
    // Filter by model style if provided
    if (modelStyle && ['general', 'midjourney', 'stable-diffusion', 'flux', 'sora2', 'veo3'].includes(modelStyle)) {
      conditions.push(eq(prompts.modelStyle, modelStyle));
    }

    // Add ordering and pagination
    const userPrompts = await db
      .select()
      .from(prompts)
      .where(and(...conditions))
      .orderBy(desc(prompts.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: count() })
      .from(prompts)
      .where(eq(prompts.userId, userId));

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        prompts: userPrompts.map(prompt => ({
          id: prompt.id,
          promptText: prompt.promptText,
          negativePrompt: prompt.negativePrompt,
          modelStyle: prompt.modelStyle,
          tags: prompt.tags,
          createdAt: prompt.createdAt,
          creditsSpent: prompt.creditsSpent,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

