import { checkForPeopleAndFaces } from './src/lib/google-vision';

async function testWithURL() {
  console.log('🧪 Testing Google Vision API with Sample Images\n');
  console.log('=' .repeat(60));
  
  const testImages = [
    {
      name: 'Landscape (should PASS)',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      expected: 'PASS'
    },
    {
      name: 'Person Portrait (should FAIL)',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      expected: 'FAIL'
    }
  ];
  
  for (const test of testImages) {
    console.log(`\n📸 Testing: ${test.name}`);
    console.log(`URL: ${test.url.substring(0, 60)}...`);
    console.log('Expected:', test.expected);
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch(test.url);
      if (!response.ok) {
        console.log('⚠️  Could not fetch image, skipping...\n');
        continue;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      
      console.log(`✅ Downloaded: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      console.log('🔄 Analyzing...\n');
      
      const result = await checkForPeopleAndFaces(imageBuffer);
      
      console.log('RESULT:');
      console.log('  Success:', result.success ? '✅' : '❌');
      console.log('  Blocked:', result.blocked ? '🚫 YES' : '✅ NO');
      console.log('  Faces:', result.faceCount || 0);
      console.log('  People:', result.peopleCount || 0);
      
      if (result.blocked) {
        console.log('  Reason:', result.reason);
      }
      
      const actualResult = result.blocked ? 'FAIL' : 'PASS';
      const testPassed = actualResult === test.expected;
      
      console.log('\n  Test:', testPassed ? '✅ PASSED' : '❌ FAILED');
      console.log('  Expected:', test.expected, '| Got:', actualResult);
      
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
    }
    
    console.log('=' .repeat(60));
  }
  
  console.log('\n🎉 All tests completed!\n');
}

testWithURL().catch(console.error);
