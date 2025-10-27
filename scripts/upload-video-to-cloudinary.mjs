import { readFileSync } from 'node:fs';
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Parse CLOUDINARY_URL
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
  if (match) {
    cloudinary.config({
      cloud_name: match[3],
      api_key: match[1],
      api_secret: match[2],
    });
  }
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadVideo() {
  try {
    console.log('Uploading video to Cloudinary...');

    const result = await cloudinary.uploader.upload('public/images/text2video.mp4', {
      resource_type: 'video',
      folder: 'homepage-videos',
      public_id: 'text2video-demo',
      eager: [
        {
          format: 'mp4',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
      ],
      eager_async: false,
    });

    console.log('✅ Video uploaded successfully!');
    console.log('Public ID:', result.public_id);
    console.log('Secure URL:', result.secure_url);
    console.log('Duration:', result.duration, 'seconds');
    console.log('Format:', result.format);
    console.log('Size:', (result.bytes / 1024 / 1024).toFixed(2), 'MB');

    console.log('\nPoster URL (auto-generated):');
    console.log(
      cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ quality: 'auto' }],
      })
    );

    return result;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

uploadVideo();
