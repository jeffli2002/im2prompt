import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetSessionFromRequest = jest.fn();
const mockPaymentRepository = {
  findActiveSubscriptionByUserId: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  createEvent: jest.fn(),
};

jest.mock('@/lib/auth/auth-utils', () => ({
  getSessionFromRequest: mockGetSessionFromRequest,
}));

jest.mock('@/server/db/repositories/payment-repository', () => ({
  paymentRepository: mockPaymentRepository,
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init?.headers,
        },
      });
    },
  },
}));

describe('Creem Sync-Checkout Upgrade Logic Integration Tests', () => {
  const mockUserId = 'user_123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should schedule upgrade for Pro → Pro+ at period end', async () => {
    const existingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'pro',
      interval: 'month',
      status: 'active',
      periodEnd: new Date('2025-05-31'),
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      existingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutId: 'checkout_456',
        planId: 'proplus',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('upgraded');
    expect(data.message).toContain('end of current period');

    expect(mockPaymentRepository.update).toHaveBeenCalledWith(
      existingSubscription.id,
      expect.objectContaining({
        priceId: 'proplus',
        interval: 'month',
      })
    );

    expect(mockPaymentRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: existingSubscription.id,
        eventType: 'upgraded',
      })
    );

    expect(mockPaymentRepository.create).not.toHaveBeenCalled();
  });

  it('should schedule upgrade for monthly → yearly at period end', async () => {
    const existingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'pro',
      interval: 'month',
      status: 'active',
      periodEnd: new Date('2025-05-31'),
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      existingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_456',
        planId: 'pro',
        isYearly: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('upgraded');
    
    expect(mockPaymentRepository.update).toHaveBeenCalledWith(
      existingSubscription.id,
      expect.objectContaining({
        priceId: 'pro',
        interval: 'year',
      })
    );
  });

  it('should cancel and create new subscription for downgrade Pro+ → Pro', async () => {
    const existingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'proplus',
      interval: 'month',
      status: 'active',
      periodEnd: new Date('2025-05-31'),
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      existingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_789',
        planId: 'pro',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);

    expect(mockPaymentRepository.update).toHaveBeenCalledWith(
      existingSubscription.id,
      expect.objectContaining({
        status: 'canceled',
        cancelAtPeriodEnd: false,
      })
    );

    expect(mockPaymentRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: existingSubscription.id,
        eventType: 'canceled',
      })
    );

    expect(mockPaymentRepository.create).toHaveBeenCalled();
  });

  it('should cancel and create new subscription for yearly → monthly downgrade', async () => {
    const existingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'proplus',
      interval: 'year',
      status: 'active',
      periodEnd: new Date('2026-01-31'),
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      existingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_999',
        planId: 'proplus',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);

    expect(mockPaymentRepository.update).toHaveBeenCalledWith(
      existingSubscription.id,
      expect.objectContaining({
        status: 'canceled',
      })
    );

    expect(mockPaymentRepository.create).toHaveBeenCalled();
  });

  it('should detect duplicate requests within 30 seconds', async () => {
    const recentSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'pro',
      interval: 'month',
      status: 'active',
      createdAt: new Date(Date.now() - 5000),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      recentSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_456',
        planId: 'pro',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('duplicate request');
    
    expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    expect(mockPaymentRepository.create).not.toHaveBeenCalled();
  });

  it('should reject duplicate plan subscription', async () => {
    const existingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'pro',
      interval: 'month',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      existingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_456',
        planId: 'pro',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('already have an active');
  });

  it('should upgrade if existing subscription is set to cancel', async () => {
    const cancelingSubscription = {
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: 'sub_123',
      priceId: 'pro',
      interval: 'month',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      cancelAtPeriodEnd: true,
    };

    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(
      cancelingSubscription
    );

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_456',
        planId: 'proplus',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);

    expect(mockPaymentRepository.update).toHaveBeenCalledWith(
      cancelingSubscription.id,
      expect.objectContaining({
        status: 'canceled',
      })
    );

    expect(mockPaymentRepository.create).toHaveBeenCalled();
  });

  it('should create new subscription if user has no active subscription', async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findActiveSubscriptionByUserId.mockResolvedValue(null);

    const { POST } = await import('@/app/api/creem/sync-checkout/route');

    const request = new Request('http://localhost/api/creem/sync-checkout', {
      method: 'POST',
      body: JSON.stringify({
        checkoutId: 'checkout_new',
        planId: 'pro',
        isYearly: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockPaymentRepository.create).toHaveBeenCalled();
    expect(mockPaymentRepository.update).not.toHaveBeenCalled();
  });
});
