import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspect_ratio = 'landscape', quality = 'standard' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const kieApiKey = process.env.KIE_API_KEY;
    if (!kieApiKey) {
      return NextResponse.json(
        { error: 'KIE API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kieApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sora-2-text-to-video',
        input: {
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

    return NextResponse.json({
      taskId: data.data.taskId,
      message: 'Video generation task created successfully',
    });
  } catch (error) {
    console.error('Error creating video generation task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
