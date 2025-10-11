import { env } from '@/env';
import type {
  CreatePaymentParams,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  PaymentResult,
  SubscriptionResult,
  PaymentStatus,
} from '@/payment/types';

const getCreemTestMode = () => {
  const testModeEnv = env.NEXT_PUBLIC_CREEM_TEST_MODE;
  return testModeEnv === 'true';
};

const getCreemApiKey = () => {
  return env.CREEM_API_KEY || '';
};

const getCreemWebhookSecret = () => {
  return env.CREEM_WEBHOOK_SECRET || '';
};

export const CREEM_PRODUCTS = {
  pro_monthly: env.CREEM_PRO_PLAN_PRODUCT_KEY_MONTHLY || '',
  proplus_monthly: env.CREEM_PROPLUS_PLAN_PRODUCT_KEY_MONTHLY || '',
  pro_yearly: env.CREEM_PRO_PLAN_PRODUCT_KEY_YEARLY || '',
  proplus_yearly: env.CREEM_PROPLUS_PLAN_PRODUCT_KEY_YEARLY || '',
};

let creemClient: any = null;

const getCreemClient = () => {
  if (!creemClient) {
    const testMode = getCreemTestMode();
    
    try {
      const { Creem } = require('creem');
      creemClient = new Creem({
        serverIdx: testMode ? 1 : 0,
      });
    } catch (error) {
      console.error('[Creem] Failed to initialize Creem SDK:', error);
      throw new Error('Creem SDK not available');
    }
  }
  return creemClient;
};

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  planId: 'pro' | 'proplus';
  interval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
  currentPlan?: 'free' | 'pro' | 'proplus';
}

class CreemPaymentService {
  async createCheckoutSession({
    userId,
    userEmail,
    planId,
    interval,
    successUrl,
    cancelUrl,
    currentPlan = 'free',
  }: CreateCheckoutSessionParams) {
    try {
      const CREEM_API_KEY = getCreemApiKey();
      const testMode = getCreemTestMode();

      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured');
      }

      const productKey = interval === 'year' ? `${planId}_yearly` : `${planId}_monthly`;
      const productId = CREEM_PRODUCTS[productKey as keyof typeof CREEM_PRODUCTS];

      if (!productId) {
        throw new Error(`Product ID not configured for plan: ${planId}`);
      }

      console.log('[Creem] Creating checkout with:', {
        productId,
        planId,
        interval,
        userEmail,
        testMode,
      });

      const checkoutRequest: any = {
        productId: productId,
        requestId: `checkout_${userId}_${Date.now()}`,
        successUrl: successUrl,
        metadata: {
          userId: userId,
          userEmail: userEmail,
          planId: planId,
          currentPlan: currentPlan,
        },
        customer: {
          email: userEmail,
        },
      };

      const checkout = await getCreemClient().createCheckout({
        xApiKey: CREEM_API_KEY,
        createCheckoutRequest: checkoutRequest,
      });

      console.log('[Creem] Checkout created:', {
        id: checkout.id,
        url: checkout.checkoutUrl,
      });

      if (!checkout.checkoutUrl) {
        throw new Error('No checkout URL in response');
      }

      return {
        success: true,
        sessionId: checkout.id,
        url: checkout.checkoutUrl,
      };
    } catch (error: any) {
      console.error('Creem checkout session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create checkout session',
      };
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const CREEM_API_KEY = getCreemApiKey();
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured');
      }

      const result = await getCreemClient().cancelSubscription({
        id: subscriptionId,
        xApiKey: CREEM_API_KEY,
      });

