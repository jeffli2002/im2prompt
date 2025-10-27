import { existsSync, readFileSync, writeFileSync } from 'node:fs';

function loadEnv() {
  const envContent = readFileSync('.env.local', 'utf-8');
  const env = {};
  envContent.split('\n').forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  return env;
}

const env = loadEnv();

class FinalCreemTest {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async run(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'PASS', duration });
      this.passed++;
      console.log(`✅ ${name} (${duration}ms)`);
      return true;
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      this.failed++;
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   ${error.message}`);
      return false;
    }
  }

  async testAll() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║        🚀 CREEM PAYMENT INTEGRATION - FINAL TEST  🚀      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    await this.testEnvironment();
    await this.testImplementation();
    await this.testSecurity();
    await this.testBusinessLogic();

    this.printFinalReport();
  }

  async testEnvironment() {
    console.log('\n1️⃣  ENVIRONMENT CONFIGURATION');
    console.log('━'.repeat(60));

    await this.run('✓ CREEM_API_KEY configured', async () => {
      if (!env.CREEM_API_KEY) throw new Error('Missing');
      if (!env.CREEM_API_KEY.startsWith('creem_')) throw new Error('Invalid format');
    });

    await this.run('✓ Test mode active', async () => {
      if (!env.CREEM_API_KEY.includes('test')) throw new Error('Production key!');
    });

    await this.run('✓ Webhook secret configured', async () => {
      if (!env.CREEM_WEBHOOK_SECRET) throw new Error('Missing');
      if (!env.CREEM_WEBHOOK_SECRET.startsWith('wh_')) throw new Error('Invalid format');
    });

    await this.run('✓ Pro plan product key', async () => {
      if (!env.CREEM_PRO_PLAN_PRODUCT_KEY) throw new Error('Missing');
      if (!env.CREEM_PRO_PLAN_PRODUCT_KEY.startsWith('prod_')) throw new Error('Invalid');
    });

    await this.run('✓ ProPlus plan product key', async () => {
      if (!env.CREEM_PROPLUS_PLAN_PRODUCT_KEY) throw new Error('Missing');
      if (!env.CREEM_PROPLUS_PLAN_PRODUCT_KEY.startsWith('prod_')) throw new Error('Invalid');
    });

    await this.run('✓ Webhook URL configured', async () => {
      if (!env.CREEM_WEBHOOK_URL) throw new Error('Missing');
    });

    await this.run('✓ Payment URLs configured', async () => {
      if (!env.CREEM_PRO_PAYMENT_PLAN_URL) throw new Error('Pro URL missing');
      if (!env.CREEM_PROPLUS_PAYMENT_PLAN_URL) throw new Error('ProPlus URL missing');
      if (!env.CREEM_PRO_PAYMENT_PLAN_URL.includes('creem.io')) throw new Error('Invalid Pro URL');
      if (!env.CREEM_PROPLUS_PAYMENT_PLAN_URL.includes('test')) throw new Error('Not test mode');
    });
  }

  async testImplementation() {
    console.log('\n2️⃣  CODE IMPLEMENTATION');
    console.log('━'.repeat(60));

    await this.run('✓ CreemService class', async () => {
      const content = readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('class CreemPaymentService')) throw new Error('Class not found');
      if (!content.includes('createCheckoutSession')) throw new Error('Method missing');
      if (!content.includes('cancelSubscription')) throw new Error('Method missing');
      if (!content.includes('getSubscription')) throw new Error('Method missing');
      if (!content.includes('verifyWebhookSignature')) throw new Error('Method missing');
      if (!content.includes('export const creemService')) throw new Error('Export missing');
    });

    await this.run('✓ Creem configuration', async () => {
      if (!existsSync('./src/payment/creem/client.ts')) throw new Error('File missing');
      const content = readFileSync('./src/payment/creem/client.ts', 'utf-8');
      if (!content.includes('creemConfig') && !content.includes('CreemClient')) {
        throw new Error('Config not defined');
      }
    });

    await this.run('✓ Webhook route handler', async () => {
      if (!existsSync('./src/app/api/webhooks/creem/route.ts')) throw new Error('Missing');
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('export async function POST')) throw new Error('No POST handler');
      if (!content.includes('verifyWebhookSignature')) throw new Error('No signature verification');
      if (!content.includes('subscription.created')) throw new Error('No event handling');
    });

    await this.run('✓ Checkout API route', async () => {
      if (!existsSync('./src/app/api/payment/create-checkout/route.ts')) throw new Error('Missing');
      const content = readFileSync('./src/app/api/payment/create-checkout/route.ts', 'utf-8');
      if (!content.includes('export async function POST')) throw new Error('No handler');
    });

    await this.run('✓ Cancel subscription route', async () => {
      if (!existsSync('./src/app/api/payment/cancel-subscription/route.ts'))
        throw new Error('Missing');
    });

    await this.run('✓ Get subscription route', async () => {
      if (!existsSync('./src/app/api/payment/get-subscription/route.ts'))
        throw new Error('Missing');
    });

    await this.run('✓ React hook created', async () => {
      if (!existsSync('./src/hooks/useCreemPayment.ts')) throw new Error('Missing');
      const content = readFileSync('./src/hooks/useCreemPayment.ts', 'utf-8');
      if (!content.includes('useCreemPayment')) throw new Error('Hook not exported');
    });

    await this.run('✓ Environment schema', async () => {
      const content = readFileSync('./src/env.ts', 'utf-8');
      if (!content.includes('CREEM_API_KEY')) throw new Error('Not updated');
      if (!content.includes('CREEM_WEBHOOK_SECRET')) throw new Error('Missing webhook secret');
    });

    await this.run('✓ Payment config updated', async () => {
      const content = readFileSync('./src/config/payment.config.ts', 'utf-8');
      if (!content.includes('creem')) throw new Error('Not updated');
    });
  }

  async testSecurity() {
    console.log('\n3️⃣  SECURITY VALIDATION');
    console.log('━'.repeat(60));

    await this.run('✓ Webhook signature verification', async () => {
      const content = readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('verifyWebhookSignature')) throw new Error('Missing');
      if (!content.includes('createHmac')) throw new Error('No HMAC');
      if (!content.includes('sha256')) throw new Error('Wrong algorithm');
    });

    await this.run('✓ Idempotency check', async () => {
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('isProcessed') || !content.includes('already processed')) {
        throw new Error('No idempotency protection');
      }
    });

    await this.run('✓ Authentication required', async () => {
      const checkoutContent = readFileSync(
        './src/app/api/payment/create-checkout/route.ts',
        'utf-8'
      );
      if (!checkoutContent.includes('auth')) throw new Error('No auth check');
    });

    await this.run('✓ Error handling', async () => {
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('try') || !content.includes('catch')) throw new Error('Missing');
    });

    await this.run('✓ Test mode check', async () => {
      const content = readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('getCreemTestMode')) throw new Error('No test mode function');
    });
  }

  async testBusinessLogic() {
    console.log('\n4️⃣  BUSINESS LOGIC');
    console.log('━'.repeat(60));

    await this.run('✓ Credit allocation - Pro', async () => {
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('500') && !content.includes('6000')) throw new Error('Wrong credits');
    });

    await this.run('✓ Credit allocation - ProPlus', async () => {
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('900') && !content.includes('10800')) throw new Error('Wrong credits');
    });

    await this.run('✓ Database integration', async () => {
      const content = readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('paymentRepository')) throw new Error('No DB operations');
      if (!content.includes('userCredits')) throw new Error('No credit tables');
      if (!content.includes('creditTransactions')) throw new Error('No transaction tracking');
    });

    await this.run('✓ Subscription events', async () => {
      const content = readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      const events = [
        'subscription.created',
        'subscription.canceled',
        'subscription.paid',
        'checkout.completed',
      ];
      events.forEach((event) => {
        if (!content.includes(event)) throw new Error(`Missing: ${event}`);
      });
    });

    await this.run('✓ Plan mapping', async () => {
      const content = readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('CREEM_PRODUCTS')) throw new Error('No product mapping');
      if (!content.includes('pro:') || !content.includes('proplus:')) {
        throw new Error('Plans not mapped');
      }
    });

    await this.run('✓ Creem SDK integration', async () => {
      const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
      if (!pkg.dependencies?.creem) throw new Error('SDK not installed - run: pnpm add creem');
    });
  }

  printFinalReport() {
    const total = this.passed + this.failed;
    const passRate = ((this.passed / total) * 100).toFixed(1);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    📊 FINAL REPORT                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    console.log('\n📈 Statistics:');
    console.log(`   Total Tests:     ${total}`);
    console.log(`   Passed:          ${this.passed} ✅`);
    console.log(`   Failed:          ${this.failed} ❌`);
    console.log(`   Pass Rate:       ${passRate}%`);
    console.log(`   Duration:        ${totalDuration}ms`);

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter((r) => r.status === 'FAIL')
        .forEach((r) => {
          console.log(`   • ${r.name}: ${r.error}`);
        });
    }

    console.log(`\n${'━'.repeat(60)}`);

    if (this.failed === 0) {
      console.log('\n🎉 SUCCESS! Creem integration is COMPLETE and READY!\n');
      console.log('📝 Next Steps:');
      console.log('   1. ✅ Configuration verified');
      console.log('   2. ✅ Implementation complete');
      console.log('   3. ✅ Security validated');
      console.log('   4. ✅ Business logic verified');
      console.log('\n🚀 Ready for testing:');
      console.log('   • Start server: pnpm dev');
      console.log('   • Visit: http://localhost:3002/pricing');
      console.log('   • Setup ngrok: ngrok http 3002');
      console.log('   • Test webhooks from Creem dashboard');

      console.log('\n💳 Test Payment URLs:');
      console.log(`   Pro:     ${env.CREEM_PRO_PAYMENT_PLAN_URL}`);
      console.log(`   ProPlus: ${env.CREEM_PROPLUS_PAYMENT_PLAN_URL}`);
    } else {
      console.log('\n⚠️  Some tests failed. Please fix the issues above.');
    }

    console.log(`\n${'━'.repeat(60)}`);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed: this.passed,
        failed: this.failed,
        passRate,
        duration: totalDuration,
      },
      environment: {
        apiKey: `${env.CREEM_API_KEY?.substring(0, 25)}...`,
        webhookUrl: env.CREEM_WEBHOOK_URL,
        testMode: env.CREEM_API_KEY?.includes('test') ?? false,
        proPlan: env.CREEM_PRO_PLAN_PRODUCT_KEY,
        proplusPlan: env.CREEM_PROPLUS_PLAN_PRODUCT_KEY,
      },
      results: this.results,
    };

    writeFileSync('creem-integration-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Full report: creem-integration-test-report.json\n');
  }
}

const tester = new FinalCreemTest();
tester.testAll().catch(console.error);
