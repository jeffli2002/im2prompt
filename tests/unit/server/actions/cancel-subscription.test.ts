import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockStripeProviderInstance = {
  cancelSubscription: jest.fn(),
};

const mockStripeProviderConstructor = jest
  .fn()
  .mockImplementation(() => mockStripeProviderInstance);

const mockCreemService = {
  cancelSubscription: jest.fn(),
};

const mockPaymentRepository = {
  findBySubscriptionId: jest.fn(),
  update: jest.fn(),
  createEvent: jest.fn(),
};

const mockGetSessionWithAuthBypass = jest.fn();

jest.mock('@/payment/stripe/provider', () => ({
  StripeProvider: mockStripeProviderConstructor,
}));

jest.mock('@/lib/creem/creem-service', () => ({
  creemService: mockCreemService,
}));

jest.mock('@/server/db/repositories/payment-repository', () => ({
  paymentRepository: mockPaymentRepository,
}));

jest.mock('@/lib/auth/auth-utils', () => ({
  getSessionWithAuthBypass: mockGetSessionWithAuthBypass,
}));

describe('cancelSubscription server action', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockStripeProviderConstructor.mockClear();
    mockStripeProviderInstance.cancelSubscription.mockReset();
    mockGetSessionWithAuthBypass.mockResolvedValue({
      user: { id: mockUserId },
    });
  });

  it('cancels Stripe subscriptions using the Stripe provider', async () => {
    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_stripe',
      userId: mockUserId,
      subscriptionId: 'sub_stripe',
      provider: 'stripe',
      status: 'active',
    });

    mockStripeProviderInstance.cancelSubscription.mockResolvedValue(true);

    const { cancelSubscription } = await import('@/server/actions/payment/cancel-subscription');
    const result = await cancelSubscription('sub_stripe');

    expect(result.success).toBe(true);
    expect(mockStripeProviderConstructor).toHaveBeenCalledTimes(1);
    expect(mockStripeProviderInstance.cancelSubscription).toHaveBeenCalledWith('sub_stripe');
    expect(mockCreemService.cancelSubscription).not.toHaveBeenCalled();
    expect(mockPaymentRepository.update).toHaveBeenCalledWith('payment_stripe', {
      cancelAtPeriodEnd: true,
    });
    expect(mockPaymentRepository.createEvent).toHaveBeenCalled();
  });

  it('uses Creem cancellation flow and marks already canceled subscriptions correctly', async () => {
    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_creem',
      userId: mockUserId,
      subscriptionId: 'sub_creem',
      provider: 'creem',
      status: 'active',
    });

    mockCreemService.cancelSubscription.mockResolvedValue({
      success: true,
      alreadyCancelled: true,
    });

    const { cancelSubscription } = await import('@/server/actions/payment/cancel-subscription');
    const result = await cancelSubscription('sub_creem');

    expect(result.success).toBe(true);
    expect(result.message).toContain('already canceled');
    expect(mockStripeProviderConstructor).not.toHaveBeenCalled();
    expect(mockCreemService.cancelSubscription).toHaveBeenCalledWith('sub_creem');
    expect(mockPaymentRepository.update).toHaveBeenCalledWith('payment_creem', {
      cancelAtPeriodEnd: false,
      status: 'canceled',
    });
  });

  it('returns an error when Stripe cancellation fails', async () => {
    mockPaymentRepository.findBySubscriptionId.mockResolvedValue({
      id: 'payment_stripe',
      userId: mockUserId,
      subscriptionId: 'sub_stripe',
      provider: 'stripe',
      status: 'active',
    });

    mockStripeProviderInstance.cancelSubscription.mockResolvedValue(false);

    const { cancelSubscription } = await import('@/server/actions/payment/cancel-subscription');
    const result = await cancelSubscription('sub_stripe');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Stripe');
    expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    expect(mockPaymentRepository.createEvent).not.toHaveBeenCalled();
  });
});
