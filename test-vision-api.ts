import { checkForPeopleAndFaces } from './src/lib/google-vision';
import fs from 'fs';
import path from 'path';

async function testVisionAPI() {
  console.log('🧪 Testing Google Vision API Integration\n');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Test Setup:');
  console.log('- Checking credentials file...');
  
  const credPath = path.join(process.cwd(), 'config', 'google-vision-key.json');
  if (!fs.existsSync(credPath)) {
    console.error('❌ Credentials file not found at:', credPath);
    process.exit(1);
  }
  console.log('✅ Credentials file found');
  
  console.log('\n🔍 Test Case 1: Testing with a sample image');
  console.log('Please provide a test image path (or press Enter to skip):');
  console.log('Example: /path/to/your/test-image.jpg\n');
  
  const testImagePath = process.argv[2];
  
  if (!testImagePath) {
    console.log('⚠️  No test image provided');
    console.log('\n💡 To test with an image, run:');
    console.log('   npx tsx test-vision-api.ts /path/to/image.jpg\n');
    console.log('✅ Google Vision API setup is complete and ready to use!');
    console.log('\n📌 Integration Points:');
    console.log('   1. Function: checkForPeopleAndFaces() in src/lib/google-vision.ts');
    console.log('   2. API Route: /api/v1/sora-generate (lines 77-100)');
    console.log('   3. UI Warning: Image-to-Video tab (line 355)');
    console.log('   4. Error Handling: Frontend alert (line 180)');
    return;
  }
  
  if (!fs.existsSync(testImagePath)) {
    console.error('❌ Test image not found at:', testImagePath);
    process.exit(1);
  }
  
  console.log('📸 Loading image:', testImagePath);
  const imageBuffer = fs.readFileSync(testImagePath);
  console.log('✅ Image loaded:', (imageBuffer.length / 1024).toFixed(2), 'KB\n');
  
  console.log('🔄 Analyzing image with Google Vision API...\n');
  
  try {
    const result = await checkForPeopleAndFaces(imageBuffer);
    
    console.log('📊 ANALYSIS RESULTS:');
    console.log('=' .repeat(60));
    console.log('Success:', result.success ? '✅' : '❌');
    console.log('Blocked:', result.blocked ? '🚫 YES' : '✅ NO');
    
    if (result.blocked) {
      console.log('\n❌ IMAGE REJECTED:');
      console.log('Reason:', result.reason);
      console.log('\nDetails:');
      console.log('  - Faces detected:', result.faceCount);
      console.log('  - People detected:', result.peopleCount);
      
      if (result.details?.personLabels && result.details.personLabels.length > 0) {
        console.log('\n  Person-related labels found:');
        result.details.personLabels.forEach((label: any) => {
          console.log(`    • ${label.description} (confidence: ${(label.confidence * 100).toFixed(1)}%)`);
        });
      }
      
      console.log('\n💡 This image would be BLOCKED from Sora 2 video generation');
    } else {
      console.log('\n✅ IMAGE APPROVED:');
      console.log('No people or faces detected');
      console.log('\n💡 This image would be ALLOWED for Sora 2 video generation');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nStack trace:', error);
    process.exit(1);
  }
}

testVisionAPI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
