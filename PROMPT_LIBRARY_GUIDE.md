# Prompt Library Management Guide

## Cloudinary Folder Structure

All prompt library images should be organized in Cloudinary with this structure:

```
/prompt-library/
  /people-portraits/
    portrait-001.jpg
    portrait-002.jpg
    portrait-003.jpg
  /animals-wildlife/
    animal-001.jpg
    animal-002.jpg
  /scenery-environment/
    scenery-001.jpg
    scenery-002.jpg
  /objects-products/
    product-001.jpg
    product-002.jpg
  /science-edu-tech/
    science-001.jpg
    science-002.jpg
  /fashion-lifestyle/
    fashion-001.jpg
    fashion-002.jpg
```

## Adding New Prompts

### Step 1: Upload Image to Cloudinary

1. **Manual Upload via Cloudinary Dashboard:**
   - Go to Cloudinary Console → Media Library
   - Create folder structure: `prompt-library/{category}/`
   - Upload your AI-generated image
   - Note the public ID (e.g., `prompt-library/people-portraits/portrait-001`)

2. **Programmatic Upload (Recommended):**
   ```typescript
   import { uploadPromptImage } from '@/lib/prompt-library/cloudinary-upload-helper';

   const result = await uploadPromptImage(
     '/path/to/image.jpg',
     'people-portraits',
     'portrait-003.jpg'
   );
   console.log('Public ID:', result.publicId);
   ```

### Step 2: Add Prompt to Configuration

Edit `src/config/prompt-library.config.ts`:

```typescript
{
  id: 'portrait-003',
  category: PromptCategory.PEOPLE_PORTRAITS,
  title: 'Your Prompt Title',
  prompt: 'Full detailed prompt text that was used to generate the image...',
  cloudinaryPublicId: 'prompt-library/people-portraits/portrait-003',
  imageUrl: '', // Leave empty - auto-generated from cloudinaryPublicId
  tags: ['tag1', 'tag2', 'tag3'],
  model: 'flux', // Options: 'flux' | 'stable-diffusion' | 'dall-e' | 'sora'
  featured: true, // Set to true for homepage display
  order: 3, // Display order within category
  metadata: {
    style: 'photorealistic',
    aspectRatio: '3:4',
    quality: 'high',
  },
}
```

## Naming Conventions

### File Naming
- Use lowercase with hyphens: `portrait-001.jpg`
- Sequential numbering within each category: `001`, `002`, etc.
- Supported formats: `.jpg`, `.png`, `.webp`

### ID Naming
- Format: `{category-prefix}-{number}`
- Examples: `portrait-001`, `animal-003`, `scenery-005`

### Category Slugs
- `people-portraits`
- `animals-wildlife`
- `scenery-environment`
- `objects-products`
- `science-edu-tech`
- `fashion-lifestyle`

## Image Requirements

### Technical Specs
- **Format:** JPG, PNG, or WebP
- **Resolution:** Minimum 1920x1080px
- **Aspect Ratio:** Varies by category (specified in metadata)
- **File Size:** Under 5MB recommended
- **Quality:** High quality, AI-generated images

### Recommended Aspect Ratios
- **Portraits:** 3:4 or 2:3
- **Landscapes:** 16:9 or 21:9
- **Products:** 1:1
- **Editorial:** 2:3 or 4:5

## Cloudinary Transformations

Images are automatically optimized using these transformations:

```typescript
// Thumbnail: 400x300, good quality
// Card: 800x600, best quality
// Full: 1920x1440, best quality

getPromptImageUrl(cloudinaryPublicId, 'card')
```

## Bulk Upload Script

To upload multiple images at once:

```typescript
import { uploadBulkImages } from '@/lib/prompt-library/cloudinary-upload-helper';

const images = [
  {
    path: './images/portrait-003.jpg',
    category: 'people-portraits',
    fileName: 'portrait-003.jpg'
  },
  {
    path: './images/animal-002.jpg',
    category: 'animals-wildlife',
    fileName: 'animal-002.jpg'
  },
];

const results = await uploadBulkImages(images);
```

## Environment Variables Required

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Helper Functions

### Get Prompts by Category
```typescript
import { getPromptsByCategory } from '@/lib/prompt-library';

const portraits = getPromptsByCategory(PromptCategory.PEOPLE_PORTRAITS);
```

### Get Featured Prompts
```typescript
import { getFeaturedPrompts } from '@/lib/prompt-library';

const featured = getFeaturedPrompts(6); // Get 6 featured prompts
```

### Filter Prompts
```typescript
import { getAllPrompts } from '@/lib/prompt-library';

const filtered = getAllPrompts({
  category: PromptCategory.ANIMALS_WILDLIFE,
  model: 'flux',
  tags: ['wildlife', 'nature'],
  featured: true,
});
```

## Categories Overview

### 1. People & Portraits
- Professional headshots
- Character designs
- Portrait photography
- Figure art

### 2. Animals & Wildlife
- Wildlife photography
- Pet portraits
- Creature designs
- Nature scenes

### 3. Scenery & Environment
- Landscapes
- Cityscapes
- Environmental art
- Architectural photography

### 4. Objects & Products
- Product photography
- Still life
- Commercial shots
- E-commerce images

### 5. Science, Education & Technology
- Scientific visualizations
- Educational diagrams
- Tech concepts
- Data visualization

### 6. Fashion, Lifestyle & Aesthetic Design
- Fashion photography
- Lifestyle scenes
- Editorial shots
- Aesthetic designs

## Best Practices

1. **Prompt Quality:** Use detailed, specific prompts that others can learn from
2. **Image Quality:** Only upload high-quality, well-composed images
3. **Tagging:** Add 3-5 relevant tags for searchability
4. **Featured Status:** Reserve for exceptional examples
5. **Order:** Organize prompts by quality/relevance within each category
6. **Model Attribution:** Always specify which AI model was used

## Maintenance

### Regular Tasks
- Review and update featured prompts monthly
- Add new prompts based on user feedback
- Remove outdated or low-quality examples
- Update tags for better discoverability
- Monitor Cloudinary storage usage

### Quality Control
- Ensure all images load correctly
- Check prompt accuracy
- Verify category assignments
- Test responsive image loading
- Validate metadata completeness
