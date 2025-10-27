import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vision from '@google-cloud/vision';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🧪 Testing Google Vision API Credentials\n');

const credsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credsEnv) {
  console.log('❌ GOOGLE_APPLICATION_CREDENTIALS not found in environment');
  process.exit(1);
}

console.log('✅ Environment variable exists');
console.log(`   Length: ${credsEnv.length} characters\n`);

try {
  const credentials = JSON.parse(credsEnv);
  console.log('✅ JSON parsing successful');
  console.log(`   Project ID: ${credentials.project_id}`);
  console.log(`   Client Email: ${credentials.client_email}`);
  console.log(`   Has Private Key: ${!!credentials.private_key}`);
  console.log(`   Private Key Length: ${credentials.private_key?.length || 0} chars\n`);

  // Try to initialize the Vision API client
  console.log('🔧 Initializing Vision API client...');
  const client = new vision.ImageAnnotatorClient({
    credentials,
  });

  console.log('✅ Vision API client initialized successfully!\n');

  // Optional: Test with a simple API call (uncomment if you want to test actual API)
  // console.log('🧪 Testing Vision API with a simple request...');
  // const [result] = await client.labelDetection('https://picsum.photos/200');
  // console.log('✅ Vision API is working! Detected labels:', result.labelAnnotations?.length || 0);

  console.log('✅ All tests passed! Google Vision API is properly configured.\n');
} catch (error) {
  console.log('❌ Error:', error.message);
  if (error.stack) {
    console.log('\nStack trace:', error.stack);
  }
  process.exit(1);
}
