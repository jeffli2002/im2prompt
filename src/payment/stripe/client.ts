import { Stripe } from 'stripe';
import { env } from '@/env';
import { paymentConfig } from '../../config/payment.config';

// Stripe configuration
export const stripeConfig = {
  secretKey: paymentConfig.stripe.secretKey || '',
  webhookSecret: paymentConfig.stripe.webhookSecret || '',
  apiVersion: paymentConfig.stripe.apiVersion as '2025-08-27.basil',
};

// Server-side Stripe instance - only create if secret key is provided
export const stripe = stripeConfig.secretKey 
  ? new Stripe(stripeConfig.secretKey, {
      apiVersion: stripeConfig.apiVersion,
      typescript: true,
    })
  : null as any; 
