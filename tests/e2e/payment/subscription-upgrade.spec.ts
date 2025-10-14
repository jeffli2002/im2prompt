import { test, expect } from '@playwright/test';

test.describe('Subscription Upgrade Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard');
  });

  test('should upgrade from Pro to Pro+ at period end', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    
    const currentPeriodEnd = await page.locator('[data-testid="period-end"]').textContent();
    
    await page.click('button:has-text("Upgrade to Pro+")');
    
    await expect(page.locator('text=Upgrade Subscription')).toBeVisible();
    
    await page.click('button:has-text("Monthly")');
    
    await page.click('button:has-text("Confirm Upgrade")');
    
    await expect(page.locator('text=Subscription will be upgraded')).toBeVisible();
    await expect(page.locator('text=end of current period')).toBeVisible();
    
    await page.waitForSelector('[data-testid="upgrade-scheduled"]');
    
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro');
    await expect(page.locator('[data-testid="scheduled-plan"]')).toContainText('Pro+');
    await expect(page.locator('[data-testid="upgrade-date"]')).toContainText(currentPeriodEnd || '');
  });

  test('should upgrade from monthly to yearly at period end', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await expect(page.locator('text=Monthly')).toBeVisible();
    
    await page.click('button:has-text("Switch to Yearly")');
    
    await expect(page.locator('text=20% discount')).toBeVisible();
    
    await page.click('button:has-text("Confirm")');
    
    await expect(page.locator('text=upgraded')).toBeVisible();
    
    await expect(page.locator('[data-testid="scheduled-interval"]')).toContainText('Yearly');
  });

  test('should upgrade with immediate proration when selected', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    
    await page.click('input[type="checkbox"][name="useProration"]');
    
    await expect(page.locator('text=prorated charge')).toBeVisible();
    
    await page.click('button:has-text("Confirm Upgrade")');
    
    await expect(page.locator('text=immediately with prorated charge')).toBeVisible();
    
    await page.waitForSelector('[data-testid="current-plan"]:has-text("Pro+")');
  });

  test('should show upgrade preview before confirming', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    
    await expect(page.locator('[data-testid="current-plan-preview"]')).toContainText('Pro');
    await expect(page.locator('[data-testid="new-plan-preview"]')).toContainText('Pro+');
    
    await expect(page.locator('[data-testid="current-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-price"]')).toBeVisible();
    
    await expect(page.locator('[data-testid="upgrade-effective-date"]')).toBeVisible();
  });

  test('should not allow upgrade to same plan', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    
    await page.goto('/pricing');
    
    const proButton = page.locator('button:has-text("Subscribe")').filter({ 
      hasText: /Pro/ 
    });
    
    await expect(proButton).toBeDisabled();
    await expect(page.locator('text=Current Plan')).toBeVisible();
  });

  test('should handle upgrade errors gracefully', async ({ page }) => {
    await page.route('**/api/creem/subscription/*/upgrade', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Payment method required' }),
      });
    });

    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    await page.click('button:has-text("Confirm Upgrade")');
    
    await expect(page.locator('text=Payment method required')).toBeVisible();
    
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro');
  });

  test('should allow canceling upgrade during confirmation', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    
    await expect(page.locator('text=Upgrade Subscription')).toBeVisible();
    
    await page.click('button:has-text("Cancel")');
    
    await expect(page.locator('text=Upgrade Subscription')).not.toBeVisible();
    
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro');
  });

  test('should show loading state during upgrade', async ({ page }) => {
    await page.route('**/api/creem/subscription/*/upgrade', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Subscription will be upgraded at the end of current period' 
        }),
      });
    });

    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    await page.click('button:has-text("Confirm Upgrade")');
    
    await expect(page.locator('text=Upgrading')).toBeVisible();
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    await expect(page.locator('text=upgraded')).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to billing after successful upgrade from pricing page', async ({ page }) => {
    await page.goto('/pricing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    
    await page.waitForURL('/settings/billing');
    
    await expect(page.locator('text=upgraded')).toBeVisible();
  });

  test('should maintain upgrade preference across page reloads', async ({ page }) => {
    await page.goto('/settings/billing');
    
    await page.click('button:has-text("Upgrade to Pro+")');
    await page.click('button:has-text("Confirm Upgrade")');
    
    await expect(page.locator('text=upgraded')).toBeVisible();
    
    await page.reload();
    
    await expect(page.locator('[data-testid="scheduled-plan"]')).toContainText('Pro+');
  });
});

test.describe('Subscription Downgrade Flow E2E', () => {
  test('should immediately cancel and create new subscription for downgrades', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'proplus@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    await page.goto('/settings/billing');
    
    await expect(page.locator('text=Pro+ Plan')).toBeVisible();
    
    await page.click('button:has-text("Downgrade to Pro")');
    
    await expect(page.locator('text=immediately cancel')).toBeVisible();
    await expect(page.locator('text=lose access')).toBeVisible();
    
    await page.click('button:has-text("Confirm Downgrade")');
    
    await expect(page.locator('text=downgraded')).toBeVisible();
    
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Pro');
  });
});
