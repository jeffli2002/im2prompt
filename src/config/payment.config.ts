import type { PaymentConfig } from '@/types';
// Note: Credit costs (5 credits/image, 15 credits/video) are defined in credits.config.ts

export const paymentConfig: PaymentConfig = {
  provider: 'stripe',
  
  currency: 'usd',
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2025-06-30.basil',
  },

  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out im2Prompt',
      price: 0,
      interval: null,
      credits: {
        monthly: 125,
        onSignup: 0,
      },
      features: [
        '5 Image-to-Text per day',
        'Unlimited Text-to-Prompt',
        '20 credits/day (125/month) - 1 image = 5 credits, 1 video = 15 credits',
        'No watermark for images',
        'Personal use',
      ],
      popular: false,
      limits: {
        extractions: 5,
        images: 10,
        videos: 5,
        dailyImages: 1,
        dailyVideos: 1,
        batchSize: 1,
        quality: 'standard',
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Great for individual creators',
      price: 14.9,
      yearlyPrice: 143.04,
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
      },
      credits: {
        monthly: 500,
        onSubscribe: 0,
      },
      features: [
        '300 Image-to-Text per month',
        '500 credits/month (100 images or 33 videos)',
        'No watermark for images',
        'No Ads',
        'Commercial license',
      ],
      popular: true,
      limits: {
        extractions: 300,
        dailyImages: -1,
        dailyVideos: -1,
        batchSize: 5,
        quality: 'hd',
      },
    },
    {
      id: 'proplus',
      name: 'Pro+',
      description: 'For professional creators and businesses',
      price: 24.9,
      yearlyPrice: 239.04,
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROPLUS_MONTHLY || 'price_proplus_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROPLUS_YEARLY || 'price_proplus_yearly',
      },
      credits: {
        monthly: 900,
        onSubscribe: 0,
      },
      features: [
        '600 Image-to-Text per month',
        '900 credits/month (180 images or 60 videos)',
        'No watermark for images',
        'No Ads',
        'Commercial License',
      ],
      popular: false,
      limits: {
        extractions: 600,
        dailyImages: -1,
        dailyVideos: -1,
        batchSize: 10,
        quality: 'fullhd',
        apiCalls: 10000,
      },
    },
  ],

  trial: {
    enabled: true,
    days: 14,
    plans: ['pro', 'proplus'],
  },

  invoice: {
    footer: 'Thank you for your business! If you have any questions, please contact our support team.',
    logo: '/logo.png',
    supportEmail: 'support@im2prompt.com',
  },

  billing: {
    collectTaxId: true,
    allowPromotionCodes: true,
    automaticTax: true,
  },

  features: {
    subscriptions: true,
    oneTimePayments: true,
    invoices: true,
    customerPortal: true,
    webhooks: true,
  },
};
