import { env } from '@/env';
import { useState } from 'react';

interface CreateCheckoutParams {
  planId: 'pro' | 'proplus';
  interval?: 'month' | 'year';
}

export function useCreemPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async ({ planId, interval = 'month' }: CreateCheckoutParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = env.NEXT_PUBLIC_APP_URL;
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          interval,
          successUrl: `${baseUrl}/settings/billing?success=true&planId=${planId}&interval=${interval}`,
          cancelUrl: `${baseUrl}/settings/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create checkout session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/get-subscription', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get subscription');
      }

      return data.subscription;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get subscription';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    getSubscription,
    isLoading,
    error,
  };
}
