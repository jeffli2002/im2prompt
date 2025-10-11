import { v2 as cloudinary } from 'cloudinary';
import { ErrorLogger } from '@/lib/logger/logger-utils';

const cloudinaryErrorLogger = new ErrorLogger('cloudinary-service');

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * 上传图片到 Cloudinary
 */
export async function uploadImageToCloudinary(
  imageBuffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    format?: string;
    quality?: string | number;
    transformation?: any;
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    console.log('[Cloudinary] Starting image upload...');
    
    // 将 Buffer 转换为 base64 字符串
    const base64Image = `data:image/${options.format || 'auto'};base64,${imageBuffer.toString('base64')}`;
    
    // 上传配置
    const uploadOptions = {
      folder: options.folder || 'sora-video-images',
      public_id: options.public_id,
      format: options.format || 'auto',
      quality: options.quality || 'auto',
      transformation: options.transformation,
      resource_type: 'image' as const,
    };

    console.log('[Cloudinary] Upload options:', uploadOptions);

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);
    
    console.log('[Cloudinary] Upload successful:', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    cloudinaryErrorLogger.logError(error as Error, {
      operation: 'uploadImageToCloudinary',
      options,
    });
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 使用上传预设上传图片
 */
export async function uploadImageWithPreset(
  imageBuffer: Buffer,
  uploadPreset: string,
  options: {
    public_id?: string;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    console.log('[Cloudinary] Uploading with preset:', uploadPreset);
    
    const base64Image = `data:image/auto;base64,${imageBuffer.toString('base64')}`;
    
    const uploadOptions = {
      upload_preset: uploadPreset,
      public_id: options.public_id,
      tags: options.tags || ['sora-video'],
      resource_type: 'image' as const,
    };

    const result = await cloudinary.uploader.upload(base64Image, uploadOptions);
    
    console.log('[Cloudinary] Preset upload successful:', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    cloudinaryErrorLogger.logError(error as Error, {
      operation: 'uploadImageWithPreset',
      uploadPreset,
      options,
    });
    throw new Error(`Failed to upload image with preset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 删除 Cloudinary 上的图片
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    console.log('[Cloudinary] Deleting image:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('[Cloudinary] Image deleted successfully:', publicId);
      return true;
    } else {
      console.warn('[Cloudinary] Failed to delete image:', result);
      return false;
    }
  } catch (error) {
    cloudinaryErrorLogger.logError(error as Error, {
      operation: 'deleteImageFromCloudinary',
      publicId,
    });
    return false;
  }
}

/**
 * 获取 Cloudinary 图片的公开 URL
 */
export function getCloudinaryUrl(publicId: string, options: {
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
} = {}): string {
  try {
    const url = cloudinary.url(publicId, {
      format: options.format || 'auto',
      quality: options.quality || 'auto',
      width: options.width,
      height: options.height,
      crop: options.crop || 'limit',
    });
    
    return url;
  } catch (error) {
    cloudinaryErrorLogger.logError(error as Error, {
      operation: 'getCloudinaryUrl',
      publicId,
      options,
    });
    throw new Error(`Failed to generate Cloudinary URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 验证 Cloudinary 配置
 */
export function validateCloudinaryConfig(): boolean {
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_UPLOAD_PRESET',
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('[Cloudinary] Missing required environment variables:', missingVars);
    return false;
  }
  
  return true;
}


