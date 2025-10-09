import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadPromptImage(
  imagePath: string,
  category: string,
  fileName: string
): Promise<UploadResult> {
  const folderPath = `prompt-library/${category}`;
  
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: folderPath,
      public_id: fileName.replace(/\.[^/.]+$/, ''),
      resource_type: 'image',
      overwrite: false,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ],
    });

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

export async function uploadBulkImages(
  images: Array<{ path: string; category: string; fileName: string }>
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (const image of images) {
    try {
      const result = await uploadPromptImage(
        image.path,
        image.category,
        image.fileName
      );
      results.push(result);
      console.log(`✓ Uploaded: ${result.publicId}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${image.fileName}:`, error);
    }
  }
  
  return results;
}

export async function createPromptLibraryFolders(): Promise<void> {
  const folders = [
    'prompt-library/people-portraits',
    'prompt-library/animals-wildlife',
    'prompt-library/scenery-environment',
    'prompt-library/objects-products',
    'prompt-library/science-edu-tech',
    'prompt-library/fashion-lifestyle',
  ];

  console.log('Cloudinary folders will be created automatically on first upload:');
  folders.forEach(folder => console.log(`  - ${folder}`));
}

export function getExpectedPublicId(category: string, fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  return `prompt-library/${category}/${nameWithoutExt}`;
}
