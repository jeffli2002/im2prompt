#!/usr/bin/env node

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Parse CLOUDINARY_URL if API key/secret not set directly
let cloudConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!cloudConfig.api_key && process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL);
  cloudConfig = {
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
  };
}

cloudinary.config(cloudConfig);

async function uploadImage(localPath, cloudinaryPath) {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: cloudinaryPath,
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { quality: 'auto:best' },
        { fetch_format: 'auto' }
      ],
    });

    console.log(`✓ Uploaded: ${result.public_id}`);
    console.log(`  URL: ${result.secure_url}`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to upload ${localPath}:`, error.message);
    throw error;
  }
}

async function uploadPromptLibrary() {
  const uploads = [
    // People & Portraits
    {
      local: path.join(__dirname, '../public/prompt-library/people-portraits/nb-runner-001.png'),
      cloudinary: 'prompt-library/people-portraits/runner-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/people-portraits/nb-girl-002.png'),
      cloudinary: 'prompt-library/people-portraits/girl-002'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/people-portraits/nb-businessman-003.png'),
      cloudinary: 'prompt-library/people-portraits/businessman-003'
    },
    
    // Animals & Wildlife
    {
      local: path.join(__dirname, '../public/prompt-library/animals-wildlife/nb-polar-bear-001.png'),
      cloudinary: 'prompt-library/animals-wildlife/polar-bear-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/animals-wildlife/nb-lion-002.png'),
      cloudinary: 'prompt-library/animals-wildlife/lion-002'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/animals-wildlife/nb-flamingo-003.png'),
      cloudinary: 'prompt-library/animals-wildlife/flamingo-003'
    },
    
    // Scenery & Environment
    {
      local: path.join(__dirname, '../public/prompt-library/scenery-environment/nb-castle-001.png'),
      cloudinary: 'prompt-library/scenery-environment/castle-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/scenery-environment/nb-desertcity-002.png'),
      cloudinary: 'prompt-library/scenery-environment/desertcity-002'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/scenery-environment/nb-town-003.png'),
      cloudinary: 'prompt-library/scenery-environment/town-003'
    },
    
    // Objects & Products
    {
      local: path.join(__dirname, '../public/prompt-library/objects-products/nb-camera-001.png'),
      cloudinary: 'prompt-library/objects-products/camera-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/objects-products/nb-phone-002.png'),
      cloudinary: 'prompt-library/objects-products/phone-002'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/objects-products/nb-perfume-003.png'),
      cloudinary: 'prompt-library/objects-products/perfume-003'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/objects-products/nb-coffee-004.png'),
      cloudinary: 'prompt-library/objects-products/coffee-004'
    },
    
    // Science, Education & Technology
    {
      local: path.join(__dirname, '../public/prompt-library/science-edu-tech/nb-spaceship-001.png'),
      cloudinary: 'prompt-library/science-edu-tech/spaceship-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/science-edu-tech/nb-3Dprinter-002.png'),
      cloudinary: 'prompt-library/science-edu-tech/3Dprinter-002'
    },
    
    // Fashion, Lifestyle & Aesthetic Design
    {
      local: path.join(__dirname, '../public/prompt-library/fashion-lifestyle/nb-model-001.png'),
      cloudinary: 'prompt-library/fashion-lifestyle/model-001'
    },
    {
      local: path.join(__dirname, '../public/prompt-library/fashion-lifestyle/nb-coupleparis-002.png'),
      cloudinary: 'prompt-library/fashion-lifestyle/coupleparis-002'
    }
  ];

  console.log('Starting Cloudinary upload...\n');

  for (const upload of uploads) {
    await uploadImage(upload.local, upload.cloudinary);
  }

  console.log('\n✓ All uploads completed!');
}

uploadPromptLibrary().catch(console.error);
