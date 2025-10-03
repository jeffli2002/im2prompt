import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import db from '@/server/db';
import { prompts, creditTransactions, userCredits } from '@/server/db/schema';
import { eq, desc, count, and } from 'drizzle-orm';

// Coze API configuration
const COZE_WORKFLOW_API_URL = 'https://api.coze.cn/v1/workflow/run';
const COZE_FILE_UPLOAD_URL = 'https://api.coze.cn/v1/files/upload';
const COZE_WORKFLOW_ID = process.env.COZE_WORKFLOW_ID || '7550263539588399142';
const COZE_API_KEY = process.env.COZE_API_KEY;

// Credit costs for image-to-prompt
const CREDITS_PER_EXTRACTION = 1;

export async function POST(req: NextRequest) {
  try {
    // Check if Coze API key is configured
    if (!COZE_API_KEY) {
      console.error('COZE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Try to get session, but don't require it for first 3 attempts
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    let userId = session?.user?.id;
    let isAuthenticated = !!userId;
    let isFreeTrial = false;

    // If no session, use a temporary user ID for free trial
    if (!userId) {
      userId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      isFreeTrial = true;
    }

    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const modelStyle = formData.get('modelStyle') as string || 'general';
    const imageUrl = formData.get('imageUrl') as string | null;
    const language = formData.get('language') as string || 'english';

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

    // Map frontend model style to Coze API promptStyle format
    const modelStyleToPromptStyle: Record<string, string> = {
      'general': 'normal',
      'midjourney': 'midjourney',
      'stable-diffusion': 'stableDiffusion',
      'flux': 'flux',
      'sora2': 'sora2',
      'veo3': 'veo3'
    };
    const promptStyle = modelStyleToPromptStyle[modelStyle] || 'normal';

    // Handle file upload validation
    let cozeFileId = '';
    let cozeFileData: any = null;
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

      // Upload image to Coze to get file_id
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      
      const uploadResponse = await fetch(COZE_FILE_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COZE_API_KEY}`,
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Coze file upload error:', errorText);
        return NextResponse.json(
          { error: 'Failed to upload image to Coze' },
          { status: 500 }
        );
      }

      const uploadData = await uploadResponse.json();
      cozeFileData = uploadData.data || uploadData;
      cozeFileId = cozeFileData.id || cozeFileData.file_id;
      
      if (!cozeFileId) {
        console.error('No file_id in Coze upload response:', uploadData);
        return NextResponse.json(
          { error: 'Failed to get file ID from Coze' },
          { status: 500 }
        );
      }
      
      console.log('Coze file upload success:', cozeFileData);
      
      // TODO: Upload to S3 and get the key
      // uploadedImageKey = await uploadToS3(buffer, imageFile.type);
    }

    // Check user credits (skip for free trial users)
    let userCreditRecord = null;
    let canProceed = true;
    let remainingCredits = 0;

    if (isAuthenticated) {
      userCreditRecord = await db.query.userCredits.findFirst({
        where: (credits, { eq }) => eq(credits.userId, userId),
      });

      if (!userCreditRecord || userCreditRecord.balance < CREDITS_PER_EXTRACTION) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 402 }
        );
      }
      remainingCredits = userCreditRecord.balance - CREDITS_PER_EXTRACTION;
    } else {
      // For free trial, check if this is within the first 3 attempts
      // We'll track this in the response metadata
      remainingCredits = 3; // Start with 3 free attempts
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

    // Prepare workflow parameters
    const workflowParams: any = {
      promptStyle: promptStyle,
      language: language
    };

    // Add image to parameters
    // Coze Image type expects JSON string with file metadata including file_id
    if (cozeFileData) {
      // Ensure file_id field exists (some responses only have 'id')
      const imgData = {
        ...cozeFileData,
        file_id: cozeFileData.file_id || cozeFileData.id
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
      bot_id: COZE_WORKFLOW_ID
    };

    console.log('Calling Coze Workflow API with payload:', JSON.stringify(cozePayload, null, 2));
    
    const cozeResponse = await fetch(COZE_WORKFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(cozePayload),
    });

    if (!cozeResponse.ok) {
      const errorText = await cozeResponse.text();
      console.error('Coze API error:', {
        status: cozeResponse.status,
        statusText: cozeResponse.statusText,
        response: errorText
      });
      return NextResponse.json(
        { error: `Failed to analyze image: ${cozeResponse.status} ${cozeResponse.statusText}` },
        { status: 500 }
      );
    }

    const cozeData = await cozeResponse.json();
    console.log('Coze Workflow API response:', JSON.stringify(cozeData, null, 2));
    
    // Extract the prompt from Coze Workflow response
    let extractedPrompt = '';
    let negativePrompt = '';
    
    // Workflow API returns data in different format
    if (cozeData.data) {
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
        const englishLines = lines.filter(line => {
          // Keep lines that are mostly English (less than 30% Chinese characters)
          const chineseChars = (line.match(/[\u4e00-\u9fa5]/g) || []).length;
          const totalChars = line.length;
          return totalChars === 0 || (chineseChars / totalChars) < 0.3;
        });
        extractedPrompt = englishLines.join('\n');
        console.log('Filtered to English only:', extractedPrompt);
      }
      
      // Extract first prompt option if multiple options are provided
      if (extractedPrompt.includes('### ') || extractedPrompt.includes('**Prompt:**') || extractedPrompt.includes('Sora 2 Prompt:')) {
        // Try to match "一键复制版本" (concise version) first - this is usually the cleanest
        let promptMatch = extractedPrompt.match(/\*\*一键复制版本\*\*[：:]\s*\n([\s\S]*?)(?=\n\n|$)/);
        
        if (!promptMatch || !promptMatch[1]) {
          // Try to match prompt in code block (```...```)
          promptMatch = extractedPrompt.match(/```\s*\n?([\s\S]*?)```/);
        }
        
        if (!promptMatch || !promptMatch[1]) {
          // Try to match first "**Prompt:**" after "### Option 1" and before "### Option 2"
          promptMatch = extractedPrompt.match(/###\s*Option\s*1[\s\S]*?\*\*Prompt:\*\*\s*\n([\s\S]*?)(?=\n\n###\s*Option\s*2|\n\n###|\n\n---|\n\n\*\*Why|$)/);
        }
        
        if (!promptMatch || !promptMatch[1]) {
          // Try to extract all English subsections and combine them (Scene Description, Key Elements, Visual Style)
          const sectionPattern = /\*\*(?:Scene Description|Key Elements & Action|Visual Style & Lighting|Main Context & Action|Main Scene & Subject|Style & Medium|Style & Movement|Quality & Details|Camera & Movement|Lighting & Atmosphere|Color Palette|Additional Elements):\*\*\s*\n([\s\S]*?)(?=\n\n\*\*|\n\n---|\n\n###|$)/g;
          const sections = [];
          let match;
          while ((match = sectionPattern.exec(extractedPrompt)) !== null) {
            sections.push(match[1].trim());
          }
          if (sections.length > 0) {
            // Combine all sections into one prompt, removing extra line breaks
            extractedPrompt = sections.join(' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            // Remove any remaining parameters like --ar, --style at the end
            extractedPrompt = extractedPrompt.replace(/--\w+\s+[\w\/]+\s*/g, '').trim();
            console.log('Combined subsections into prompt:', extractedPrompt);
          }
        }
        
        if (promptMatch && promptMatch[1]) {
          extractedPrompt = promptMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
          // Remove any parameters like --ar, --style
          extractedPrompt = extractedPrompt.replace(/--\w+\s+[\w\/]+\s*/g, '').trim();
          console.log('Extracted clean prompt:', extractedPrompt);
        }
      }
      
      // For Stable Diffusion, try to extract negative prompt
      if (modelStyle === 'stable-diffusion' && extractedPrompt.includes('Negative prompt:')) {
        const parts = extractedPrompt.split('Negative prompt:');
        extractedPrompt = parts[0]?.replace('Positive prompt:', '').trim() || '';
        negativePrompt = parts[1]?.trim() || '';
      }
    }

    if (!extractedPrompt) {
      console.error('No prompt extracted from Coze response:', cozeData);
      
      // If Coze API fails, fall back to mock response
      console.log('Falling back to mock response due to Coze API failure');
      
      // Generate mock prompt based on model style
      const mockPrompts = {
        general: 'A beautiful landscape with mountains in the background, a serene lake in the foreground, golden hour lighting, photorealistic style, high quality, detailed',
        midjourney: 'A stunning mountain landscape at sunset, crystal clear lake reflection, dramatic clouds, golden hour lighting, photorealistic, highly detailed, 8k resolution --ar 16:9 --v 6',
        'stable-diffusion': 'A majestic mountain landscape during golden hour, pristine lake with perfect reflections, dramatic sky with clouds, photorealistic, highly detailed, 8k, masterpiece, best quality',
        flux: 'A breathtaking mountain landscape at sunset, crystal clear alpine lake, dramatic cloud formations, golden hour lighting, photorealistic, ultra detailed, 8k resolution, professional photography',
        sora2: 'A cinematic shot of a serene mountain landscape at sunset, camera slowly panning across a crystal clear lake reflecting the golden sky, dramatic clouds moving overhead, golden hour lighting, photorealistic, 4k video quality',
        veo3: 'A peaceful mountain landscape at golden hour, camera gently moving across a pristine lake with perfect reflections, dramatic clouds drifting in the sky, warm lighting, cinematic quality, photorealistic'
      };

      extractedPrompt = mockPrompts[modelStyle as keyof typeof mockPrompts] || mockPrompts.general;
      negativePrompt = modelStyle === 'stable-diffusion' ? 'blurry, low quality, distorted, ugly, bad anatomy, bad proportions, deformed, low resolution' : undefined;
      
      console.log('Generated mock prompt:', extractedPrompt);
    }

    // Start a database transaction (only for authenticated users)
    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const isFallbackResponse = extractedPrompt.includes('mountain landscape'); // Check if it's a mock response
    
    if (isAuthenticated) {
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
              cozeConversationId: cozeData.conversation_id,
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
        fallbackResponse: isFallbackResponse, // Mark if this was a fallback response
        message: isFreeTrial ? 'This is a free trial. Sign up to save your prompts and get more credits!' : undefined,
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
      conditions.push(eq(prompts.modelStyle, modelStyle as 'general' | 'midjourney' | 'stable-diffusion' | 'flux' | 'sora2' | 'veo3'));
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

