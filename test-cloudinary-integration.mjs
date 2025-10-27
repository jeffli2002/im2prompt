#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试 Cloudinary 配置
console.log('🧪 Testing Cloudinary Integration for im2prompt...\n');

// 检查环境变量
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_UPLOAD_PRESET', 'KIE_API_KEY'];

console.log('📋 Checking environment variables:');
let envConfigValid = true;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`  ❌ ${envVar}: Not set`);
    envConfigValid = false;
  }
}

if (!envConfigValid) {
  console.log('\n❌ Missing required environment variables. Please set:');
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.log(`  - ${envVar}`);
    }
  });
  console.log('\n💡 Add these to your .env.local file');
  process.exit(1);
}

console.log('\n✅ Environment variables configured correctly\n');

// 测试上传 API
console.log('🔄 Testing image upload API...');

try {
  // 创建一个简单的测试图片 (1x1 PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6e, 0xf9, 0x24, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  const formData = new FormData();
  const blob = new Blob([testImageBuffer], { type: 'image/png' });
  formData.append('image', blob, 'test-image.png');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const uploadUrl = `${baseUrl}/api/v1/sora/upload-image`;

  console.log(`📤 Uploading test image to: ${uploadUrl}`);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const uploadData = await uploadResponse.json();

  if (uploadResponse.ok && uploadData.imageUrl) {
    console.log('✅ Upload successful!');
    console.log(`📷 Image URL: ${uploadData.imageUrl}`);

    // 验证图片 URL 是否可访问
    console.log('\n🔍 Validating image URL accessibility...');
    try {
      const imageResponse = await fetch(uploadData.imageUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-1023' },
      });

      if (imageResponse.ok || imageResponse.status === 206) {
        console.log('✅ Image URL is accessible');

        // 测试图片到视频生成
        console.log('\n🎬 Testing image-to-video generation...');

        const videoFormData = new FormData();
        videoFormData.append('prompt', 'Camera slowly zooms in, cinematic lighting');
        videoFormData.append('image', blob);
        videoFormData.append('aspect_ratio', 'landscape');
        videoFormData.append('quality', 'standard');

        const videoResponse = await fetch(`${baseUrl}/api/v1/sora-image-generate`, {
          method: 'POST',
          body: videoFormData,
        });

        const videoData = await videoResponse.json();

        if (videoResponse.ok && videoData.taskId) {
          console.log('✅ Video generation task created successfully!');
          console.log(`🎯 Task ID: ${videoData.taskId}`);
          console.log(`💰 Credits used: ${videoData.creditsUsed || 0}`);
          console.log(`📊 Quota remaining: ${videoData.quotaRemaining || 'N/A'}`);
        } else {
          console.log('❌ Video generation failed:');
          console.log(`   Status: ${videoResponse.status}`);
          console.log(`   Error: ${videoData.error || 'Unknown error'}`);
        }
      } else {
        console.log(`❌ Image URL not accessible: HTTP ${imageResponse.status}`);
      }
    } catch (validationError) {
      console.log(`❌ Image URL validation failed: ${validationError.message}`);
    }
  } else {
    console.log('❌ Upload failed:');
    console.log(`   Status: ${uploadResponse.status}`);
    console.log(`   Error: ${uploadData.error || 'Unknown error'}`);
  }
} catch (error) {
  console.error('❌ Test failed:', error.message);
}

console.log('\n🏁 Cloudinary integration test completed!');
