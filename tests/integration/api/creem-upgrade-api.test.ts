import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockAuth = {
  api: {
    getSession: jest.fn(),
  },
};

const mockHeaders = jest.fn();

const mockCreemService = {
  upgradeSubscription: jest.fn(),
};

const mockPaymentRepository = {
  findBySubscriptionId: jest.fn(),
  update: jest.fn(),
  createEvent: jest.fn(),
};

jest.mock('@/lib/auth/auth', () => ({
  auth: mockAuth,
}));

jest.mock('next/headers', () => ({
  headers: mockHeaders,
}));

jest.mock('@/lib/creem/creem-service', () => ({
  creemService: mockCreemService,
}));

jest.mock('@/payment/creem/client', () => ({
  isCreemConfigured: true,
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

describe('Creem Upgrade API Integration Tests', () => {
  const mockUserId = 'user_123';
  const mockSubscriptionId = 'sub_123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockHeaders.mockResolvedValue(new Headers());
  });

  it('should upgrade subscription via POST /api/creem/subscription/{id}/upgrade', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    mockCreemService.upgradeSubscription.mockResolvedValue({
      success: true,
      subscription: {
        id: mockSubscriptionId,
        status: 'active',
        product: { id: 'prod_proplus_monthly' },
      },
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'month',
        useProration: false,
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('end of current period');
  });

  it('should upgrade with proration when requested', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    mockCreemService.upgradeSubscription.mockResolvedValue({
      success: true,
      subscription: { id: mockSubscriptionId },
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'year',
        useProration: true,
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('immediately with prorated charge');
    
    expect(mockCreemService.upgradeSubscription).toHaveBeenCalledWith(
      mockSubscriptionId,
      'proplus_yearly',
      true
    );
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.api.getSession.mockResolvedValue(null);

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'month',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if subscription not found', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue(null);

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_invalid/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'month',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: 'sub_invalid' }),
    });

    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe('Subscription not found');
  });

  it('should return 400 if subscription is not active', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'canceled',
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'month',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Only active subscriptions can be upgraded');
  });

  it('should return 400 for invalid request data', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'invalid_plan',
        newInterval: 'invalid_interval',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 400 if upgrading to same plan', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'pro',
        newInterval: 'month',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('You are already on this plan');
  });

  it('should return 500 if Creem service fails', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    mockCreemService.upgradeSubscription.mockResolvedValue({
      success: false,
      error: 'Payment method required',
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'month',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Payment method required');
  });

  it('should create payment event after successful upgrade', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: mockUserId,
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    mockCreemService.upgradeSubscription.mockResolvedValue({
      success: true,
      subscription: { id: mockSubscriptionId },
    });

    const { POST } = await import(
      '@/app/api/creem/subscription/[subscriptionId]/upgrade/route'
    );

    const request = new Request('http://localhost/api/creem/subscription/sub_123/upgrade', {
      method: 'POST',
      body: JSON.stringify({
        newPlanId: 'proplus',
        newInterval: 'year',
      }),
    });

    await POST(request, {
      params: Promise.resolve({ subscriptionId: mockSubscriptionId }),
    });

    expect(mockPaymentRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'payment_123',
        eventType: 'upgraded',
      })
    );

    const eventData = JSON.parse(
      mockPaymentRepository.createEvent.mock.calls[0][0].eventData
    );
    
    expect(eventData).toMatchObject({
      subscriptionId: mockSubscriptionId,
      oldPlan: 'pro',
      oldInterval: 'month',
      newPlan: 'proplus',
      newInterval: 'year',
    });
  });
});
