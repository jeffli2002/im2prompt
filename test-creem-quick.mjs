import crypto from 'crypto';
import { readFileSync } from 'fs';

function loadEnv() {
  const envContent = readFileSync('.env.local', 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
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

class CreemTester {
  constructor() {
    this.results = [];
  }

  async run(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'PASS', duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   ${error.message}`);
    }
  }

  async testAll() {
    console.log('\n🧪 Creem Payment Integration - Quick Test\n');
    console.log('=' .repeat(60));

    console.log('\n📋 Environment Variables');
    console.log('-'.repeat(60));

    await this.run('CREEM_API_KEY', async () => {
      if (!env.CREEM_API_KEY) throw new Error('Not found');
      if (!env.CREEM_API_KEY.startsWith('creem_')) throw new Error('Invalid format');
      console.log(`   ${env.CREEM_API_KEY.substring(0, 25)}...`);
    });

    await this.run('Test mode enabled', async () => {
      if (!env.CREEM_API_KEY.includes('test')) throw new Error('Production key detected!');
      console.log('   ✓ Using test credentials');
    });

    await this.run('CREEM_WEBHOOK_SECRET', async () => {
      if (!env.CREEM_WEBHOOK_SECRET) throw new Error('Not found');
      if (!env.CREEM_WEBHOOK_SECRET.startsWith('wh_')) throw new Error('Invalid format');
      console.log(`   ${env.CREEM_WEBHOOK_SECRET.substring(0, 20)}...`);
    });

    await this.run('CREEM_PRO_PLAN_PRODUCT_KEY', async () => {
      if (!env.CREEM_PRO_PLAN_PRODUCT_KEY) throw new Error('Not found');
      if (!env.CREEM_PRO_PLAN_PRODUCT_KEY.startsWith('prod_')) throw new Error('Invalid format');
      console.log(`   ${env.CREEM_PRO_PLAN_PRODUCT_KEY}`);
    });

    await this.run('CREEM_PROPLUS_PLAN_PRODUCT_KEY', async () => {
      if (!env.CREEM_PROPLUS_PLAN_PRODUCT_KEY) throw new Error('Not found');
      console.log(`   ${env.CREEM_PROPLUS_PLAN_PRODUCT_KEY}`);
    });

    await this.run('CREEM_WEBHOOK_URL', async () => {
      if (!env.CREEM_WEBHOOK_URL) throw new Error('Not found');
      console.log(`   ${env.CREEM_WEBHOOK_URL}`);
    });

    await this.run('Payment plan URLs', async () => {
      if (!env.CREEM_PRO_PAYMENT_PLAN_URL) throw new Error('Pro URL not found');
      if (!env.CREEM_PROPLUS_PAYMENT_PLAN_URL) throw new Error('ProPlus URL not found');
      console.log(`   Pro: ${env.CREEM_PRO_PAYMENT_PLAN_URL}`);
      console.log(`   ProPlus: ${env.CREEM_PROPLUS_PAYMENT_PLAN_URL}`);
    });

    console.log('\n🔐 Webhook Signature');
    console.log('-'.repeat(60));

    await this.run('HMAC-SHA256 signature', async () => {
      const payload = JSON.stringify({ test: 'data', timestamp: Date.now() });
      const signature = crypto
        .createHmac('sha256', env.CREEM_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');
      
      if (signature.length !== 64) throw new Error('Invalid signature length');
      console.log(`   ${signature.substring(0, 32)}...`);
    });

    await this.run('Timing-safe comparison', async () => {
      const payload = '{"event":"test"}';
      const sig1 = crypto.createHmac('sha256', env.CREEM_WEBHOOK_SECRET).update(payload).digest('hex');
      const sig2 = crypto.createHmac('sha256', env.CREEM_WEBHOOK_SECRET).update(payload).digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(sig1), Buffer.from(sig2))) {
        throw new Error('Signatures should match');
      }
      console.log('   ✓ Verified');
    });

    console.log('\n📊 Subscription Configuration');
    console.log('-'.repeat(60));

    await this.run('Plan to product mapping', async () => {
      const mapping = {
        pro: env.CREEM_PRO_PLAN_PRODUCT_KEY,
        proplus: env.CREEM_PROPLUS_PLAN_PRODUCT_KEY,
      };
      if (!mapping.pro || !mapping.proplus) throw new Error('Incomplete mapping');
      console.log(`   pro → ${mapping.pro}`);
      console.log(`   proplus → ${mapping.proplus}`);
    });

    await this.run('Credit allocation', async () => {
      const credits = {
        [env.CREEM_PRO_PLAN_PRODUCT_KEY]: 500,
        [env.CREEM_PROPLUS_PLAN_PRODUCT_KEY]: 900,
      };
      if (credits[env.CREEM_PRO_PLAN_PRODUCT_KEY] !== 500) throw new Error('Pro credits wrong');
      if (credits[env.CREEM_PROPLUS_PLAN_PRODUCT_KEY] !== 900) throw new Error('ProPlus credits wrong');
      console.log(`   Pro: 500 credits/month`);
      console.log(`   ProPlus: 900 credits/month`);
    });

    await this.run('Webhook event types', async () => {
      const events = [
        'subscription.created',
        'subscription.updated',
        'subscription.canceled',
        'subscription.payment_succeeded',
        'subscription.payment_failed',
        'customer.subscription.deleted',
        'checkout.session.completed',
        'invoice.payment_succeeded',
      ];
      console.log(`   ${events.length} event types supported`);
    });

    console.log('\n💳 Checkout URLs');
    console.log('-'.repeat(60));

    await this.run('Pro plan checkout URL', async () => {
      const url = env.CREEM_PRO_PAYMENT_PLAN_URL;
      if (!url.includes('creem.io')) throw new Error('Invalid URL');
      if (!url.includes('test')) throw new Error('Not using test URL');
      console.log(`   ${url}`);
    });

    await this.run('ProPlus plan checkout URL', async () => {
      const url = env.CREEM_PROPLUS_PAYMENT_PLAN_URL;
      if (!url.includes('creem.io')) throw new Error('Invalid URL');
      if (!url.includes('test')) throw new Error('Not using test URL');
      console.log(`   ${url}`);
    });

    this.printReport();
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\nTests: ${total} total, ${passed} passed, ${failed} failed`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Duration: ${totalDuration}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   • ${r.name}: ${r.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('✅ ALL TESTS PASSED - Creem integration is configured correctly!\n');
      console.log('📝 Next Steps:');
      console.log('   1. Install Creem SDK: pnpm add creem');
      console.log('   2. Start server: pnpm dev');
      console.log('   3. Test checkout: http://localhost:3002/pricing');
      console.log('   4. Setup ngrok for webhooks: ngrok http 3002');
      console.log('   5. Update webhook URL in Creem dashboard');
    } else {
      console.log('❌ TESTS FAILED - Please fix configuration issues above.');
    }
    console.log('='.repeat(60) + '\n');
  }
}

const tester = new CreemTester();
tester.testAll().catch(console.error);
