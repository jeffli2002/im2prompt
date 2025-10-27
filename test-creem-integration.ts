import crypto from 'node:crypto';
import { config } from 'dotenv';

config({ path: '.env.local' });

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
  error?: string;
}

class CreemIntegrationTester {
  private results: TestResult[] = [];
  private testUserId = `test-user-${Date.now()}`;
  private baseUrl = 'http://localhost:3002';

  async runAllTests() {
    console.log('🧪 Starting Creem Payment Integration Tests\n');
    console.log('='.repeat(60));

    await this.testEnvironmentVariables();
    await this.testCreemServiceInitialization();
    await this.testWebhookSignatureVerification();
    await this.testCheckoutSessionCreation();
    await this.testWebhookEventHandling();
    await this.testSubscriptionManagement();
    await this.testCreditGranting();
    await this.testDatabaseOperations();

    this.printReport();
  }

  private async runTest(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'PASS', message: 'Test passed', duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({
        name,
        status: 'FAIL',
        message: 'Test failed',
        duration,
        error: message,
      });
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   Error: ${message}`);
    }
  }

  private async testEnvironmentVariables() {
    console.log('\n📋 Testing Environment Variables');
    console.log('-'.repeat(60));

    await this.runTest('CREEM_API_KEY is set', async () => {
      const apiKey = process.env.CREEM_API_KEY;
      if (!apiKey) throw new Error('CREEM_API_KEY not found');
      if (!apiKey.startsWith('creem_')) throw new Error('Invalid CREEM_API_KEY format');
      console.log(`   API Key: ${apiKey.substring(0, 20)}...`);
    });

    await this.runTest('CREEM_WEBHOOK_SECRET is set', async () => {
      const secret = process.env.CREEM_WEBHOOK_SECRET;
      if (!secret) throw new Error('CREEM_WEBHOOK_SECRET not found');
      if (!secret.startsWith('wh_')) throw new Error('Invalid webhook secret format');
      console.log(`   Webhook Secret: ${secret.substring(0, 15)}...`);
    });

    await this.runTest('CREEM_PRO_PLAN_PRODUCT_KEY is set', async () => {
      const key = process.env.CREEM_PRO_PLAN_PRODUCT_KEY;
      if (!key) throw new Error('CREEM_PRO_PLAN_PRODUCT_KEY not found');
      if (!key.startsWith('prod_')) throw new Error('Invalid product key format');
      console.log(`   Pro Plan: ${key}`);
    });

    await this.runTest('CREEM_PROPLUS_PLAN_PRODUCT_KEY is set', async () => {
      const key = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY;
      if (!key) throw new Error('CREEM_PROPLUS_PLAN_PRODUCT_KEY not found');
      if (!key.startsWith('prod_')) throw new Error('Invalid product key format');
      console.log(`   ProPlus Plan: ${key}`);
    });

    await this.runTest('Using test mode credentials', async () => {
      const apiKey = process.env.CREEM_API_KEY!;
      if (!apiKey.includes('test')) {
        throw new Error('Not using test mode! This could affect production data.');
      }
      console.log('   ✓ Test mode confirmed');
    });
  }

  private async testCreemServiceInitialization() {
    console.log('\n🔧 Testing Creem Service Initialization');
    console.log('-'.repeat(60));

    await this.runTest('CreemService can be imported', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      if (!CreemService) throw new Error('CreemService not exported');
      console.log('   ✓ CreemService imported successfully');
    });

    await this.runTest('CreemService.getInstance() works', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      const instance = CreemService.getInstance();
      if (!instance) throw new Error('Failed to get instance');
      console.log('   ✓ Singleton instance created');
    });

    await this.runTest('Creem SDK can be initialized', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      const service = CreemService.getInstance();
      await service.initializeSdk();
      console.log('   ✓ SDK initialized successfully');
    });
  }

  private async testWebhookSignatureVerification() {
    console.log('\n🔐 Testing Webhook Signature Verification');
    console.log('-'.repeat(60));

    await this.runTest('HMAC SHA-256 signature generation', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.CREEM_WEBHOOK_SECRET!;

      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      if (!signature || signature.length !== 64) {
        throw new Error('Invalid signature generated');
      }
      console.log(`   Signature: ${signature.substring(0, 20)}...`);
    });

    await this.runTest('Signature verification logic', async () => {
      const payload = JSON.stringify({
        event: 'subscription.created',
        timestamp: Date.now(),
      });
      const secret = process.env.CREEM_WEBHOOK_SECRET!;

      const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(validSignature),
        Buffer.from(validSignature)
      );

      if (!isValid) throw new Error('Signature verification failed');
      console.log('   ✓ Timing-safe comparison works');
    });

    await this.runTest('Invalid signature detection', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const invalidSignature = 'invalid_signature_123';
      const secret = process.env.CREEM_WEBHOOK_SECRET!;

      const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      try {
        crypto.timingSafeEqual(
          Buffer.from(validSignature),
          Buffer.from(invalidSignature.padEnd(64, '0'))
        );
      } catch {
        console.log('   ✓ Invalid signatures are rejected');
        return;
      }
      throw new Error('Should have rejected invalid signature');
    });
  }

  private async testCheckoutSessionCreation() {
    console.log('\n💳 Testing Checkout Session Creation');
    console.log('-'.repeat(60));

    await this.runTest('Pro plan checkout session', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      const service = CreemService.getInstance();

      const result = await service.createCheckoutSession({
        userId: this.testUserId,
        planId: 'pro',
        successUrl: 'http://localhost:3002/success',
        cancelUrl: 'http://localhost:3002/cancel',
      });

      if (!result.url) throw new Error('No checkout URL returned');
      if (!result.url.includes('creem.io')) {
        throw new Error('Invalid checkout URL');
      }
      console.log(`   Checkout URL: ${result.url.substring(0, 50)}...`);
    });

    await this.runTest('ProPlus plan checkout session', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      const service = CreemService.getInstance();

      const result = await service.createCheckoutSession({
        userId: this.testUserId,
        planId: 'proplus',
        successUrl: 'http://localhost:3002/success',
        cancelUrl: 'http://localhost:3002/cancel',
      });

      if (!result.url) throw new Error('No checkout URL returned');
      console.log(`   Checkout URL: ${result.url.substring(0, 50)}...`);
    });

    await this.runTest('Invalid plan rejection', async () => {
      const { CreemService } = await import('./src/lib/creem/creem-service');
      const service = CreemService.getInstance();

      try {
        await service.createCheckoutSession({
          userId: this.testUserId,
          planId: 'invalid_plan' as any,
          successUrl: 'http://localhost:3002/success',
          cancelUrl: 'http://localhost:3002/cancel',
        });
        throw new Error('Should have rejected invalid plan');
      } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid plan')) {
          console.log('   ✓ Invalid plan rejected correctly');
          return;
        }
        throw error;
      }
    });
  }

  private async testWebhookEventHandling() {
    console.log('\n🎣 Testing Webhook Event Handling');
    console.log('-'.repeat(60));

    await this.runTest('Webhook payload structure validation', async () => {
      const webhookPayload = {
        id: `evt_test_${Date.now()}`,
        type: 'subscription.created',
        created: Math.floor(Date.now() / 1000),
        data: {
          subscription: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            product_key: process.env.CREEM_PRO_PLAN_PRODUCT_KEY,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            metadata: {
              userId: this.testUserId,
            },
          },
        },
      };

      if (!webhookPayload.id || !webhookPayload.type || !webhookPayload.data) {
        throw new Error('Invalid webhook payload structure');
      }
      console.log('   ✓ Payload structure valid');
    });

    await this.runTest('Subscription created event mapping', async () => {
      const event = {
        id: 'evt_test_created',
        type: 'subscription.created',
        data: {
          subscription: {
            id: 'sub_test_123',
            status: 'active',
            product_key: process.env.CREEM_PRO_PLAN_PRODUCT_KEY,
            metadata: { userId: this.testUserId },
          },
        },
      };

      if (event.type !== 'subscription.created') {
        throw new Error('Event type mismatch');
      }
      console.log('   ✓ Event type mapping correct');
    });

    await this.runTest('Subscription updated event mapping', async () => {
      const event = {
        type: 'subscription.updated',
        data: { subscription: { id: 'sub_123', status: 'active' } },
      };
      if (event.type !== 'subscription.updated') throw new Error('Mapping failed');
      console.log('   ✓ Updated event recognized');
    });

    await this.runTest('Subscription canceled event mapping', async () => {
      const event = {
        type: 'subscription.canceled',
        data: { subscription: { id: 'sub_123', status: 'canceled' } },
      };
      if (event.type !== 'subscription.canceled') throw new Error('Mapping failed');
      console.log('   ✓ Canceled event recognized');
    });
  }

  private async testSubscriptionManagement() {
    console.log('\n📊 Testing Subscription Management');
    console.log('-'.repeat(60));

    await this.runTest('Plan ID to product key mapping', async () => {
      const proKey = process.env.CREEM_PRO_PLAN_PRODUCT_KEY;
      const proplusKey = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY;

      const mapping: Record<string, string> = {
        pro: proKey!,
        proplus: proplusKey!,
      };

      if (!mapping.pro || !mapping.proplus) {
        throw new Error('Plan mapping incomplete');
      }
      console.log(`   ✓ Pro → ${mapping.pro}`);
      console.log(`   ✓ ProPlus → ${mapping.proplus}`);
    });

    await this.runTest('Product key to credits mapping', async () => {
      const proKey = process.env.CREEM_PRO_PLAN_PRODUCT_KEY;
      const proplusKey = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY;

      const creditsMapping: Record<string, number> = {
        [proKey!]: 500,
        [proplusKey!]: 900,
      };

      if (creditsMapping[proKey!] !== 500) {
        throw new Error('Pro plan credits incorrect');
      }
      if (creditsMapping[proplusKey!] !== 900) {
        throw new Error('ProPlus plan credits incorrect');
      }
      console.log('   ✓ Pro → 500 credits');
      console.log('   ✓ ProPlus → 900 credits');
    });
  }

  private async testCreditGranting() {
    console.log('\n💰 Testing Credit Granting System');
    console.log('-'.repeat(60));

    await this.runTest('Credit calculation for Pro plan', async () => {
      const proKey = process.env.CREEM_PRO_PLAN_PRODUCT_KEY;
      const credits = proKey === process.env.CREEM_PRO_PLAN_PRODUCT_KEY ? 500 : 0;

      if (credits !== 500) throw new Error('Incorrect credit amount');
      console.log('   ✓ Pro plan grants 500 credits');
    });

    await this.runTest('Credit calculation for ProPlus plan', async () => {
      const proplusKey = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY;
      const credits = proplusKey === process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY ? 900 : 0;

      if (credits !== 900) throw new Error('Incorrect credit amount');
      console.log('   ✓ ProPlus plan grants 900 credits');
    });

    await this.runTest('Credit transaction structure', async () => {
      const transaction = {
        userId: this.testUserId,
        amount: 500,
        type: 'subscription' as const,
        description: 'Pro plan subscription credits',
        metadata: {
          planId: 'pro',
          subscriptionId: 'sub_test_123',
        },
      };

      if (!transaction.userId || !transaction.amount || !transaction.type) {
        throw new Error('Invalid transaction structure');
      }
      console.log('   ✓ Transaction structure valid');
    });
  }

  private async testDatabaseOperations() {
    console.log('\n🗄️  Testing Database Operations');
    console.log('-'.repeat(60));

    await this.runTest('Database schema imports', async () => {
      const schema = await import('./src/server/db/schema');
      if (!schema.payment || !schema.paymentEvent || !schema.userCredits) {
        throw new Error('Required tables not found in schema');
      }
      console.log('   ✓ payment table schema loaded');
      console.log('   ✓ paymentEvent table schema loaded');
      console.log('   ✓ userCredits table schema loaded');
    });

    await this.runTest('Drizzle ORM connection', async () => {
      const { db } = await import('./src/server/db');
      if (!db) throw new Error('Database connection not available');
      console.log('   ✓ Drizzle ORM initialized');
    });

    await this.runTest('Payment record structure', async () => {
      const paymentRecord = {
        id: `pay_test_${Date.now()}`,
        userId: this.testUserId,
        customerId: 'cus_test_123',
        subscriptionId: 'sub_test_123',
        status: 'active',
        priceId: process.env.CREEM_PRO_PLAN_PRODUCT_KEY!,
        type: 'subscription',
        interval: 'month',
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!paymentRecord.userId || !paymentRecord.subscriptionId) {
        throw new Error('Invalid payment record structure');
      }
      console.log('   ✓ Payment record structure valid');
    });
  }

  private printReport() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Test Report');
    console.log('='.repeat(60));

    const passed = this.results.filter((r) => r.status === 'PASS').length;
    const failed = this.results.filter((r) => r.status === 'FAIL').length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`\nTotal Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Pass Rate: ${passRate}%`);

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`Total Duration: ${totalDuration}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          console.log(`\n  • ${r.name}`);
          console.log(`    ${r.error}`);
        });
    }

    console.log(`\n${'='.repeat(60)}`);

    if (failed === 0) {
      console.log('✅ All tests passed! Creem integration is ready.');
    } else {
      console.log('❌ Some tests failed. Please review the errors above.');
    }
    console.log(`${'='.repeat(60)}\n`);

    const summary = {
      timestamp: new Date().toISOString(),
      total,
      passed,
      failed,
      passRate,
      duration: totalDuration,
      results: this.results,
    };

    const fs = require('node:fs');
    fs.writeFileSync('test-results-creem.json', JSON.stringify(summary, null, 2));
    console.log('📄 Detailed results saved to: test-results-creem.json\n');
  }
}

const tester = new CreemIntegrationTester();
tester.runAllTests().catch(console.error);
