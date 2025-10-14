import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCreemClient = {
  upgradeSubscription: jest.fn(),
};

const mockGetCreemClient = jest.fn(() => mockCreemClient);
const mockGetCreemApiKey = jest.fn(() => 'test_creem_key');

jest.mock('@/lib/creem/creem-service', () => {
  const actual = jest.requireActual('@/lib/creem/creem-service');
  return {
    ...actual,
    getCreemClient: mockGetCreemClient,
    getCreemApiKey: mockGetCreemApiKey,
  };
});

jest.mock('@/env', () => ({
  env: {
    CREEM_API_KEY: 'test_creem_key',
    CREEM_PRO_PLAN_PRODUCT_KEY_MONTHLY: 'prod_pro_monthly',
    CREEM_PROPLUS_PLAN_PRODUCT_KEY_MONTHLY: 'prod_proplus_monthly',
    CREEM_PRO_PLAN_PRODUCT_KEY_YEARLY: 'prod_pro_yearly',
    CREEM_PROPLUS_PLAN_PRODUCT_KEY_YEARLY: 'prod_proplus_yearly',
  },
}));

describe('Creem Service - upgradeSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should upgrade subscription with proration-none by default', async () => {
    const mockSubscription = {
      id: 'sub_123',
      status: 'active',
      product: { id: 'prod_proplus_monthly' },
      currentPeriodEnd: Date.now() + 86400000,
    };

    mockCreemClient.upgradeSubscription.mockResolvedValue(mockSubscription);

    const { creemService } = await import('@/lib/creem/creem-service');
    const result = await creemService.upgradeSubscription(
      'sub_123',
      'proplus_monthly',
      false
    );

    expect(result.success).toBe(true);
    expect(mockCreemClient.upgradeSubscription).toHaveBeenCalledWith({
      id: 'sub_123',
      xApiKey: 'test_creem_key',
      UpgradeSubscriptionRequestEntity: {
        productId: 'prod_proplus_monthly',
        updateBehavior: 'proration-none',
      },
    });
  });

  it('should upgrade subscription with proration-charge when requested', async () => {
    const mockSubscription = {
      id: 'sub_123',
      status: 'active',
      product: { id: 'prod_proplus_yearly' },
    };

    mockCreemClient.upgradeSubscription.mockResolvedValue(mockSubscription);

    const { creemService } = await import('@/lib/creem/creem-service');
    const result = await creemService.upgradeSubscription(
      'sub_123',
      'proplus_yearly',
      true
    );

    expect(result.success).toBe(true);
    expect(mockCreemClient.upgradeSubscription).toHaveBeenCalledWith({
      id: 'sub_123',
      xApiKey: 'test_creem_key',
      UpgradeSubscriptionRequestEntity: {
        productId: 'prod_proplus_yearly',
        updateBehavior: 'proration-charge',
      },
    });
  });

  it('should handle upgrade errors gracefully', async () => {
    mockCreemClient.upgradeSubscription.mockRejectedValue(
      new Error('Subscription not found')
    );

    const { creemService } = await import('@/lib/creem/creem-service');
    const result = await creemService.upgradeSubscription(
      'sub_invalid',
      'proplus_monthly',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Subscription not found');
  });

  it('should throw error when API key is not configured', async () => {
    mockGetCreemApiKey.mockReturnValueOnce('');

    const { creemService } = await import('@/lib/creem/creem-service');
    const result = await creemService.upgradeSubscription(
      'sub_123',
      'proplus_monthly',
      false
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('API key not configured');
  });

  it('should throw error when product ID is not configured', async () => {
    const { creemService } = await import('@/lib/creem/creem-service');
    
    jest.mock('@/env', () => ({
      env: {
        CREEM_API_KEY: 'test_creem_key',
        CREEM_PRO_PLAN_PRODUCT_KEY_MONTHLY: '',
      },
    }));

    const result = await creemService.upgradeSubscription(
      'sub_123',
      'pro_monthly' as any,
      false
    );

    expect(result.success).toBe(false);
  });

  it('should log upgrade details', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    mockCreemClient.upgradeSubscription.mockResolvedValue({
      id: 'sub_123',
      status: 'active',
    });

    const { creemService } = await import('@/lib/creem/creem-service');
    await creemService.upgradeSubscription('sub_123', 'proplus_monthly', false);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Creem] Upgrading subscription:'),
      'sub_123',
      'to',
      'proplus_monthly'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Creem] Upgrade scheduled:'),
      expect.objectContaining({
        subscriptionId: 'sub_123',
        newProductKey: 'proplus_monthly',
        updateBehavior: 'proration-none',
      })
    );

    consoleSpy.mockRestore();
  });
});
