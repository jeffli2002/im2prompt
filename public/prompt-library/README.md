# Prompt Library Local Image Storage

This directory contains AI-generated images for the prompt library, organized by category.

## Folder Structure

```
/public/prompt-library/
  /people-portraits/          - Professional portraits, character designs
  /animals-wildlife/          - Wildlife photography, pet portraits
  /scenery-environment/       - Landscapes, cityscapes, environmental scenes
  /objects-products/          - Product photography, still life
  /science-edu-tech/          - Scientific visualizations, tech concepts
  /fashion-lifestyle/         - Fashion photography, lifestyle scenes
```

## Usage

### Store Images Locally
Place your AI-generated images in the appropriate category folder:

```bash
# Example
/public/prompt-library/people-portraits/portrait-001.jpg
/public/prompt-library/animals-wildlife/animal-001.jpg
```

### Naming Convention
- Use lowercase with hyphens: `portrait-001.jpg`
- Sequential numbering: `001`, `002`, `003`, etc.
- Supported formats: `.jpg`, `.png`, `.webp`

### Upload to Cloudinary
Once images are ready, upload them to Cloudinary using the same folder structure:

1. **Manual Upload:**
   - Go to Cloudinary Dashboard → Media Library
   - Create folder: `prompt-library/{category}/`
   - Upload from this local folder

2. **Using Upload Script:**
   ```typescript
   import { uploadPromptImage } from '@/lib/prompt-library/cloudinary-upload-helper';
   
   await uploadPromptImage(
     '/public/prompt-library/people-portraits/portrait-001.jpg',
     'people-portraits',
     'portrait-001.jpg'
   );
   ```

## Image Requirements

- **Format:** JPG, PNG, or WebP
- **Resolution:** Minimum 1920x1080px
- **File Size:** Under 5MB recommended
- **Quality:** High quality, AI-generated images

## Next Steps

1. Generate AI images using your preferred model
2. Save images to appropriate category folder
3. Upload to Cloudinary with matching folder structure
4. Add prompt details to `src/config/prompt-library.config.ts`

See `PROMPT_LIBRARY_GUIDE.md` in the project root for complete documentation.
