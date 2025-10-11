import { checkForPeopleAndFaces, analyzeImage, detectText, generatePromptFromImage } from './src/lib/google-vision';
import fs from 'fs';
import path from 'path';

async function runAutoTests() {
  console.log('🧪 Google Vision API Auto Test Suite\n');
  console.log('=' .repeat(80));
  
  let passedTests = 0;
  let totalTests = 0;
  
  console.log('\n📋 Test 1: Credentials Configuration');
  console.log('-' .repeat(80));
  totalTests++;
  
  try {
    const credPath = path.join(process.cwd(), 'config', 'google-vision-key.json');
    if (fs.existsSync(credPath)) {
      const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
      if (credentials.project_id && credentials.private_key && credentials.client_email) {
        console.log('✅ PASS: Credentials file exists and contains required fields');
        console.log(`   Project ID: ${credentials.project_id}`);
        console.log(`   Client Email: ${credentials.client_email}`);
        passedTests++;
      } else {
        console.log('❌ FAIL: Credentials file missing required fields');
      }
    } else {
      console.log('❌ FAIL: Credentials file not found at:', credPath);
    }
  } catch (error) {
    console.log('❌ FAIL: Error reading credentials:', error instanceof Error ? error.message : error);
  }
  
  console.log('\n📋 Test 2: Create Test Image (Simple 100x100 white square)');
  console.log('-' .repeat(80));
  totalTests++;
  
  const testImagePath = path.join(process.cwd(), 'test-image-auto.png');
  
  try {
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 100, 100);
    
    ctx.fillStyle = 'blue';
    ctx.fillRect(25, 25, 50, 50);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(testImagePath, buffer);
    
    console.log('✅ PASS: Test image created successfully');
    console.log(`   Location: ${testImagePath}`);
    console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
    passedTests++;
    
    console.log('\n📋 Test 3: Test checkForPeopleAndFaces() function');
    console.log('-' .repeat(80));
    totalTests++;
    
    try {
      const imageBuffer = fs.readFileSync(testImagePath);
      const result = await checkForPeopleAndFaces(imageBuffer);
      
      if (result.success === true) {
        console.log('✅ PASS: checkForPeopleAndFaces() executed successfully');
        console.log(`   Blocked: ${result.blocked}`);
        console.log(`   Has Faces: ${result.hasFaces}`);
        console.log(`   Face Count: ${result.faceCount}`);
        console.log(`   Has People: ${result.hasPeople}`);
        console.log(`   People Count: ${result.peopleCount}`);
        passedTests++;
      } else {
        console.log('❌ FAIL: checkForPeopleAndFaces() returned success=false');
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ FAIL: Exception in checkForPeopleAndFaces()');
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }
    
    console.log('\n📋 Test 4: Test analyzeImage() function');
    console.log('-' .repeat(80));
    totalTests++;
    
    try {
      const imageBuffer = fs.readFileSync(testImagePath);
      const result = await analyzeImage(imageBuffer);
      
      if (result.success === true) {
        console.log('✅ PASS: analyzeImage() executed successfully');
        console.log(`   Labels detected: ${result.labels?.length || 0}`);
        if (result.labels && result.labels.length > 0) {
          console.log('   Top labels:');
          result.labels.slice(0, 3).forEach((label: any) => {
            console.log(`     - ${label.description} (${(label.score * 100).toFixed(1)}%)`);
          });
        }
        passedTests++;
      } else {
        console.log('❌ FAIL: analyzeImage() returned success=false');
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ FAIL: Exception in analyzeImage()');
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }
    
    console.log('\n📋 Test 5: Test detectText() function');
    console.log('-' .repeat(80));
    totalTests++;
    
    try {
      const imageBuffer = fs.readFileSync(testImagePath);
      const result = await detectText(imageBuffer);
      
      if (result.success === true) {
        console.log('✅ PASS: detectText() executed successfully');
        console.log(`   Text detected: "${result.text || '(none)'}"`);
        console.log(`   Detection count: ${result.detections?.length || 0}`);
        passedTests++;
      } else {
        console.log('❌ FAIL: detectText() returned success=false');
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ FAIL: Exception in detectText()');
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }
    
    console.log('\n📋 Test 6: Test generatePromptFromImage() function');
    console.log('-' .repeat(80));
    totalTests++;
    
    try {
      const imageBuffer = fs.readFileSync(testImagePath);
      const result = await generatePromptFromImage(imageBuffer, 'en', 'general');
      
      if (result.success === true) {
        console.log('✅ PASS: generatePromptFromImage() executed successfully');
        console.log(`   Prompt generated: "${result.prompt?.substring(0, 100)}..."`);
        console.log(`   Raw data - Labels: ${result.rawData?.labels?.length || 0}`);
        console.log(`   Raw data - Objects: ${result.rawData?.objects?.length || 0}`);
        passedTests++;
      } else {
        console.log('❌ FAIL: generatePromptFromImage() returned success=false');
        console.log(`   Error: ${result.error}`);
      }
    } catch (error) {
      console.log('❌ FAIL: Exception in generatePromptFromImage()');
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }
    
    fs.unlinkSync(testImagePath);
    console.log(`\n🗑️  Cleaned up test image: ${testImagePath}`);
    
  } catch (error) {
    console.log('❌ FAIL: Could not create test image');
    console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    console.log('   Note: Install canvas package for image creation: pnpm add canvas');
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${totalTests - passedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Google Vision API is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please check the errors above.\n');
    process.exit(1);
  }
}

runAutoTests().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});
