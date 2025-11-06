// SEO Keywords Framework: Seed + Clusters
// Model-specific keywords
const modelKeywords = {
  sora2: ['sora 2 prompts', 'sora 2 video prompts', 'prompt for sora 2', 'sora 2 cameo prompts', 'sora 2 video generation', 'sora 2 prompt examples', 'how to prompt sora 2'],
  nanoBanana: ['nano banana prompts', 'nano banana youtube thumbnail prompt', 'nano banana format', 'nano banana prompt generator', 'nano banana image prompts'],
  midjourney: ['midjourney prompts', 'midjourney prompt generator', 'midjourney prompt extractor', 'best prompts for midjourney', 'midjourney portrait prompts', 'midjourney prompt templates'],
  flux: ['flux prompts', 'flux 1.1 prompts', 'flux ultra prompts', 'flux image generator', 'flux prompt generator', 'photorealistic flux prompts'],
  stableDiffusion: ['stable diffusion prompts', 'stable diffusion prompt generator', 'sd prompts', 'stable diffusion prompt templates'],
};

// Use-case keywords
const useCaseKeywords = {
  youtube: ['youtube thumbnail prompt', 'youtube thumbnail generator', 'how to generate youtube thumbnail with AI', 'AI youtube thumbnail', 'youtube thumbnail template'],
  tiktok: ['tiktok cover prompt template', 'tiktok thumbnail prompt', 'tiktok video thumbnail AI', 'tiktok cover generator'],
  socialMedia: ['social media image prompt', 'instagram post prompt', 'facebook cover prompt', 'twitter header prompt'],
  contentCreation: ['content creator prompts', 'video thumbnail prompts', 'blog image prompts', 'marketing image prompts'],
};

// How-to keywords
const howToKeywords = [
  'how to prompt sora 2',
  'how to generate youtube thumbnail with AI',
  'video to prompt tutorial',
  'image to prompt tutorial',
  'best prompts for midjourney portraits',
  'how to write effective image prompt',
  'how to create AI video prompts',
  'prompt engineering guide',
];

// Comparison/Buyer keywords
const comparisonKeywords = [
  'best prompt generator 2025',
  'image to video platforms compared',
  'best AI image to prompt tool',
  'imageprompt.org alternative',
  'free image to prompt tool',
  'best prompt enhancer',
];

// Core keywords
const coreKeywords = [
  'image to prompt',
  'image to prompt tool',
  'reverse image prompt',
  'AI prompt generator',
  'prompt extractor',
  'image to video',
  'text to video',
  'text to image',
  'prompt enhancer',
];

