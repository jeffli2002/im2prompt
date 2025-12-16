import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { env } from '@/env';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Simple R2 (Cloudflare) storage wrapper used by admin upload endpoints.
// Uses existing R2_* env vars defined in src/env.ts.

const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export class R2StorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = env.R2_BUCKET_NAME;
  }

  async uploadFile(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string,
    folder?: string,
  ): Promise<{ key: string; url: string }> {
    const key = folder ? `${folder}/${randomUUID()}-${fileName}` : `${randomUUID()}-${fileName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      }),
    );

    const url = `${env.R2_PUBLIC_URL}/${key}`;
    return { key, url };
  }

  async createDirectUploadUrl(
    fileName: string,
    contentType: string,
    options?: { folder?: string; expiresIn?: number },
  ): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
    const folderPath = options?.folder ? `${options.folder}/` : '';
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folderPath}${randomUUID()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: options?.expiresIn ?? 15 * 60, // 15 minutes default
    });

    const publicUrl = `${env.R2_PUBLIC_URL}/${key}`;
    return { key, uploadUrl, publicUrl };
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  async uploadBatchFile(file: Buffer, fileName: string): Promise<{ key: string; url: string }> {
    return this.uploadFile(file, fileName, 'text/csv', 'batch-uploads');
  }

  async uploadAsset(
    file: Buffer | Uint8Array,
    fileName: string,
    contentType: string,
    assetType: 'image' | 'video',
  ): Promise<{ key: string; url: string }> {
    const folder = assetType === 'image' ? 'images' : 'videos';
    return this.uploadFile(file, fileName, contentType, folder);
  }

  async getAsset(key: string): Promise<{
    body: Readable | ReadableStream<Uint8Array>;
    contentType?: string;
    contentLength?: number;
    cacheControl?: string;
    lastModified?: Date;
    etag?: string;
  }> {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error('Asset body is empty');
    }

    return {
      body: response.Body as Readable | ReadableStream<Uint8Array>,
      contentType: response.ContentType ?? undefined,
      contentLength:
        typeof response.ContentLength === 'number' ? response.ContentLength : undefined,
      cacheControl: response.CacheControl ?? undefined,
      lastModified: response.LastModified ?? undefined,
      etag: response.ETag ?? undefined,
    };
  }
}

export const r2StorageService = new R2StorageService();


