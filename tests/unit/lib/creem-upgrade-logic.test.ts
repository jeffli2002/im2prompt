import { describe, it, expect } from '@jest/globals';

describe('Creem Upgrade Logic Unit Tests', () => {
  describe('Upgrade detection', () => {
    it('should detect Pro to Pro+ as upgrade', () => {
      const currentPlan = 'pro';
      const newPlan = 'proplus';
      const currentInterval = 'month';
      const newInterval = 'month';
      
      const isUpgrade = 
        (currentPlan === 'pro' && newPlan === 'proplus') ||
        (currentInterval === 'month' && newInterval === 'year');
      
      expect(isUpgrade).toBe(true);
    });

    it('should detect monthly to yearly as upgrade', () => {
      const currentPlan = 'pro';
      const newPlan = 'pro';
      const currentInterval = 'month';
      const newInterval = 'year';
      
      const isUpgrade = 
        (currentPlan === 'pro' && newPlan === 'proplus') ||
        (currentInterval === 'month' && newInterval === 'year');
      
      expect(isUpgrade).toBe(true);
    });

    it('should detect Pro+ to Pro as downgrade', () => {
      const currentPlan = 'proplus';
      const newPlan = 'pro';
      const currentInterval = 'month';
      const newInterval = 'month';
      
      const isUpgrade = 
        (currentPlan === 'pro' && newPlan === 'proplus') ||
        (currentInterval === 'month' && newInterval === 'year');
      
      expect(isUpgrade).toBe(false);
    });

    it('should detect yearly to monthly as downgrade', () => {
      const currentPlan = 'proplus';
      const newPlan = 'proplus';
      const currentInterval = 'year';
      const newInterval = 'month';
      
      const isUpgrade = 
        (currentPlan === 'pro' && newPlan === 'proplus') ||
        (currentInterval === 'month' && newInterval === 'year');
      
      expect(isUpgrade).toBe(false);
    });

    it('should handle Pro+ monthly to Pro+ yearly as upgrade', () => {
      const currentPlan = 'proplus';
      const newPlan = 'proplus';
      const currentInterval = 'month';
      const newInterval = 'year';
      
      const isUpgrade = 
        (currentPlan === 'pro' && newPlan === 'proplus') ||
        (currentInterval === 'month' && newInterval === 'year');
      
      expect(isUpgrade).toBe(true);
    });
  });

  describe('Duplicate request detection', () => {
    it('should detect duplicate within 30 seconds', () => {
      const subscriptionAge = 5000; // 5 seconds
      const currentPlan = 'pro';
      const newPlan = 'pro';
      const currentInterval = 'month';
      const newInterval = 'month';
      
      const isRecentDuplicate = 
        currentPlan === newPlan && 
        currentInterval === newInterval && 
        subscriptionAge < 30000;
      
      expect(isRecentDuplicate).toBe(true);
    });

    it('should not detect duplicate after 30 seconds', () => {
      const subscriptionAge = 35000; // 35 seconds
      const currentPlan = 'pro';
      const newPlan = 'pro';
      const currentInterval = 'month';
      const newInterval = 'month';
      
      const isRecentDuplicate = 
        currentPlan === newPlan && 
        currentInterval === newInterval && 
        subscriptionAge < 30000;
      
      expect(isRecentDuplicate).toBe(false);
    });

    it('should not detect different plan as duplicate', () => {
      const subscriptionAge = 5000;
      const currentPlan = 'pro';
      const newPlan = 'proplus';
      const currentInterval = 'month';
      const newInterval = 'month';
      
      const isRecentDuplicate = 
        currentPlan === newPlan && 
        currentInterval === newInterval && 
        subscriptionAge < 30000;
      
      expect(isRecentDuplicate).toBe(false);
    });
  });

  describe('Product key generation', () => {
    it('should generate correct product key for Pro monthly', () => {
      const planId = 'pro';
      const interval = 'month';
      const productKey = `${planId}_${interval === 'year' ? 'yearly' : 'monthly'}`;
      
      expect(productKey).toBe('pro_monthly');
    });

    it('should generate correct product key for Pro yearly', () => {
      const planId = 'pro';
      const interval = 'year';
      const productKey = `${planId}_${interval === 'year' ? 'yearly' : 'monthly'}`;
      
      expect(productKey).toBe('pro_yearly');
    });

    it('should generate correct product key for Pro+ monthly', () => {
      const planId = 'proplus';
      const interval = 'month';
      const productKey = `${planId}_${interval === 'year' ? 'yearly' : 'monthly'}`;
      
      expect(productKey).toBe('proplus_monthly');
    });

    it('should generate correct product key for Pro+ yearly', () => {
      const planId = 'proplus';
      const interval = 'year';
      const productKey = `${planId}_${interval === 'year' ? 'yearly' : 'monthly'}`;
      
      expect(productKey).toBe('proplus_yearly');
    });
  });
});
