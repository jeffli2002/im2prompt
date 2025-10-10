#!/usr/bin/env node

/**
 * Helper script to track new prompt library images
 * Usage: node scripts/add-prompt-image.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METADATA_PATH = path.join(__dirname, '../public/prompt-library/image-metadata.json');

function loadMetadata() {
  try {
    const data = fs.readFileSync(METADATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      'people-portraits': [],
      'animals-wildlife': [],
      'scenery-environment': [],
      'objects-products': [],
      'science-edu-tech': [],
      'fashion-lifestyle': []
    };
  }
}

function saveMetadata(metadata) {
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
}

function addImage(imageInfo) {
  const metadata = loadMetadata();
  
  if (!metadata[imageInfo.category]) {
    console.error(`Error: Invalid category "${imageInfo.category}"`);
    console.log('Valid categories: people-portraits, animals-wildlife, scenery-environment, objects-products, science-edu-tech, fashion-lifestyle');
    return;
  }
  
  const newImage = {
    filename: imageInfo.filename,
    model: imageInfo.model || 'nano-banana',
    generatedDate: new Date().toISOString().split('T')[0],
    prompt: imageInfo.prompt || '',
    settings: imageInfo.settings || {},
  };
  
  metadata[imageInfo.category].push(newImage);
  saveMetadata(metadata);
  
  console.log(`✓ Added image to ${imageInfo.category}:`);
  console.log(JSON.stringify(newImage, null, 2));
}

function getModelFromFilename(filename) {
  if (filename.includes('nano-banana') || filename.startsWith('nb-')) {
    return 'nano-banana';
  } else if (filename.includes('flux-pro') || filename.startsWith('fp-')) {
    return 'flux-1.1-pro';
  } else if (filename.includes('flux-ultra') || filename.startsWith('fu-')) {
    return 'flux-1.1-ultra';
  } else if (filename.includes('stable-diffusion') || filename.startsWith('sd-')) {
    return 'stable-diffusion';
  }
  return 'nano-banana'; // Default
}

// Example usage
if (process.argv.length > 2) {
  const [category, filename, prompt] = process.argv.slice(2);
  
  if (!category || !filename) {
    console.log('Usage: node add-prompt-image.mjs <category> <filename> [prompt]');
    console.log('Example: node add-prompt-image.mjs people-portraits portrait-001.jpg "Professional portrait..."');
    process.exit(1);
  }
  
  addImage({
    filename,
    category,
    model: getModelFromFilename(filename),
    prompt: prompt || '',
  });
} else {
  console.log('Usage: node add-prompt-image.mjs <category> <filename> [prompt]');
  console.log('\nExamples:');
  console.log('  node scripts/add-prompt-image.mjs people-portraits nb-portrait-001.jpg "Professional portrait"');
  console.log('  node scripts/add-prompt-image.mjs animals-wildlife animal-001-nano-banana.jpg "Tiger in jungle"');
}

export { addImage, getModelFromFilename, loadMetadata };
