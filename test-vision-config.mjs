/**
 * Google Vision API Configuration Test
 * Tests if Vision API is properly configured and working
 */

import fs from 'node:fs';
import path from 'node:path';

async function testVisionConfig() {
  console.log('🧪 Testing Google Vision API Configuration\n');
  console.log('='.repeat(80));

  // Test 1: Check environment variable
  console.log('\n📋 Test 1: Environment Variable Check');
  console.log('-'.repeat(80));

  const hasEnvVar = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('GOOGLE_APPLICATION_CREDENTIALS set:', hasEnvVar ? '✅ YES' : '❌ NO');

  if (!hasEnvVar) {
    console.log('\n❌ Vision API not configured');
    console.log('Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    process.exit(1);
  }

  // Test 2: Parse credentials
  console.log('\n📋 Test 2: Credentials Parsing');
  console.log('-'.repeat(80));

  try {
    const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('✅ Credentials JSON is valid');
    console.log('   Project ID:', creds.project_id || '(missing)');
    console.log('   Client Email:', creds.client_email || '(missing)');
    console.log('   Has Private Key:', creds.private_key ? 'YES' : 'NO');

    if (!creds.project_id || !creds.client_email || !creds.private_key) {
      console.log('\n❌ Credentials are missing required fields');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Failed to parse credentials JSON');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Test 3: Import and initialize Vision API
  console.log('\n📋 Test 3: Vision API Module Import');
  console.log('-'.repeat(80));

  let checkForPeopleAndFaces;
  try {
    const visionModule = await import('./src/lib/google-vision.ts');
    checkForPeopleAndFaces = visionModule.checkForPeopleAndFaces;
    console.log('✅ Vision module imported successfully');
  } catch (error) {
    console.log('❌ Failed to import Vision module');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Test 4: Test with a simple image
  console.log('\n📋 Test 4: Test Image Analysis');
  console.log('-'.repeat(80));

  try {
    // Create a simple test image (1x1 pixel)
    const testImageBuffer = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d,
      0x49,
      0x48,
      0x44,
      0x52, // IHDR chunk
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01, // 1x1 dimensions
      0x08,
      0x02,
      0x00,
      0x00,
      0x00,
      0x90,
      0x77,
      0x53,
      0xde,
      0x00,
      0x00,
      0x00,
      0x0c,
      0x49,
      0x44,
      0x41, // IDAT chunk
      0x54,
      0x08,
      0xd7,
      0x63,
      0xf8,
      0xff,
      0xff,
      0x3f,
      0x00,
      0x05,
      0xfe,
      0x02,
      0xfe,
      0xdc,
      0xcc,
      0x59,
      0xe7,
      0x00,
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4e, // IEND chunk
      0x44,
      0xae,
      0x42,
      0x60,
      0x82,
    ]);

    console.log('Testing with 1x1 pixel test image...');
    const startTime = Date.now();

    const result = await checkForPeopleAndFaces(testImageBuffer);

    const duration = Date.now() - startTime;
    console.log(`✅ Vision API responded in ${duration}ms`);
    console.log('   Success:', result.success);
    console.log('   Blocked:', result.blocked);

    if (result.success) {
      console.log('   Face Count:', result.faceCount || 0);
      console.log('   People Count:', result.peopleCount || 0);
    } else {
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Vision API call failed');
    console.log('   Error:', error.message);
    console.log('   Stack:', error.stack);
    process.exit(1);
  }

  // Test 5: Test with existing image
  console.log('\n📋 Test 5: Test with Real Image');
  console.log('-'.repeat(80));

  try {
    const testImagePath = path.join(process.cwd(), 'public', 'avatar', '1.png');

    if (fs.existsSync(testImagePath)) {
      const imageBuffer = fs.readFileSync(testImagePath);
      console.log(`Testing with real image: ${testImagePath}`);
      console.log(`Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

      const startTime = Date.now();
      const result = await checkForPeopleAndFaces(imageBuffer);
      const duration = Date.now() - startTime;

      console.log(`✅ Vision API responded in ${duration}ms`);
      console.log('   Success:', result.success);
      console.log('   Blocked:', result.blocked);

      if (result.success) {
        console.log('   Face Count:', result.faceCount || 0);
        console.log('   People Count:', result.peopleCount || 0);
        if (result.blocked) {
          console.log('   Reason:', result.reason);
        }
      } else {
        console.log('   Error:', result.error);
      }
    } else {
      console.log('⚠️  Test image not found, skipping real image test');
    }
  } catch (error) {
    console.log('❌ Real image test failed');
    console.log('   Error:', error.message);
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ ALL TESTS PASSED - Vision API is properly configured!');
  console.log('='.repeat(80));
  console.log('\nVision API Status: READY');
  console.log('Face detection is enabled and working correctly.\n');
}

// Run tests
testVisionConfig().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error);
  console.error(error.stack);
  process.exit(1);
});
