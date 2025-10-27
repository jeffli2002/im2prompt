const vision = require('@google-cloud/vision');
const fs = require('node:fs');
const path = require('node:path');

async function quickTest() {
  console.log('🧪 Quick Google Vision API Test\n');

  try {
    const credPath = path.join(process.cwd(), 'config', 'google-vision-key.json');
    const credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));

    console.log('✅ Credentials loaded');
    console.log(`   Project: ${credentials.project_id}\n`);

    const client = new vision.ImageAnnotatorClient({ credentials });
    console.log('✅ Client created\n');

    console.log('🔄 Testing API call with public test image...');
    const testImageUrl = 'gs://cloud-samples-data/vision/label/wakeupcat.jpg';

    const [result] = await client.labelDetection(testImageUrl);
    const labels = result.labelAnnotations || [];

    console.log('\n✅ API CALL SUCCESSFUL!');
    console.log(`   Labels detected: ${labels.length}\n`);

    if (labels.length > 0) {
      console.log('   Top labels:');
      labels.slice(0, 5).forEach((label) => {
        console.log(`     - ${label.description} (${(label.score * 100).toFixed(1)}%)`);
      });
    }

    console.log('\n📋 Testing checkForPeopleAndFaces equivalent...');
    const [faceResult] = await client.annotateImage({
      image: { source: { imageUri: testImageUrl } },
      features: [
        { type: 'FACE_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'LABEL_DETECTION' },
      ],
    });

    const faces = faceResult.faceAnnotations || [];
    const objects = faceResult.localizedObjectAnnotations || [];
    const allLabels = faceResult.labelAnnotations || [];

    console.log(`   Faces detected: ${faces.length}`);
    console.log(`   Objects detected: ${objects.length}`);
    console.log(`   Labels detected: ${allLabels.length}\n`);

    console.log('🎉 ALL TESTS PASSED!\n');
    console.log('Google Vision API Integration Status:');
    console.log('  ✅ Credentials configured correctly');
    console.log('  ✅ Client initialization working');
    console.log('  ✅ Label detection working');
    console.log('  ✅ Face detection working');
    console.log('  ✅ Object localization working\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

quickTest();
