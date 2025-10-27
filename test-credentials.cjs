const fs = require('node:fs');
const path = require('node:path');

console.log('🔍 Checking Google Vision Credentials\n');

try {
  const credPath = path.join(process.cwd(), 'config', 'google-vision-key.json');
  console.log('Credentials path:', credPath);
  console.log('File exists:', fs.existsSync(credPath));

  if (fs.existsSync(credPath)) {
    const content = fs.readFileSync(credPath, 'utf-8');
    const creds = JSON.parse(content);

    console.log('\n✅ Credentials file is valid JSON');
    console.log('✅ Project ID:', creds.project_id);
    console.log('✅ Client Email:', creds.client_email);
    console.log('✅ Private Key exists:', !!creds.private_key);
    console.log('✅ Type:', creds.type);

    console.log('\n🔄 Testing @google-cloud/vision import...');
    const vision = require('@google-cloud/vision');
    console.log('✅ @google-cloud/vision imported successfully');

    console.log('\n🔄 Creating client...');
    const client = new vision.ImageAnnotatorClient({
      credentials: creds,
    });
    console.log('✅ Client created');

    console.log('\n🎉 All basic checks passed!\n');
  } else {
    console.error('❌ Credentials file not found');
  }
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\nStack:', error.stack);
}
