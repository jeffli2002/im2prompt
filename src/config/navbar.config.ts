import type { NavbarConfig } from '@/types';

export const navbarConfig: NavbarConfig = {
  // Logo configuration
  logo: {
    url: '/',
    src: '/logo-icon.svg',
    alt: 'logo.alt', // i18n key (navbar. prefix will be added by useTranslations)
    title: 'logo.title', // i18n key
  },

  // Authentication configuration
  auth: {
    login: {
      text: 'auth.login', // i18n key
      url: '/login'
    },
    signup: {
      text: 'auth.signup', // i18n key
      url: '/signup'
    },
  },

  // Menu configuration
  menu: {
    items: [
      {
        title: 'menu.tools', // i18n key
        items: [
          {
            title: 'menu.imageToPrompt',
            url: '/image-to-prompt',
            description: 'menu.imageToPromptDescription',
          },
          {
            title: 'menu.textToPrompt',
            url: '/text-to-prompt',
            description: 'menu.textToPromptDescription',
          },
          {
            title: 'menu.textToImage',
            url: '/text-to-image',
            description: 'menu.textToImageDescription',
          },
          {
            title: 'menu.imageToImage',
            url: '/text-to-image?mode=image-to-image',
            description: 'menu.imageToImageDescription',
          },
          {
            title: 'menu.textToVideo',
            url: '/text-to-video',
            description: 'menu.textToVideoDescription',
            highlight: true,
            disabled: false,
          },
          {
            title: 'menu.imageToVideo',
            url: '/image-to-video',
            description: 'menu.imageToVideoDescription',
            highlight: true,
            disabled: false,
          },
        ],
      },
      {
        title: 'menu.promptLibrary', // i18n key
        url: '/prompt-library' // Will be prefixed with locale in hook
      },
      {
        title: 'menu.blog', // i18n key
        url: '/blog' // Will be prefixed with locale in hook
      },
      {
        title: 'menu.pricing', // i18n key
        url: '#pricing',
        onClick: 'handlePricingClick', // Special handler
      },
    ],
  },
};
