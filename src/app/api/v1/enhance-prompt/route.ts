import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context = 'image' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const sanitizedPrompt = prompt.trim();
    const generationContext =
      typeof context === 'string' && context.trim().length > 0 ? context.trim() : 'image';

    const providers: Array<() => Promise<string | null>> = [];
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    const buildMessages = (promptText: string, generationContext: string) => [
      {
        role: 'system',
        content:
          'You are an expert AI prompt engineer for multimodal generation (text-to-image, image-to-video, etc). Enhance prompts with vivid artistic direction, lighting, composition, and camera/style cues. Only return the improved prompt text.',
      },
      {
        role: 'user',
        content: `Enhance this prompt for ${generationContext} generation:\n\n${promptText}\n\nRespond with the enhanced prompt only.`,
      },
    ];

    const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const controller = new AbortController();
      const timeout = Number(process.env.AI_ENHANCER_TIMEOUT_MS || 15000);
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    const extractContent = (rawContent: any) => {
      if (!rawContent) return null;
      if (typeof rawContent === 'string') {
        return rawContent.trim();
      }

      if (Array.isArray(rawContent)) {
        const combined = rawContent
          .map((part) => {
            if (typeof part === 'string') return part;
            if (typeof part?.text === 'string') return part.text;
            if (typeof part?.content === 'string') return part.content;
            return '';
          })
          .join('\n')
          .trim();
        return combined || null;
      }

      if (typeof rawContent?.text === 'string') {
        return rawContent.text.trim();
      }

      return null;
    };

    if (deepseekKey) {
      providers.push(async () => {
        try {
          const response = await fetchWithTimeout('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: buildMessages(sanitizedPrompt, generationContext),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('DeepSeek enhance error:', errorData);
            return null;
          }

          const data = await response.json();
          return extractContent(data.choices?.[0]?.message?.content) || sanitizedPrompt;
        } catch (error) {
          console.error('DeepSeek enhance request failed:', error);
          return null;
        }
      });
    }

    if (openRouterKey) {
      providers.push(async () => {
        try {
          const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openRouterKey}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.im2prompt.com',
              'X-Title': 'im2Prompt',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.0-flash-lite-preview',
              messages: buildMessages(sanitizedPrompt, generationContext),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenRouter enhance error:', errorData);
            return null;
          }

          const data = await response.json();
          return extractContent(data.choices?.[0]?.message?.content) || sanitizedPrompt;
        } catch (error) {
          console.error('OpenRouter enhance request failed:', error);
          return null;
        }
      });
    }

    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'No prompt enhancement provider configured' },
        { status: 500 }
      );
    }

    for (const provider of providers) {
      const result = await provider();
      if (result) {
        return NextResponse.json({
          enhancedPrompt: result,
          originalPrompt: sanitizedPrompt,
        });
      }
    }

    return NextResponse.json(
      { error: 'Prompt enhancement temporarily unavailable. Please try again shortly.' },
      { status: 502 }
    );
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
