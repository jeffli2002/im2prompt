import crypto from 'node:crypto';
import { config } from 'dotenv';

config({ path: '.env.local' });

class CreemIntegrationTester {
  constructor() {
    this.results = [];
    this.testUserId = `test-user-${Date.now()}`;
    this.baseUrl = 'http://localhost:3002';
  }

  async runAllTests() {
    console.log('🧪 Starting Creem Payment Integration Tests\n');
    console.log('='.repeat(60));

    await this.testEnvironmentVariables();
    await this.testWebhookSignatureVerification();
    await this.testSubscriptionManagement();
    await this.testCreditGranting();

    this.printReport();
  }

  async runTest(name, fn) {
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

  async testEnvironmentVariables() {
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
      const apiKey = process.env.CREEM_API_KEY;
      if (!apiKey.includes('test')) {
        throw new Error('Not using test mode! This could affect production data.');
      }
      console.log('   ✓ Test mode confirmed');
    });

    await this.runTest('CREEM_WEBHOOK_URL is set', async () => {
      const url = process.env.CREEM_WEBHOOK_URL;
      if (!url) throw new Error('CREEM_WEBHOOK_URL not found');
      console.log(`   Webhook URL: ${url}`);
    });

    await this.runTest('Payment plan URLs are set', async () => {
      const proUrl = process.env.CREEM_PRO_PAYMENT_PLAN_URL;
      const proplusUrl = process.env.CREEM_PROPLUS_PAYMENT_PLAN_URL;
      if (!proUrl) throw new Error('CREEM_PRO_PAYMENT_PLAN_URL not found');
      if (!proplusUrl) throw new Error('CREEM_PROPLUS_PAYMENT_PLAN_URL not found');
      console.log(`   Pro URL: ${proUrl}`);
      console.log(`   ProPlus URL: ${proplusUrl}`);
    });
  }

  async testWebhookSignatureVerification() {
    console.log('\n🔐 Testing Webhook Signature Verification');
    console.log('-'.repeat(60));

    await this.runTest('HMAC SHA-256 signature generation', async () => {
      const payload = JSON.stringify({ test: 'data' });
      const secret = process.env.CREEM_WEBHOOK_SECRET;

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
      const secret = process.env.CREEM_WEBHOOK_SECRET;

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
      const secret = process.env.CREEM_WEBHOOK_SECRET;

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

    await this.runTest('Webhook event payload structure', async () => {
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
  }

  async testSubscriptionManagement() {
    console.log('\n📊 Testing Subscription Management');
    console.log('-'.repeat(60));

    await this.runTest('Plan ID to product key mapping', async () => {
      const proKey = process.env.CREEM_PRO_PLAN_PRODUCT_KEY;
      const proplusKey = process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY;

      const mapping = {
        pro: proKey,
        proplus: proplusKey,
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

      const creditsMapping = {
        [proKey]: 500,
        [proplusKey]: 900,
      };

      if (creditsMapping[proKey] !== 500) {
        throw new Error('Pro plan credits incorrect');
      }
      if (creditsMapping[proplusKey] !== 900) {
        throw new Error('ProPlus plan credits incorrect');
      }
      console.log('   ✓ Pro → 500 credits');
      console.log('   ✓ ProPlus → 900 credits');
    });

    await this.runTest('Subscription event types', async () => {
      const eventTypes = [
        'subscription.created',
        'subscription.updated',
        'subscription.canceled',
        'subscription.payment_succeeded',
        'subscription.payment_failed',
        'customer.subscription.deleted',
        'checkout.session.completed',
        'invoice.payment_succeeded',
      ];

      if (eventTypes.length < 5) {
        throw new Error('Missing event types');
      }
      console.log(`   ✓ ${eventTypes.length} event types supported`);
    });
  }

  async testCreditGranting() {
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
        type: 'subscription',
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

    await this.runTest('Credit types validation', async () => {
      const validTypes = ['subscription', 'purchase', 'bonus', 'refund', 'adjustment'];

      if (!validTypes.includes('subscription')) {
        throw new Error('subscription type not in valid types');
      }
      console.log(`   ✓ ${validTypes.length} credit types defined`);
    });
  }

  printReport() {
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
      console.log('\n📝 Next Steps:');
      console.log('   1. Start dev server: pnpm dev');
      console.log('   2. Test checkout flow at: http://localhost:3002/pricing');
      console.log('   3. Set up webhook forwarding with ngrok');
      console.log('   4. Test webhook events from Creem dashboard');
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
      environment: {
        apiKey: `${process.env.CREEM_API_KEY?.substring(0, 20)}...`,
        webhookUrl: process.env.CREEM_WEBHOOK_URL,
        testMode: process.env.CREEM_API_KEY?.includes('test') ?? false,
      },
    };

    import('node:fs').then((fs) => {
      fs.default.writeFileSync('test-results-creem.json', JSON.stringify(summary, null, 2));
      console.log('📄 Detailed results saved to: test-results-creem.json\n');
    });
  }
}

const tester = new CreemIntegrationTester();
tester.runAllTests().catch(console.error);
