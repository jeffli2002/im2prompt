import { getModelCost } from '@/config/credits.config';
import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/credits/credit-service';
import { quotaService } from '@/lib/usage/quota-service';
import db from '@/server/db';
import { creditTransactions, prompts, userCredits } from '@/server/db/schema';
import { and, count, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

const COZE_WORKFLOW_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_FILE_UPLOAD_URL = 'https://api.coze.cn/v1/files/upload';
const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || '7550263539588399142';
const COZE_API_KEY = process.env.COZE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check if Coze API key is configured
    if (!COZE_API_KEY) {
      console.error('COZE_API_KEY is not configured');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    let userId = session?.user?.id;
    const isAuthenticated = !!userId;
    let isFreeTrial = false;

    if (!userId) {
      const ipAddress =
        req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      userId = await quotaService.getOrCreateGuestUserId(ipAddress, userAgent);
      isFreeTrial = true;
    }

    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const modelStyle = (formData.get('modelStyle') as string) || 'general';
    const imageUrl = formData.get('imageUrl') as string | null;
    const language = (formData.get('language') as string) || 'english';

    // Validate input
    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide either an image file or image URL' },
        { status: 400 }
      );
    }

    const validStyles = ['general', 'midjourney', 'nanoBanana', 'flux', 'sora2', 'veo3'];
    if (!validStyles.includes(modelStyle)) {
      return NextResponse.json({ error: 'Invalid model style' }, { status: 400 });
    }

    const creditsPerExtraction = getModelCost('imageToPrompt', modelStyle);

    // Map frontend model style to Coze API promptStyle format
    const modelStyleToPromptStyle: Record<string, string> = {
      general: 'normal',
      midjourney: 'midjourney',
      nanoBanana: 'nanoBanana',
      flux: 'flux',
      sora2: 'sora2',
      veo3: 'veo3',
    };
    const promptStyle = modelStyleToPromptStyle[modelStyle] || 'normal';

    // Handle file upload validation
    let cozeFileId = '';
    let cozeFileData: any = null;
    const uploadedImageKey = '';

    if (imageFile) {
      // Check file size (max 4MB)
      if (imageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image size must be less than 4MB' }, { status: 400 });
      }

      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: 'Invalid image type. Supported: JPEG, PNG, WebP, GIF' },
          { status: 400 }
        );
      }

      // Upload image to Coze to get file_id
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);

      const uploadResponse = await fetch(COZE_FILE_UPLOAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${COZE_API_KEY}`,
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Coze file upload error:', errorText);
        return NextResponse.json({ error: 'Failed to upload image to Coze' }, { status: 500 });
      }

      const uploadData = await uploadResponse.json();
      cozeFileData = uploadData.data || uploadData;
      cozeFileId = cozeFileData.id || cozeFileData.file_id;

      if (!cozeFileId) {
        console.error('No file_id in Coze upload response:', uploadData);
        return NextResponse.json({ error: 'Failed to get file ID from Coze' }, { status: 500 });
      }

      console.log('Coze file upload success:', cozeFileData);

      // TODO: Upload to S3 and get the key
      // uploadedImageKey = await uploadToS3(buffer, imageFile.type);
    }

    const quotaCheck = await quotaService.checkImageToPromptQuota(userId);
    const shouldChargeCredits = quotaCheck.shouldChargeCredits;
    let userCreditRecord = null;
    let remainingCredits = 0;

    if (isAuthenticated) {
      if (shouldChargeCredits) {
        userCreditRecord = await db.query.userCredits.findFirst({
          where: (credits, { eq }) => eq(credits.userId, userId),
        });

        if (!userCreditRecord || userCreditRecord.balance < creditsPerExtraction) {
          const limitType = quotaCheck.quotaRemaining === 0 ? 'daily' : 'monthly';
          return NextResponse.json(
            {
              error: `Insufficient credits. You have used your ${limitType} free quota (3/day, 10/month).`,
            },
            { status: 402 }
          );
        }
        remainingCredits = userCreditRecord.balance - creditsPerExtraction;
      } else {
        userCreditRecord = await db.query.userCredits.findFirst({
          where: (credits, { eq }) => eq(credits.userId, userId),
        });
        remainingCredits = userCreditRecord?.balance || 0;
      }
    } else {
      if (quotaCheck.quotaRemaining === 0 && quotaCheck.monthlyQuotaRemaining === 0) {
        return NextResponse.json(
          { error: 'Daily and monthly quota exceeded. Please sign in to continue.' },
          { status: 429 }
        );
      }
      if (quotaCheck.quotaRemaining === 0) {
        return NextResponse.json(
          { error: 'Daily quota exceeded (3/day). Please try again tomorrow or sign in.' },
          { status: 429 }
        );
      }
      if (quotaCheck.monthlyQuotaRemaining === 0) {
        return NextResponse.json(
          { error: 'Monthly quota exceeded (10/month). Please sign in to continue.' },
          { status: 429 }
        );
      }
    }

    // Prepare the prompt for Coze API based on model style
    const stylePrompts = {
      general:
        'Analyze this image and provide a detailed description that could be used as a prompt to recreate it. Focus on the subject, style, composition, colors, lighting, and mood.',
      midjourney:
        'Analyze this image and create a Midjourney prompt. Include artistic style, detailed subject description, lighting, composition, camera angle, and end with parameters like --ar, --v, etc.',
      nanoBanana:
        'Analyze this image and create a Nano Banana prompt. Include positive prompt with detailed description, art style, quality tags. Also provide a negative prompt with things to avoid.',
      flux: 'Analyze this image and create a Flux AI prompt. Focus on photorealistic details, lighting, textures, and technical camera settings.',
      sora2:
        'Analyze this video frame/image and create a Sora2 video generation prompt. Describe the scene, actions, camera movements, transitions, and temporal elements in detail.',
      veo3: 'Analyze this image and create a Veo3 video generation prompt. Include scene description, motion dynamics, camera work, and cinematic style.',
    };

    const analysisPrompt = stylePrompts[modelStyle as keyof typeof stylePrompts];

    // Prepare workflow parameters
    const workflowParams: any = {
      promptStyle: promptStyle,
      language: language,
    };

    // Add image to parameters
    // Coze Image type expects JSON string with file metadata including file_id
    if (cozeFileData) {
      // Ensure file_id field exists (some responses only have 'id')
      const imgData = {
        ...cozeFileData,
        file_id: cozeFileData.file_id || cozeFileData.id,
      };
      // Pass complete file object as JSON string for Image type variable
      workflowParams.Img = JSON.stringify(imgData);
    } else if (imageUrl) {
      // For URL, pass directly as string
      workflowParams.Img = imageUrl;
    }

    // Call Coze Workflow API
    const cozePayload = {
      workflow_id: COZE_WORKFLOW_ID,
      parameters: workflowParams,
      bot_id: COZE_WORKFLOW_ID,
    };

    console.log('Calling Coze Workflow API with payload:', JSON.stringify(cozePayload, null, 2));

    const cozeResponse = await fetch(COZE_WORKFLOW_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(cozePayload),
    });

    const cozeData = await cozeResponse.json();
    console.log('Coze Workflow API response:', JSON.stringify(cozeData, null, 2));

    // Check Coze API response status code
    // code: 0 means success, other codes indicate errors
    if (!cozeResponse.ok || (cozeData.code && cozeData.code !== 0)) {
      const errorMsg = cozeData.msg || cozeData.message || cozeResponse.statusText;
      console.error('Coze API error:', {
        httpStatus: cozeResponse.status,
        cozeCode: cozeData.code,
        message: errorMsg,
        debugUrl: cozeData.debug_url,
      });
      console.log('❌ Coze API 调用失败，自动切换到 Google Vision API fallback');

      // Don't return error, instead fall through to Google Vision fallback
      // by setting extractedPrompt to empty string
    }

    // Extract the prompt from Coze Workflow response
    let extractedPrompt = '';
    let negativePrompt = '';

    // Workflow API returns data in different format
    // Only process if Coze API was successful (code === 0 or undefined)
    if (cozeData.data && (!cozeData.code || cozeData.code === 0)) {
      // Check if output contains the prompt
      const output = cozeData.data.output || cozeData.data;

      if (typeof output === 'string') {
        extractedPrompt = output;
      } else if (output.prompt) {
        extractedPrompt = output.prompt;
      } else if (output.result) {
        extractedPrompt = output.result;
      }

      console.log('Raw workflow output:', extractedPrompt);

      // Remove Chinese characters and sections if language is English
      if (language === 'english' && /[\u4e00-\u9fa5]/.test(extractedPrompt)) {
        // Split by major sections and keep only English parts
        const lines = extractedPrompt.split('\n');
        const englishLines = lines.filter((line) => {
          // Keep lines that are mostly English (less than 30% Chinese characters)
          const chineseChars = (line.match(/[\u4e00-\u9fa5]/g) || []).length;
          const totalChars = line.length;
          return totalChars === 0 || chineseChars / totalChars < 0.3;
        });
        extractedPrompt = englishLines.join('\n');
        console.log('Filtered to English only:', extractedPrompt);
      }

      // Extract first prompt option if multiple options are provided
      if (
        extractedPrompt.includes('### ') ||
        extractedPrompt.includes('**Prompt:**') ||
        extractedPrompt.includes('Sora 2 Prompt:')
      ) {
        // Try to match "一键复制版本" (concise version) first - this is usually the cleanest
        let promptMatch = extractedPrompt.match(
          /\*\*一键复制版本\*\*[：:]\s*\n([\s\S]*?)(?=\n\n|$)/
        );

        if (!promptMatch || !promptMatch[1]) {
          // Try to match prompt in code block (```...```)
          promptMatch = extractedPrompt.match(/```\s*\n?([\s\S]*?)```/);
        }

        if (!promptMatch || !promptMatch[1]) {
          // Try to match first "**Prompt:**" after "### Option 1" and before "### Option 2"
          promptMatch = extractedPrompt.match(
            /###\s*Option\s*1[\s\S]*?\*\*Prompt:\*\*\s*\n([\s\S]*?)(?=\n\n###\s*Option\s*2|\n\n###|\n\n---|\n\n\*\*Why|$)/
          );
        }

        if (!promptMatch || !promptMatch[1]) {
          // Try to extract all English subsections and combine them (Scene Description, Key Elements, Visual Style)
          const sectionPattern =
            /\*\*(?:Scene Description|Key Elements & Action|Visual Style & Lighting|Main Context & Action|Main Scene & Subject|Style & Medium|Style & Movement|Quality & Details|Camera & Movement|Lighting & Atmosphere|Color Palette|Additional Elements):\*\*\s*\n([\s\S]*?)(?=\n\n\*\*|\n\n---|\n\n###|$)/g;
          const sections = [];
          let match;
          while ((match = sectionPattern.exec(extractedPrompt)) !== null) {
            if (match[1]) {
              sections.push(match[1].trim());
            }
          }
          if (sections.length > 0) {
            // Combine all sections into one prompt, removing extra line breaks
            extractedPrompt = sections.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            // Remove any remaining parameters like --ar, --style at the end
            extractedPrompt = extractedPrompt.replace(/--\w+\s+[\w\/]+\s*/g, '').trim();
            console.log('Combined subsections into prompt:', extractedPrompt);
          }
        }

        if (promptMatch?.[1]) {
          extractedPrompt = promptMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
          // Remove any parameters like --ar, --style
          extractedPrompt = extractedPrompt.replace(/--\w+\s+[\w\/]+\s*/g, '').trim();
          console.log('Extracted clean prompt:', extractedPrompt);
        }
      }

      // For Nano Banana, try to extract negative prompt
      if (modelStyle === 'nanoBanana' && extractedPrompt.includes('Negative prompt:')) {
        const parts = extractedPrompt.split('Negative prompt:');
        extractedPrompt = parts[0]?.replace('Positive prompt:', '').trim() || '';
        negativePrompt = parts[1]?.trim() || '';
      }
    }

    if (!extractedPrompt) {
      console.error('No prompt extracted from Coze response:', cozeData);
      console.log('Falling back to Google Vision API');

      try {
        const { generatePromptFromImage } = await import('@/lib/google-vision');

        let imageBuffer: Buffer;
        if (imageFile) {
          const arrayBuffer = await imageFile.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else if (imageUrl) {
          const imageResponse = await fetch(imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error('No image available for Vision API fallback');
        }

        const languageMap: Record<string, 'en' | 'zh' | 'fr' | 'ja' | 'es'> = {
          english: 'en',
          chinese: 'zh',
          french: 'fr',
          japanese: 'ja',
          spanish: 'es',
        };

        const visionLang = languageMap[language.toLowerCase()] || 'en';
        const visionResult = await generatePromptFromImage(imageBuffer, visionLang, modelStyle);

        if (visionResult.success && visionResult.prompt) {
          extractedPrompt = visionResult.prompt;
          console.log('Generated prompt from Google Vision API:', extractedPrompt);
        } else {
          throw new Error('Vision API failed to generate prompt');
        }
      } catch (visionError) {
        console.error('Google Vision API fallback failed:', visionError);

        const mockPrompts = {
          general:
            language === 'chinese'
              ? '一个美丽的风景，背景是山脉，前景是宁静的湖泊，黄金时段光线，照片写实风格，高质量，细节丰富'
              : 'A beautiful landscape with mountains in the background, a serene lake in the foreground, golden hour lighting, photorealistic style, high quality, detailed',
          midjourney:
            language === 'chinese'
              ? '日落时分壮观的山地景观，清澈的湖面倒影，戏剧性云层，黄金时段光线，照片写实，高度细节，8k分辨率'
              : 'A stunning mountain landscape at sunset, crystal clear lake reflection, dramatic clouds, golden hour lighting, photorealistic, highly detailed, 8k resolution',
          nanoBanana:
            language === 'chinese'
              ? '黄金时段雄伟的山地景观，原始湖泊完美倒影，戏剧性天空云层，照片写实，高度细节，8k，杰作，最佳质量'
              : 'A majestic mountain landscape during golden hour, pristine lake with perfect reflections, dramatic sky with clouds, photorealistic, highly detailed, 8k, masterpiece, best quality',
          flux:
            language === 'chinese'
              ? '日落时分令人惊叹的山地景观，清澈的高山湖泊，戏剧性云层，黄金时段光线，照片写实，超高细节，8k分辨率，专业摄影'
              : 'A breathtaking mountain landscape at sunset, crystal clear alpine lake, dramatic cloud formations, golden hour lighting, photorealistic, ultra detailed, 8k resolution, professional photography',
          sora2:
            language === 'chinese'
              ? '日落时分宁静山地景观的电影镜头，相机缓慢平移穿过清澈的湖泊倒映金色天空，戏剧性云层移动，黄金时段光线，照片写实，4k视频质量'
              : 'A cinematic shot of a serene mountain landscape at sunset, camera slowly panning across a crystal clear lake reflecting the golden sky, dramatic clouds moving overhead, golden hour lighting, photorealistic, 4k video quality',
          veo3:
            language === 'chinese'
              ? '黄金时段平静的山地景观，相机轻柔移动穿过原始湖泊完美倒影，戏剧性云层飘动，温暖光线，电影质量，照片写实'
              : 'A peaceful mountain landscape at golden hour, camera gently moving across a pristine lake with perfect reflections, dramatic clouds drifting in the sky, warm lighting, cinematic quality, photorealistic',
        };

        extractedPrompt =
          mockPrompts[modelStyle as keyof typeof mockPrompts] || mockPrompts.general;
        negativePrompt =
          modelStyle === 'nanoBanana'
            ? language === 'chinese'
              ? '模糊，低质量，扭曲，丑陋，解剖错误，比例失调，变形，低分辨率'
              : 'blurry, low quality, distorted, ugly, bad anatomy, bad proportions, deformed, low resolution'
            : '';

        console.log('Using final fallback mock prompt:', extractedPrompt);
      }
    }

    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const isFallbackResponse = extractedPrompt.includes('mountain landscape');

    await quotaService.incrementImageToPromptUsage(userId);

    if (isAuthenticated) {
      let savedToDb = false;
      try {
        await db.transaction(async (tx) => {
          if (shouldChargeCredits && userCreditRecord) {
            await tx
              .update(userCredits)
              .set({
                balance: userCreditRecord.balance - creditsPerExtraction,
                totalSpent: userCreditRecord.totalSpent + creditsPerExtraction,
                updatedAt: new Date(),
              })
              .where(eq(userCredits.userId, userId));

            await tx.insert(creditTransactions).values({
              id: transactionId,
              userId,
              type: 'spend',
              amount: creditsPerExtraction,
              balanceAfter: userCreditRecord.balance - creditsPerExtraction,
              source: 'api_call',
              description: `Image to ${modelStyle} prompt extraction`,
              referenceId: promptId,
              metadata: JSON.stringify({
                feature: 'image-to-prompt',
                modelStyle,
              }),
            });
          }

          await tx.insert(prompts).values({
            id: promptId,
            userId,
            promptText: extractedPrompt,
            negativePrompt: negativePrompt || null,
            modelStyle: modelStyle as
              | 'general'
              | 'midjourney'
              | 'nanoBanana'
              | 'flux'
              | 'sora2'
              | 'veo3',
            s3KeyOriginal: uploadedImageKey || null,
            creditsSpent: shouldChargeCredits ? creditsPerExtraction : 0,
            metadata: JSON.stringify({
              cozeConversationId: cozeData.conversation_id,
              imageSource: imageFile ? 'upload' : 'url',
              usedFreeQuota: !shouldChargeCredits,
            }),
            tags: [modelStyle, 'extracted'],
          });
        });
        savedToDb = true;
      } catch (dbError) {
        console.error('Database transaction error:', dbError);
      }
      (globalThis as any).__lastPromptSaved = savedToDb;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: promptId,
        prompt: extractedPrompt,
        negativePrompt: negativePrompt || undefined,
        modelStyle,
        creditsUsed: shouldChargeCredits ? creditsPerExtraction : 0,
        remainingCredits: remainingCredits,
        quotaRemaining: quotaCheck.quotaRemaining - 1,
        quotaUsed: quotaCheck.quotaUsed + 1,
        isFreeTrial: isFreeTrial,
        isAuthenticated: isAuthenticated,
        fallbackResponse: isFallbackResponse,
        saved: (globalThis as any).__lastPromptSaved ?? false,
        message: shouldChargeCredits
          ? `Used ${creditsPerExtraction} credits (daily quota exhausted)`
          : isFreeTrial
            ? `Free trial (${quotaCheck.quotaRemaining - 1} remaining today). Sign up to save your prompts!`
            : `Free quota (${quotaCheck.quotaRemaining - 1} remaining today)`,
      },
    });
  } catch (error) {
    console.error('Image to prompt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const modelStyle = searchParams.get('modelStyle') as string | null;
    const offset = (page - 1) * limit;

    // Build query with conditional filters
    const conditions = [eq(prompts.userId, userId)];

    // Filter by model style if provided
    if (
      modelStyle &&
      ['general', 'midjourney', 'nanoBanana', 'flux', 'sora2', 'veo3'].includes(modelStyle)
    ) {
      conditions.push(
        eq(
          prompts.modelStyle,
          modelStyle as 'general' | 'midjourney' | 'nanoBanana' | 'flux' | 'sora2' | 'veo3'
        )
      );
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
        prompts: userPrompts.map((prompt) => ({
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
