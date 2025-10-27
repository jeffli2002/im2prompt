import { readFileSync } from 'node:fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dvskpqqvv',
  api_key: '199778857969364',
  api_secret: 'MRKyoy92261TeAC6Sb_kobubRQs',
});

const images = [
  { path: 'public/images/img2prompt.png', publicId: 'homepage-demos/img2prompt' },
  { path: 'public/images/text2prompt.png', publicId: 'homepage-demos/text2prompt' },
  { path: 'public/images/prompt2imgv2.png', publicId: 'homepage-demos/prompt2imgv2' },
];

async function uploadImages() {
  for (const img of images) {
    try {
      console.log(`Uploading ${img.path}...`);
      const result = await cloudinary.uploader.upload(img.path, {
        public_id: img.publicId,
        folder: '',
        resource_type: 'image',
        overwrite: true,
      });
      console.log(`✓ Uploaded: ${result.secure_url}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${img.path}:`, error.message);
    }
  }
}

uploadImages();