      return {
        success: true,
        subscription: result,
      };
    } catch (error: any) {
      console.error('[Creem] Cancel subscription error:', error);

      if (
        error.message?.includes('Subscription already canceled') ||
        error.response?.data?.message?.includes('Subscription already canceled')
      ) {
        return {
          success: true,
          alreadyCancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to cancel subscription',
      };
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const CREEM_API_KEY = getCreemApiKey();
      if (!CREEM_API_KEY) {
        throw new Error('Creem API key not configured');
      }

      const result = await getCreemClient().retrieveSubscription({
        subscriptionId: subscriptionId,
        xApiKey: CREEM_API_KEY,
      });

      return {
        success: true,
        subscription: result,
      };
    } catch (error: any) {
      console.error('Creem get subscription error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get subscription',
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const CREEM_WEBHOOK_SECRET = getCreemWebhookSecret();
    
    if (!CREEM_WEBHOOK_SECRET) {
      console.error('[SECURITY] Webhook secret not configured - rejecting request');
      return false;
    }

    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', CREEM_WEBHOOK_SECRET);
      const digest = hmac.update(payload).digest('hex');
      const isValid = digest === signature;
      
      if (!isValid) {
        console.error('[SECURITY] Invalid webhook signature detected');
      }
      
      return isValid;
    } catch (error) {
      console.error('[SECURITY] Webhook signature verification error:', error);
      return false;
    }
  }

  async handleWebhookEvent(event: any) {
    const eventType = event.eventType || event.type;
    const eventData = event.object || event.data?.object;

    switch (eventType) {
      case 'checkout.completed':
        return this.handleCheckoutComplete(eventData);

      case 'subscription.created':
        return this.handleSubscriptionCreated(eventData);

      case 'subscription.active':
      case 'subscription.update':
        return this.handleSubscriptionUpdate(eventData);

      case 'subscription.canceled':
        return this.handleSubscriptionDeleted(eventData);

      case 'subscription.paid':
        return this.handlePaymentSuccess(eventData);

      case 'subscription.expired':
        return this.handleSubscriptionExpired(eventData);
        
      case 'subscription.trial_will_end':
        return this.handleSubscriptionTrialWillEnd(eventData);
        
      case 'subscription.trial_ended':
        return this.handleSubscriptionTrialEnded(eventData);
        
      case 'subscription.paused':
        return this.handleSubscriptionPaused(eventData);
        
      case 'refund.created':
        return this.handleRefundCreated(eventData);
        
      case 'dispute.created':
        return this.handleDisputeCreated(eventData);

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        return { success: true };
    }
  }

  private async handleSubscriptionCreated(subscription: any) {
    const {
      id,
      customer,
      metadata,
      status,
      trial_period_days,
      trial_start_date,
      trial_end_date,
      current_period_start_date,
      current_period_end_date,
    } = subscription;

    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId || customer?.external_id;

    if (!id || !customerId) {
      return { success: true };
    }

    const planId = metadata?.planId || this.getPlanFromProduct(subscription.product?.id);

    return {
      type: 'subscription_created',
      subscriptionId: id,
      customerId: customerId,
      userId: userId,
      status: status,
      planId: planId,
      trialPeriodDays: trial_period_days,
      trialStart: trial_start_date ? new Date(trial_start_date) : undefined,
      trialEnd: trial_end_date ? new Date(trial_end_date) : undefined,
      currentPeriodStart: current_period_start_date
        ? new Date(current_period_start_date)
        : undefined,
      currentPeriodEnd: current_period_end_date
        ? new Date(current_period_end_date)
        : undefined,
    };
  }

  private async handleCheckoutComplete(checkout: any) {
    const { customer, subscription, metadata, order } = checkout;

    const userId = metadata?.userId || customer?.external_id;
    const planId = metadata?.planId || this.getPlanFromProduct(order?.product);

    const subscriptionId =
      subscription?.id || subscription?.subscription_id || checkout.subscription_id;

    return {
      type: 'checkout_complete',
      userId: userId,
      customerId: customer?.id,
      subscriptionId: subscriptionId,
      planId: planId,
    };
  }

  private async handleSubscriptionUpdate(subscription: any) {
    const {
      customer,
      status,
      metadata,
      current_period_end_date,
      canceled_at,
      product,
      cancel_at_period_end,
    } = subscription;

    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id);

    return {
      type: 'subscription_update',
      customerId: customerId,
      status: status,
      userId: userId,
      planId: planId,
      currentPeriodEnd: current_period_end_date
        ? new Date(current_period_end_date)
        : undefined,
      cancelAtPeriodEnd: cancel_at_period_end || !!canceled_at,
    };
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const { customerId, metadata } = subscription;

    return {
      type: 'subscription_deleted',
      customerId: customerId,
      userId: metadata?.userId,
    };
  }

  private async handlePaymentSuccess(subscription: any) {
    const { customer, id, metadata } = subscription;

    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;

    return {
      type: 'payment_success',
      customerId: customerId,
      subscriptionId: id,
      userId: userId,
    };
  }

  private async handleSubscriptionExpired(subscription: any) {
    const { customer, metadata, id } = subscription;

    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;

    return {
      type: 'subscription_deleted',
      subscriptionId: id,
      customerId: customerId,
      userId: userId,
    };
  }
  
  private async handleSubscriptionTrialWillEnd(subscription: any) {
    const { customer, metadata, trial_end_date, product } = subscription;
    
    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id);
    
    return {
      type: 'subscription_trial_will_end',
      customerId: customerId,
      userId: userId,
      planId: planId,
      trialEndDate: trial_end_date ? new Date(trial_end_date) : undefined,
    };
  }
  
  private async handleSubscriptionTrialEnded(subscription: any) {
    const { customer, metadata, id, product } = subscription;
    
    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;
    const planId = metadata?.planId || this.getPlanFromProduct(product?.id);
    
    return {
      type: 'subscription_trial_ended',
      customerId: customerId,
      userId: userId,
      subscriptionId: id,
      planId: planId,
    };
  }
  
  private async handleSubscriptionPaused(subscription: any) {
    const { id, customer, metadata } = subscription;
    
    const customerId = typeof customer === 'string' ? customer : customer?.id;
    const userId = metadata?.userId;
    
    return {
      type: 'subscription_paused',
      subscriptionId: id,
      customerId: customerId,
      userId: userId,
    };
  }
  
  private async handleRefundCreated(refund: any) {
    const { customer, subscription, checkout } = refund;
    
    return {
      type: 'refund_created',
      customerId: customer?.id,
      subscriptionId: subscription?.id,
      checkoutId: checkout?.id,
      amount: refund.refund_amount,
    };
  }
  
  private async handleDisputeCreated(dispute: any) {
    const { customer, subscription } = dispute;
    
    return {
      type: 'dispute_created',
      customerId: customer?.id,
      subscriptionId: subscription?.id,
      amount: dispute.amount,
    };
  }

  private getPlanFromProduct(productId: string): string {
    if (!productId) return 'free';

    if (productId.includes('proplus')) {
      return 'proplus';
    }
    if (productId.includes('pro')) {
      return 'pro';
    }

    return 'free';
  }

  isTestMode(): boolean {
    return getCreemTestMode();
  }
}

export const creemService = new CreemPaymentService();
export { getCreemTestMode, getCreemApiKey };
