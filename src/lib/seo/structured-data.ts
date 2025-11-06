import type { Organization, WebSite, BreadcrumbList, WebPage, SoftwareApplication, FAQPage, HowTo, HowToStep } from 'schema-dts';

export function getOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@id': 'https://www.im2prompt.com/#organization',
    name: 'im2Prompt',
    url: 'https://www.im2prompt.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.im2prompt.com/logo.png',
      width: '512',
      height: '512',
    },
    sameAs: [
      'https://twitter.com/im2prompt',
    ],
    description: 'AI-powered image to prompt extraction and generation tools supporting Sora 2, Nano Banana, Midjourney, Flux. Generate YouTube thumbnails, TikTok covers, and AI video prompts.',
    foundingDate: '2024',
    knowsAbout: [
      'Sora 2 prompts',
      'Nano Banana prompts',
      'Midjourney prompts',
      'Flux prompts',
      'YouTube thumbnail generation',
      'AI video generation',
      'Prompt engineering',
    ],
  };
}

export function getWebsiteSchema(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': 'https://www.im2prompt.com/#website',
    url: 'https://www.im2prompt.com',
    name: 'im2Prompt',
    description: 'Convert images to Sora 2 prompts, Nano Banana YouTube thumbnails, and Midjourney templates. Free image to prompt tool with downloadable templates. Extract prompts for Flux, Stable Diffusion, and create stunning AI visuals.',
    publisher: {
      '@id': 'https://www.im2prompt.com/#organization',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.im2prompt.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    keywords: 'Sora 2 prompts, Nano Banana prompts, image to prompt, YouTube thumbnail prompt, Midjourney prompts, Flux prompts, AI video generation',
  };
}

export function getSoftwareApplicationSchema(): SoftwareApplication {
  return {
    '@type': 'SoftwareApplication',
    name: 'im2Prompt',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: 'AI-powered image to prompt extraction tool supporting Sora 2, Nano Banana, Midjourney, Flux, Stable Diffusion. Generate YouTube thumbnails, TikTok covers, and AI video prompts.',
    featureList: [
      'Image to Prompt conversion',
      'Sora 2 prompt generation',
      'Nano Banana YouTube thumbnail prompts',
      'Midjourney prompt extraction',
      'Flux prompt generation',
      'Text to Image generation',
      'Text to Video generation',
      'Image to Video conversion',
      'Prompt enhancement',
      'Downloadable prompt templates',
    ],
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getWebPageSchema(props: {
  url: string;
  name: string;
  description: string;
  breadcrumb?: BreadcrumbList;
}): WebPage {
  return {
    '@type': 'WebPage',
    '@id': `${props.url}#webpage`,
    url: props.url,
    name: props.name,
    description: props.description,
    isPartOf: {
      '@id': 'https://www.im2prompt.com/#website',
    },
    about: {
      '@id': 'https://www.im2prompt.com/#organization',
    },
    ...(props.breadcrumb && { breadcrumb: props.breadcrumb }),
  };
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQPage {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getHowToSchema(props: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
}): HowTo {
  return {
    '@type': 'HowTo',
    name: props.name,
    description: props.description,
    step: props.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          '@type': 'ImageObject',
          url: step.image,
        },
      }),
    })),
  };
}

export function getDefaultFAQSchema(): FAQPage {
  return {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is an Image Prompt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An Image Prompt is a set of instructions or words given to an AI to create a picture. It tells the AI what kind of image you want, like describing a scene or object. With im2Prompt, you can convert images into detailed prompts for Sora 2, Nano Banana, Midjourney, Flux, and other AI models.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to generate YouTube thumbnail with AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your image to im2Prompt, select Nano Banana format, and generate a prompt optimized for YouTube thumbnails. The tool extracts detailed prompts that work perfectly with AI image generators to create eye-catching YouTube thumbnails.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to prompt Sora 2?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use im2Prompt to convert images into Sora 2 video prompts. Upload an image, select Sora 2 format, and get cinematic video prompts optimized for Sora 2. You can also enhance text descriptions into detailed Sora 2 prompts using our text-to-prompt enhancer.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best prompt generator 2025?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'im2Prompt is a leading prompt generator in 2025, supporting Sora 2, Nano Banana, Midjourney, Flux, and Stable Diffusion. It offers free image-to-prompt conversion, downloadable templates, and specialized formats for YouTube thumbnails and TikTok covers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is im2Prompt free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! im2Prompt offers free access with 5 daily credits for image-to-prompt conversion. All text-to-prompt tools are completely free. Free users also get 2 complimentary credits for image generation. Premium plans are available for additional usage.',
        },
      },
    ],
  };
}

export function getImageToPromptHowToSchema(): HowTo {
  return getHowToSchema({
    name: 'How to Convert Image to Prompt',
    description: 'Learn how to extract AI prompts from images using im2Prompt. Supports Sora 2, Nano Banana, Midjourney, Flux, and Stable Diffusion formats.',
    steps: [
      {
        name: 'Upload Your Image',
        text: 'Upload an image file (PNG, JPG, WebP up to 4MB) or provide an image URL.',
      },
      {
        name: 'Select AI Model Format',
        text: 'Choose your target AI model: Sora 2 for video, Nano Banana for YouTube thumbnails, Midjourney, Flux, or Stable Diffusion.',
      },
      {
        name: 'Choose Prompt Language',
        text: 'Select your preferred language for the generated prompt (English, Chinese, Spanish, French, Japanese).',
      },
      {
        name: 'Generate Prompt',
        text: 'Click "Generate Prompt" to extract detailed AI prompts from your image. Download the prompt template for future use.',
      },
    ],
  });
}

export function generateStructuredData(schemas: unknown[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas,
  });
}

export function getHomePageStructuredData() {
  return [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getSoftwareApplicationSchema(),
    getDefaultFAQSchema(),
    getImageToPromptHowToSchema(),
  ];
}
