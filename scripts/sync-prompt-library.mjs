#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  console.error('❌ CLOUDINARY_URL not found in .env.local');
  process.exit(1);
}

const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@([^/]+)/);
if (!urlMatch) {
  console.error('❌ Invalid CLOUDINARY_URL format');
  process.exit(1);
}

const [, api_key, api_secret, cloud_name] = urlMatch;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

console.log(`✓ Cloudinary configured: ${cloud_name}\n`);

async function uploadPromptImage(imagePath, category, fileName) {
  const folderPath = `prompt-library/${category}`;
  
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: folderPath,
    public_id: fileName.replace(/\.[^/.]+$/, ''),
    resource_type: 'image',
    overwrite: false,
    transformation: [
      { quality: 'auto:best' },
      { fetch_format: 'auto' }
    ],
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

const PROMPT_LIBRARY_DIR = path.join(__dirname, '../public/prompt-library');
const METADATA_PATH = path.join(PROMPT_LIBRARY_DIR, 'image-metadata.json');
const CONFIG_PATH = path.join(__dirname, '../src/config/prompt-library.config.ts');

const CATEGORIES = [
  'people-portraits',
  'animals-wildlife',
  'scenery-environment',
  'objects-products',
  'science-edu-tech',
  'fashion-lifestyle'
];

function readPromptFile(category) {
  const promptFile = path.join(PROMPT_LIBRARY_DIR, category, 'prompt.txt');
  if (!fs.existsSync(promptFile)) return [];
  
  const content = fs.readFileSync(promptFile, 'utf8');
  return content.split('\n').filter(line => line.trim()).map(line => line.trim());
}

function getImagesInCategory(category) {
  const categoryPath = path.join(PROMPT_LIBRARY_DIR, category);
  if (!fs.existsSync(categoryPath)) return [];
  
  return fs.readdirSync(categoryPath)
    .filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file))
    .sort();
}

function extractIdFromFilename(filename) {
  const match = filename.match(/nb-(.+?)-(\d+)/);
  if (match) return `${match[1]}-${match[2]}`;
  return filename.replace(/\.[^/.]+$/, '');
}

function generateTitle(filename) {
  const id = extractIdFromFilename(filename);
  return id.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateTags(prompt, filename) {
  const commonWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'by', 'for', 'of', 'to', 'and', 'or']);
  const words = prompt.toLowerCase().split(/[,\s]+/)
    .filter(w => w.length > 3 && !commonWords.has(w))
    .slice(0, 5);
  
  return [...new Set(words)];
}

async function syncPromptLibrary() {
  console.log('🔍 Analyzing prompt library...\n');
  
  const newEntries = [];
  const uploadTasks = [];
  
  for (const category of CATEGORIES) {
    console.log(`📁 Category: ${category}`);
    const images = getImagesInCategory(category);
    const prompts = readPromptFile(category);
    
    if (images.length !== prompts.length) {
      console.warn(`  ⚠️  Mismatch: ${images.length} images, ${prompts.length} prompts`);
    }
    
    images.forEach((imageFile, index) => {
      const prompt = prompts[index] || '';
      const id = extractIdFromFilename(imageFile);
      const title = generateTitle(imageFile);
      const tags = generateTags(prompt, imageFile);
      const cloudinaryPublicId = `prompt-library/${category}/${imageFile.replace(/\.[^/.]+$/, '')}`;
      
      const entry = {
        id,
        category,
        title,
        prompt,
        cloudinaryPublicId,
        imageUrl: '',
        tags,
        model: 'nano-banana',
        featured: index === 0,
        order: index + 1,
        metadata: {
          style: extractStyle(prompt),
          aspectRatio: '1:1',
          quality: 'high',
        },
      };
      
      newEntries.push(entry);
      
      uploadTasks.push({
        path: path.join(PROMPT_LIBRARY_DIR, category, imageFile),
        category,
        fileName: imageFile,
      });
      
      console.log(`  ✓ ${imageFile} → ${id}`);
    });
    
    console.log();
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Total entries: ${newEntries.length}`);
  console.log(`  Upload tasks: ${uploadTasks.length}\n`);
  
  console.log('📤 Starting Cloudinary uploads...\n');
  
  for (const task of uploadTasks) {
    try {
      const result = await uploadPromptImage(task.path, task.category, task.fileName);
      console.log(`  ✓ Uploaded: ${result.publicId}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${task.fileName}`, error.message);
    }
  }
  
  updateMetadataFile(newEntries);
  generateConfigCode(newEntries);
  
  console.log('\n✅ Sync complete!');
}

function extractStyle(prompt) {
  const stylePatterns = [
    /(\w+\s+)?editorial/i,
    /(\w+\s+)?photography/i,
    /cinematic/i,
    /minimalist/i,
    /(\w+\s+)?style/i,
  ];
  
  for (const pattern of stylePatterns) {
    const match = prompt.match(pattern);
    if (match) return match[0].toLowerCase();
  }
  
  return 'realistic';
}

function updateMetadataFile(entries) {
  const metadata = {};
  
  CATEGORIES.forEach(cat => {
    metadata[cat] = entries.filter(e => e.category === cat).map(e => ({
      filename: `${e.id.replace(/^(\w+)-(\d+)$/, 'nb-$1-$2')}.png`,
      model: e.model,
      generatedDate: new Date().toISOString().split('T')[0],
      prompt: e.prompt,
      settings: e.metadata,
    }));
  });
  
  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
  console.log(`\n✓ Updated: ${METADATA_PATH}`);
}

function generateConfigCode(entries) {
  const configEntries = entries.map(e => {
    return `  {
    id: '${e.id}',
    category: PromptCategory.${categoryToEnum(e.category)},
    title: '${e.title}',
    prompt: '${e.prompt}',
    cloudinaryPublicId: '${e.cloudinaryPublicId}',
    imageUrl: '',
    tags: ${JSON.stringify(e.tags)},
    model: '${e.model}',
    featured: ${e.featured},
    order: ${e.order},
    metadata: {
      style: '${e.metadata.style}',
      aspectRatio: '${e.metadata.aspectRatio}',
      quality: '${e.metadata.quality}',
    },
  }`;
  }).join(',\n');
  
  console.log('\n📝 Generated config entries (copy to prompt-library.config.ts):');
  console.log('\nexport const PROMPT_EXAMPLES: PromptExample[] = [');
  console.log(configEntries);
  console.log('];');
}

function categoryToEnum(category) {
  return category.toUpperCase().replace(/-/g, '_');
}

syncPromptLibrary().catch(console.error);
