import fs from 'node:fs';
import path from 'node:path';
import vision from '@google-cloud/vision';

async function testVisionClient() {
  console.log('🧪 Testing Google Vision Client Initialization\n');

  try {
    const credPath = path.join(process.cwd(), 'config', 'google-vision-key.json');
    const credentialsContent = fs.readFileSync(credPath, 'utf-8');
    const credentials = JSON.parse(credentialsContent);

    console.log('✅ Credentials loaded');
    console.log(`   Project: ${credentials.project_id}`);
    console.log(`   Email: ${credentials.client_email}\n`);

    console.log('🔄 Creating Vision API client...');
    const client = new vision.ImageAnnotatorClient({
      credentials: credentials,
    });

    console.log('✅ Client created successfully\n');

    console.log('🔄 Testing with a simple API call (label detection)...');

    const testImageUrl = 'gs://cloud-samples-data/vision/label/wakeupcat.jpg';
    const [result] = await client.labelDetection(testImageUrl);

    const labels = result.labelAnnotations || [];

    console.log('\n✅ API call successful!');
    console.log(`   Labels detected: ${labels.length}\n`);

    if (labels.length > 0) {
      console.log('   Top 5 labels:');
      labels.slice(0, 5).forEach((label) => {
        console.log(`     - ${label.description} (${((label.score || 0) * 100).toFixed(1)}%)`);
      });
    }

    console.log('\n🎉 Google Vision API is working correctly!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

testVisionClient();
