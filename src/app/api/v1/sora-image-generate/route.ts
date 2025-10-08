import { type NextRequest, NextResponse } from 'next/server';
import { checkForPeopleAndFaces } from '@/lib/google-vision';

export async function POST(request: NextRequest) {
  try {
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
      
      const visionCheck = await checkForPeopleAndFaces(imageBuffer);
      
      if (!visionCheck.success) {
        return NextResponse.json(
          { error: visionCheck.error || 'Failed to analyze image' },
          { status: 500 }
        );
      }
      
      if (visionCheck.blocked) {
        return NextResponse.json(
          { 
            error: visionCheck.reason,
            details: visionCheck.details,
          },
          { status: 400 }
        );
      }
      const fileFormData = new FormData();
      fileFormData.append('file', imageFile);

      const uploadResponse = await fetch('https://api.kie.ai/api/v1/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kieApiKey}`,
        },
        body: fileFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('Image upload error:', errorData);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: uploadResponse.status }
        );
      }

      const uploadData = await uploadResponse.json();
      if (uploadData.code === 200 && uploadData.data?.url) {
        imageUrls = [uploadData.data.url];
      } else {
        return NextResponse.json(
          { error: 'Failed to get uploaded image URL' },
          { status: 500 }
        );
      }
    } else if (imageUrl) {
      imageUrls = [imageUrl];
    } else {
      return NextResponse.json(
        { error: 'Either image file or image URL is required' },
        { status: 400 }
      );
    }

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

    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      console.error('Empty response from KIE API');
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

    return NextResponse.json({
      taskId: data.data.taskId,
      message: 'Image-to-video generation task created successfully',
    });
  } catch (error) {
    console.error('Error creating image-to-video generation task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
