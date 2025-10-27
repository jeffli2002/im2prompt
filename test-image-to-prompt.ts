import fs from 'node:fs';
import { generatePromptFromImage } from './src/lib/google-vision';

async function testImageToPrompt() {
  console.log('🧪 Testing Image-to-Prompt with Google Vision API\n');
  console.log('='.repeat(70));

  const testImagePath = process.argv[2];

  if (!testImagePath) {
    console.log('⚠️  No test image provided');
    console.log('\n💡 To test with an image, run:');
    console.log('   npx tsx test-image-to-prompt.ts /path/to/image.jpg [language] [style]\n');
    console.log('   language: zh or en (default: en)');
    console.log('   style: general, midjourney, stable-diffusion, flux, sora2, veo3\n');
    return;
  }

  if (!fs.existsSync(testImagePath)) {
    console.error('❌ Test image not found at:', testImagePath);
    process.exit(1);
  }

  const language = (process.argv[3] || 'en') as 'zh' | 'en';
  const modelStyle = process.argv[4] || 'general';

  console.log('\n📋 Test Configuration:');
  console.log('  Image:', testImagePath);
  console.log('  Language:', language === 'zh' ? 'Chinese (中文)' : 'English');
  console.log('  Model Style:', modelStyle);
  console.log('');

  console.log('📸 Loading image...');
  const imageBuffer = fs.readFileSync(testImagePath);
  console.log('✅ Image loaded:', (imageBuffer.length / 1024).toFixed(2), 'KB\n');

  console.log('🔄 Generating prompt with Google Vision API...\n');

  try {
    const startTime = Date.now();
    const result = await generatePromptFromImage(imageBuffer, language, modelStyle);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('📊 RESULT:');
    console.log('='.repeat(70));
    console.log('Success:', result.success ? '✅' : '❌');
    console.log('Duration:', duration, 'seconds');
    console.log('');

    if (result.success && result.prompt) {
      console.log('🎯 GENERATED PROMPT:');
      console.log('-'.repeat(70));
      console.log(result.prompt);
      console.log('-'.repeat(70));
      console.log('');

      if (result.rawData) {
        console.log('📝 RAW DETECTION DATA:');
        console.log('  Labels detected:', result.rawData.labels?.length || 0);
        if (result.rawData.labels && result.rawData.labels.length > 0) {
          console.log('  Top labels:', result.rawData.labels.slice(0, 5).join(', '));
        }
        console.log('  Objects detected:', result.rawData.objects?.length || 0);
        if (result.rawData.objects && result.rawData.objects.length > 0) {
          console.log('  Objects:', result.rawData.objects.join(', '));
        }
        console.log('  Dominant colors:', result.rawData.colors || 0);
        console.log('  Faces detected:', result.rawData.faces || 0);
        console.log('  Text detected:', result.rawData.hasText ? 'Yes' : 'No');
        console.log('');
      }

      console.log('✅ PROMPT LENGTH:', result.prompt.length, 'characters');
      console.log('');
      console.log('💡 This prompt can be used for:');
      console.log('  - Nano Banana image generation');
      console.log('  - Midjourney');
      console.log('  - Stable Diffusion');
      console.log('  - Other AI image generators');
    } else {
      console.log('❌ FAILED TO GENERATE PROMPT');
      if (result.error) {
        console.log('Error:', result.error);
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log('🎉 Test completed!\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nStack trace:', error);
    process.exit(1);
  }
}

testImageToPrompt().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
