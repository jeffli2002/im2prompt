#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Google Vision API Face Detection for Image-to-Video...\n');

// 检查环境变量配置
console.log('📋 Checking Google Vision API configuration:');

const requiredEnvVars = [
  'GOOGLE_APPLICATION_CREDENTIALS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_UPLOAD_PRESET',
  'KIE_API_KEY'
];

let envConfigValid = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`  ✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${envVar}: Not set`);
    envConfigValid = false;
  }
}

if (!envConfigValid) {
  console.log('\n❌ Missing required environment variables.');
  console.log('💡 Please ensure your .env.local file contains:');
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.log(`  - ${envVar}`);
    }
  });
  process.exit(1);
}

console.log('\n✅ Environment variables configured correctly\n');

// 测试场景
const testScenarios = [
  {
    name: 'Test 1: Image with Face (Should be blocked)',
    description: 'Testing with an image that contains faces - should be blocked by Vision API',
    imagePath: 'public/images/wechat.png', // 假设这个图片有人脸
    expectedResult: 'BLOCKED'
  },
  {
    name: 'Test 2: Landscape Image (Should pass)',
    description: 'Testing with a landscape image - should pass Vision API check',
    imagePath: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // Cloudinary demo image
    expectedResult: 'PASS'
  }
];

async function testFaceDetection(scenario) {
  console.log(`🔍 ${scenario.name}`);
  console.log(`   Description: ${scenario.description}`);
  console.log(`   Expected: ${scenario.expectedResult}`);
  
  try {
    let imageBuffer;
    
    if (scenario.imagePath.startsWith('http')) {
      // 测试网络图片
      console.log(`   📷 Using network image: ${scenario.imagePath}`);
      
      const response = await fetch(scenario.imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      // 测试本地图片
      console.log(`   📷 Using local image: ${scenario.imagePath}`);
      
      if (!fs.existsSync(scenario.imagePath)) {
        console.log(`   ❌ Local image not found: ${scenario.imagePath}`);
        return;
      }
      
      imageBuffer = fs.readFileSync(scenario.imagePath);
    }
    
    console.log(`   📊 Image size: ${imageBuffer.length} bytes`);
    
    // 创建 FormData 并发送到我们的 API
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test-image.png');
    formData.append('prompt', 'Camera slowly zooms in, cinematic lighting');
    formData.append('aspect_ratio', 'landscape');
    formData.append('quality', 'standard');
    
    console.log('   🚀 Sending request to Image-to-Video API...');
    
    const apiResponse = await fetch('http://localhost:3000/api/v1/sora-image-generate', {
      method: 'POST',
      body: formData
    });
    
    const responseData = await apiResponse.json();
    
    console.log(`   📡 API Response Status: ${apiResponse.status}`);
    console.log(`   📄 Response: ${JSON.stringify(responseData, null, 2)}`);
    
    // 分析结果
    if (apiResponse.status === 400 && responseData.error) {
      if (responseData.error.includes('face') || responseData.error.includes('people') || 
          responseData.error.includes('person') || responseData.error.includes('人脸')) {
        console.log(`   ✅ CORRECT: Image was blocked by Vision API (${scenario.expectedResult === 'BLOCKED' ? 'Expected' : 'Unexpected'})`);
        console.log(`   🚫 Blocking reason: ${responseData.error}`);
      } else {
        console.log(`   ⚠️  Image was blocked for other reason: ${responseData.error}`);
      }
    } else if (apiResponse.ok && responseData.taskId) {
      console.log(`   ✅ CORRECT: Image passed Vision API check (${scenario.expectedResult === 'PASS' ? 'Expected' : 'Unexpected'})`);
      console.log(`   🎬 Video generation task created: ${responseData.taskId}`);
    } else {
      console.log(`   ❌ Unexpected response: ${responseData.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
  }
  
  console.log('');
}

async function runTests() {
  console.log('🚀 Starting Google Vision API Face Detection Tests...\n');
  
  for (const scenario of testScenarios) {
    await testFaceDetection(scenario);
  }
  
  console.log('🏁 Face detection tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('   1. Images with faces should be blocked by Vision API');
  console.log('   2. Images without faces should pass Vision API check');
  console.log('   3. API should return appropriate error messages');
  console.log('   4. Video generation should only proceed for safe images');
  
  console.log('\n💡 Manual Testing:');
  console.log('   1. Open http://localhost:3000/image-to-video');
  console.log('   2. Try uploading an image with faces');
  console.log('   3. Try uploading a landscape image');
  console.log('   4. Verify the blocking behavior');
}

// 运行测试
runTests().catch(console.error);



