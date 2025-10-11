#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Video Generation Functionality...\n');

// 测试 API 端点
const testEndpoints = [
  {
    name: 'Text to Video API',
    url: 'http://localhost:3000/api/v1/sora-generate',
    method: 'POST',
    body: {
      mode: 'text-to-video',
      prompt: 'A beautiful sunset over mountains, cinematic lighting',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }
  },
  {
    name: 'Image to Video API',
    url: 'http://localhost:3000/api/v1/sora-image-generate',
    method: 'POST',
    body: {
      prompt: 'Camera slowly zooms in, cinematic lighting',
      aspect_ratio: 'landscape',
      quality: 'standard'
    }
  },
  {
    name: 'Image Upload API',
    url: 'http://localhost:3000/api/v1/sora/upload-image',
    method: 'POST'
  }
];

async function testEndpoint(endpoint) {
  console.log(`📡 Testing ${endpoint.name}...`);
  
  try {
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }

    const response = await fetch(endpoint.url, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
    
    if (response.ok) {
      console.log(`   ✅ ${endpoint.name} - OK`);
    } else {
      console.log(`   ❌ ${endpoint.name} - Failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`   ❌ ${endpoint.name} - Error: ${error.message}`);
  }
  
  console.log('');
}

async function testVideoGeneration() {
  console.log('🚀 Starting video generation tests...\n');
  
  // 测试各个 API 端点
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('🏁 Video generation tests completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Open http://localhost:3000/text-to-video');
  console.log('   2. Open http://localhost:3000/image-to-video');
  console.log('   3. Test the UI functionality');
  console.log('   4. Check Cloudinary integration');
}

// 运行测试
testVideoGeneration().catch(console.error);


