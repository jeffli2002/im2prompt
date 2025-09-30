import type { PaymentConfig } from '@/types';

export const paymentConfig: PaymentConfig = {
  // Payment provider
  provider: 'stripe',
  
  // Base currency
  currency: 'usd',
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2025-06-30.basil',
  },

  // Subscription plans
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out im2Prompt',
      price: 0,
      interval: null,
      credits: {
        monthly: 20,    // 20 extractions
        onSignup: 20,   // Start immediately
      },
      features: [
        '20 prompt extractions/month',
        '10 preview generations',
        '2 HD image renders',
        'Basic prompt variations',
        'Community support',
      ],
      popular: false,
      limits: {
        extractions: 20,
        previews: 10,
        hdRenders: 2,
        batchSize: 1,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For professional creators',
      price: 15,
      yearlyPrice: 150, // $15 * 10 months (2 months free)
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
      },
      credits: {
        monthly: 999999,     // Unlimited extractions
        onSubscribe: 300,    // 300 preview generations
      },
      features: [
        'Unlimited prompt extractions',
        '300 preview generations/month',
        '50 HD image renders/month',
        'Advanced prompt variations',
        'Custom style packs',
        'Batch processing (up to 10)',
        'Priority support',
        'API access',
      ],
      popular: true,
      limits: {
        extractions: -1, // unlimited
        previews: 300,
        hdRenders: 50,
        batchSize: 10,
      },
    },
    {
      id: 'team',
      name: 'Team',
      description: 'For teams and agencies',
      price: 49,
      yearlyPrice: 490, // $49 * 10 months (2 months free)
      interval: 'month',
      stripePriceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY || 'price_team_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY || 'price_team_yearly',
      },
      credits: {
        monthly: 999999,     // Unlimited
        onSubscribe: 1000,   // 1000 preview generations
      },
      features: [
        'Everything in Pro',
        '1000 preview generations/month',
        '200 HD image renders/month',
        'Shared prompt libraries',
        'Team collaboration tools',
        'Brand style packs',
        'Advanced analytics',
        'Dedicated support',
        'SSO authentication',
      ],
      popular: false,
      limits: {
        extractions: -1, // unlimited
        previews: 1000,
        hdRenders: 200,
        batchSize: 50,
        teamMembers: 10,
      },
    },
  ],

  // Trial configuration
  trial: {
    enabled: true,
    days: 14,
    plans: ['pro', 'enterprise'], // Only these plans support trial
  },

  // Invoice configuration
  invoice: {
    footer: 'Thank you for your business! If you have any questions, please contact our support team.',
    logo: '/logo.png',
    supportEmail: 'support@better-saas.com',
  },

  // Billing configuration
  billing: {
    collectTaxId: true,
    allowPromotionCodes: true,
    automaticTax: true,
  },

  // Feature flags
  features: {
    subscriptions: true,
    oneTimePayments: true,
    invoices: true,
    customerPortal: true,
    webhooks: true,
  },
}; 