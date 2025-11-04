import { type NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Try Cloudinary upload
    const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

    console.log('[Upload Image] Cloudinary config check:', {
      hasCloudName: !!CLOUDINARY_CLOUD_NAME,
      hasUploadPreset: !!CLOUDINARY_UPLOAD_PRESET,
      cloudName: CLOUDINARY_CLOUD_NAME ? `${CLOUDINARY_CLOUD_NAME.substring(0, 3)}***` : 'missing',
    });

    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      try {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', `data:${file.type};base64,${base64}`);
        cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Set folder for organization (helps with URL cleanliness)
        cloudinaryFormData.append('folder', 'sora-inputs');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        console.log('[Upload Image] Uploading to Cloudinary:', uploadUrl);

        const cloudinaryResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: cloudinaryFormData,
        });

        console.log('[Upload Image] Cloudinary response status:', cloudinaryResponse.status);

        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error('[Upload Image] Cloudinary HTTP error:', {
            status: cloudinaryResponse.status,
            statusText: cloudinaryResponse.statusText,
            body: errorText,
          });
          throw new Error(`Cloudinary upload failed with status ${cloudinaryResponse.status}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        console.log(
          '[Upload Image] Cloudinary response data:',
          JSON.stringify(cloudinaryData, null, 2)
        );

        if (!cloudinaryData.secure_url) {
          console.error('[Upload Image] Cloudinary response missing secure_url:', cloudinaryData);
          throw new Error('Cloudinary upload succeeded but no URL returned');
        }

        const imageUrl = cloudinaryData.secure_url.trim();
        console.log('[Upload Image] Successfully uploaded to Cloudinary:', imageUrl);
        console.log('[Upload Image] Image details:', {
          format: cloudinaryData.format,
          width: cloudinaryData.width,
          height: cloudinaryData.height,
          bytes: cloudinaryData.bytes,
        });

        // Validate URL is accessible with a simple retry mechanism
        console.log('[Upload Image] Validating Cloudinary URL accessibility...');
        let validated = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const validationResponse = await fetch(imageUrl, {
              method: 'HEAD',
              signal: AbortSignal.timeout(10000),
            });

            if (validationResponse.ok) {
              console.log(`[Upload Image] URL validation passed on attempt ${attempt}`);
              validated = true;
              break;
            }
            console.warn(
              `[Upload Image] URL validation failed attempt ${attempt}: status ${validationResponse.status}`
            );
          } catch (validationError) {
            console.warn(
              `[Upload Image] URL validation error attempt ${attempt}:`,
              validationError
            );
          }

          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!validated) {
          console.warn(
            '[Upload Image] URL validation failed but proceeding anyway - CDN might need time to propagate'
          );
        }

        return NextResponse.json({
          imageUrl,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      } catch (cloudinaryError) {
        console.error('[Upload Image] Cloudinary error:', cloudinaryError);
        // Don't fall back - throw the error so caller knows what went wrong
        return NextResponse.json(
          {
            error: `Cloudinary upload failed: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'}`,
          },
          { status: 500 }
        );
      }
    } else {
      console.error('[Upload Image] Cloudinary not configured - missing environment variables');
      return NextResponse.json(
        {
          error:
            'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET environment variables.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}









