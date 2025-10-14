import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCreemService = {
  upgradeSubscription: jest.fn(),
};

const mockPaymentRepository = {
  findBySubscriptionId: jest.fn(),
  update: jest.fn(),
  createEvent: jest.fn(),
};

const mockGetSessionWithAuthBypass = jest.fn();

jest.mock('@/lib/creem/creem-service', () => ({
  creemService: mockCreemService,
}));

jest.mock('@/server/db/repositories/payment-repository', () => ({
  paymentRepository: mockPaymentRepository,
}));

jest.mock('@/lib/auth/auth-utils', () => ({
  getSessionWithAuthBypass: mockGetSessionWithAuthBypass,
}));

describe('upgradeSubscription Server Action', () => {
  const mockUserId = 'user_123';
  const mockSubscriptionId = 'sub_123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully upgrade subscription from Pro to Pro+', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
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
      },
    });

    mockPaymentRepository.update.mockResolvedValue(undefined);
    mockPaymentRepository.createEvent.mockResolvedValue(undefined);

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(true);
    expect(result.data?.upgraded).toBe(true);
    expect(result.message).toContain('end of current period');
    
    expect(mockCreemService.upgradeSubscription).toHaveBeenCalledWith(
      mockSubscriptionId,
      'proplus_monthly',
      false
    );
    
    expect(mockPaymentRepository.update).toHaveBeenCalledWith('payment_123', {
      priceId: 'proplus',
      interval: 'month',
    });
    
    expect(mockPaymentRepository.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: 'payment_123',
        eventType: 'upgraded',
      })
    );
  });

  it('should upgrade with proration when requested', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
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

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'year',
      true
    );

    expect(result.success).toBe(true);
    expect(result.message).toContain('immediately with prorated charge');
    
    expect(mockCreemService.upgradeSubscription).toHaveBeenCalledWith(
      mockSubscriptionId,
      'proplus_yearly',
      true
    );
  });

  it('should reject upgrade if user is not authenticated', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue(null);

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please login first');
  });

  it('should reject upgrade if subscription not found', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue(null);

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Subscription not found or unauthorized');
  });

  it('should reject upgrade if user does not own subscription', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
      user: { id: mockUserId },
    });

    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_123',
      userId: 'different_user',
      subscriptionId: mockSubscriptionId,
      priceId: 'pro',
      interval: 'month',
      status: 'active',
    });

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Subscription not found or unauthorized');
  });

  it('should reject upgrade if subscription is not active', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
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

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Only active subscriptions can be upgraded');
  });

  it('should reject upgrade to same plan', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
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

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'pro',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('You are already on this plan');
  });

  it('should handle Creem service errors', async () => {
    mockGetSessionWithAuthBypass.mockResolvedValue({
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

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment method required');
  });

  it('should handle unexpected errors', async () => {
    mockGetSessionWithAuthBypass.mockRejectedValue(
      new Error('Database connection failed')
    );

    const { upgradeSubscription } = await import(
      '@/server/actions/payment/upgrade-subscription'
    );

    const result = await upgradeSubscription(
      mockSubscriptionId,
      'proplus',
      'month',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database connection failed');
  });
});