export const seoPages = {
  home: {
    title: 'Sora 2 Prompts for Short Video — Image→Video Templates | im2Prompt — Free AI Image to Prompt Converter',
    description: 'Convert images to Sora 2 prompts, Nano Banana YouTube thumbnails, and Midjourney templates. Free image to prompt tool with 5 daily credits. Extract prompts for Flux, Stable Diffusion, and create stunning AI visuals instantly.',
    keywords: [
      ...coreKeywords,
      ...modelKeywords.sora2,
      ...modelKeywords.nanoBanana,
      ...modelKeywords.midjourney,
      ...modelKeywords.flux,
      ...useCaseKeywords.youtube,
      ...useCaseKeywords.tiktok,
      ...howToKeywords.slice(0, 3),
      ...comparisonKeywords.slice(0, 2),
      'free AI tools',
      'prompt engineering',
      'AI image analysis',
      'downloadable prompt templates',
    ],
    openGraph: {
      title: 'Sora 2 Prompts for Short Video — Image→Video Templates | im2Prompt',
      description: 'Free image to prompt converter supporting Sora 2, Nano Banana, Midjourney, Flux. Generate YouTube thumbnails, TikTok covers, and AI video prompts. Download templates and start creating with 5 free daily credits!',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'im2Prompt - Sora 2 Prompts & AI Image to Prompt Generator',
        },
      ],
    },
  },
  imageToPrompt: {
    title: 'Image to Prompt Tool — Extract Sora 2, Nano Banana & Midjourney Prompts | im2Prompt',
    description: 'Upload any image and extract perfect AI prompts for Sora 2 video, Nano Banana YouTube thumbnails, Midjourney, Flux, Stable Diffusion. Free online tool with downloadable prompt templates. Convert images to detailed prompts instantly.',
    keywords: [
      'image to prompt',
      'image to prompt tool',
      'reverse prompt engineering',
      ...modelKeywords.sora2,
      ...modelKeywords.nanoBanana,
      ...modelKeywords.midjourney,
      ...modelKeywords.flux,
      'Midjourney prompt extractor',
      'AI image analysis',
      'prompt from image',
      'free image to prompt',
      'sora 2 prompt from image',
      'nano banana prompt extractor',
      'youtube thumbnail prompt generator',
    ],
    openGraph: {
      title: 'Image to Prompt Tool — Extract Sora 2, Nano Banana & Midjourney Prompts',
      description: 'Upload images and get detailed AI prompts for Sora 2, Nano Banana, Midjourney, FLUX, Stable Diffusion. Download prompt templates and generate YouTube thumbnails, TikTok covers instantly.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-image-to-prompt.png',
          width: 1200,
          height: 630,
          alt: 'Image to Prompt Generator — Sora 2, Nano Banana, Midjourney',
        },
      ],
    },
  },
  textToPrompt: {
    title: 'AI Prompt Enhancer — Transform Text to Sora 2 & Nano Banana Prompts | im2Prompt',
    description: 'Transform simple text into enhanced AI prompts for Sora 2 video, Nano Banana YouTube thumbnails, Flux, and Midjourney. AI-powered prompt enhancement with downloadable templates. Generate better results instantly.',
    keywords: [
      'text to prompt',
      'prompt enhancer',
      'AI prompt improvement',
      ...modelKeywords.sora2,
      ...modelKeywords.nanoBanana,
      ...modelKeywords.flux,
      'text to image',
      'prompt engineering',
      'AI image generator',
      'sora 2 prompt enhancer',
      'nano banana prompt generator',
      'how to enhance prompts',
    ],
    openGraph: {
      title: 'AI Prompt Enhancer — Transform Text to Sora 2 & Nano Banana Prompts',
      description: 'Enhance your prompts with AI for Sora 2, Nano Banana, Flux, and Midjourney. Download templates and generate amazing images. Perfect for content creators and artists.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-text-to-prompt.png',
          width: 1200,
          height: 630,
          alt: 'Text to Prompt Enhancer — Sora 2 & Nano Banana',
        },
      ],
    },
  },
  textToImage: {
    title: 'Free AI Text to Image Generator — Flux 1.1, Nano Banana & Stable Diffusion | im2Prompt',
    description: 'Generate high-quality AI images from text with Flux 1.1 Pro, Nano Banana, Stable Diffusion. Professional text to image generator with advanced controls. Free credits available. Create YouTube thumbnails, social media images instantly.',
    keywords: [
      'text to image',
      'AI image generator',
      ...modelKeywords.flux,
      ...modelKeywords.nanoBanana,
      ...modelKeywords.stableDiffusion,
      'Flux image generator',
      'Stable Diffusion online',
      'free AI art generator',
      'text to art',
      'youtube thumbnail generator',
      'social media image generator',
    ],
    openGraph: {
      title: 'Free AI Text to Image Generator — Flux 1.1, Nano Banana & Stable Diffusion',
      description: 'Create stunning AI-generated images from text descriptions. Multiple models including Flux 1.1 Pro, Ultra, Nano Banana. Generate YouTube thumbnails and social media content.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-text-to-image.png',
          width: 1200,
          height: 630,
          alt: 'AI Text to Image Generator — Flux, Nano Banana',
        },
      ],
    },
  },
  textToVideo: {
    title: 'Sora 2 Text to Video Generator — Create Videos from Text Prompts | im2Prompt',
    description: 'Generate AI videos from text descriptions using Sora 2. Advanced text to video AI for creating cinematic content, YouTube videos, TikTok clips. Perfect for content creators and marketers. Free templates available.',
    keywords: [
      'text to video',
      'AI video generator',
      'text to video AI',
      ...modelKeywords.sora2,
      'video generation',
      'AI video creator',
      'automated video creation',
      'sora 2 video generator',
      'how to create video with sora 2',
      'youtube video generator',
      'tiktok video generator',
    ],
    openGraph: {
      title: 'Sora 2 Text to Video Generator — Create Videos from Text Prompts',
      description: 'Transform text descriptions into professional AI-generated videos with Sora 2. Perfect for YouTube, TikTok, and social media content creation.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-text-to-video.png',
          width: 1200,
          height: 630,
          alt: 'Sora 2 Text to Video Generator',
        },
      ],
    },
  },
  imageToVideo: {
    title: 'Sora 2 Image to Video Generator — Animate Images to Video | im2Prompt',
    description: 'Convert static images into dynamic AI videos with Sora 2. Upload an image and transform it into animated video using advanced AI. Perfect for YouTube thumbnails to video, TikTok content. Free image to video generation.',
    keywords: [
      'image to video',
      'AI video from image',
      'animate image',
      ...modelKeywords.sora2,
      'image animation AI',
      'photo to video',
      'AI video maker',
      'sora 2 image to video',
      'youtube thumbnail to video',
      'how to animate image with AI',
    ],
    openGraph: {
      title: 'Sora 2 Image to Video Generator — Animate Images to Video',
      description: 'Bring your images to life with Sora 2 AI-powered video generation. Perfect for YouTube, TikTok, and social media content.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-image-to-video.png',
          width: 1200,
          height: 630,
          alt: 'Sora 2 Image to Video Generator',
        },
      ],
    },
  },
  promptLibrary: {
    title: 'AI Prompt Library — Sora 2, Nano Banana & Midjourney Templates | im2Prompt',
    description: 'Explore curated library of AI prompts for Sora 2 video, Nano Banana YouTube thumbnails, Midjourney, FLUX, Stable Diffusion. Free downloadable prompt templates organized by category. Find inspiration for your next creation.',
    keywords: [
      'prompt library',
      'AI prompts',
      ...modelKeywords.midjourney,
      ...modelKeywords.sora2,
      ...modelKeywords.nanoBanana,
      'prompt templates',
      'AI art prompts',
      'prompt collection',
      'downloadable prompts',
      'sora 2 prompt templates',
      'nano banana prompt library',
      'youtube thumbnail prompt templates',
    ],
    openGraph: {
      title: 'AI Prompt Library — Sora 2, Nano Banana & Midjourney Templates',
      description: 'Browse hundreds of curated AI prompts organized by category. Download templates for Sora 2, Nano Banana, Midjourney, and more.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-prompt-library.png',
          width: 1200,
          height: 630,
          alt: 'Prompt Library — Sora 2, Nano Banana, Midjourney',
        },
      ],
    },
  },
  blog: {
    title: 'AI Art & Prompt Engineering Blog — Sora 2, Nano Banana Tutorials | im2Prompt',
    description: 'Learn about AI art, prompt engineering, and creative tools. Tips, tutorials, and insights for Sora 2 video prompts, Nano Banana YouTube thumbnails, Midjourney, Stable Diffusion, FLUX, and more.',
    keywords: [
      'AI art blog',
      'prompt engineering',
      'AI tutorials',
      ...modelKeywords.sora2.slice(0, 3),
      ...modelKeywords.nanoBanana.slice(0, 2),
      'Midjourney tips',
      'AI news',
      'generative AI',
      'how to prompt sora 2',
      'youtube thumbnail tutorial',
    ],
    openGraph: {
      title: 'AI Art & Prompt Engineering Blog — Sora 2, Nano Banana Tutorials',
      description: 'Tips, tutorials, and insights about AI art and prompt engineering. Learn Sora 2, Nano Banana, Midjourney best practices.',
      type: 'website',
      images: [
        {
          url: 'https://www.im2prompt.com/og-blog.png',
          width: 1200,
          height: 630,
          alt: 'im2Prompt Blog — AI Art & Prompt Engineering',
        },
      ],
    },
  },
} as const;
