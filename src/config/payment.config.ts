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

  creem: {
    apiKey: process.env.CREEM_API_KEY || '',
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
    proProductKey: process.env.CREEM_PRO_PLAN_PRODUCT_KEY || '',
    proplusProductKey: process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY || '',
  },

  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out im2Prompt',
      price: 0,
      interval: null,
      credits: {
        monthly: 0,
        onSignup: 30,
      },
      features: [
        '3 Image-to-Prompt per day (10/month)',
        'Unlimited Text-to-Prompt',
        '1 image/day (3/month)',
        '1 video/day (3/month)',
        '30 credits on signup (one-time)',
        'No watermark',
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
      creemPriceIds: {
        monthly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_MONTHLY || '',
        yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PRO_YEARLY || '',
      },
      credits: {
        monthly: 500,
        onSubscribe: 0,
      },
      features: [
        '300 Image-to-Text per month',
        '500 credits/month for generation',
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
      creemPriceIds: {
        monthly: process.env.NEXT_PUBLIC_CREEM_PRICE_PROPLUS_MONTHLY || '',
        yearly: process.env.NEXT_PUBLIC_CREEM_PRICE_PROPLUS_YEARLY || '',
      },
      credits: {
        monthly: 900,
        onSubscribe: 0,
      },
      features: [
        '600 Image-to-Text per month',
        '900 credits/month for generation',
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
    logo: '/images/logo3.png',
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
