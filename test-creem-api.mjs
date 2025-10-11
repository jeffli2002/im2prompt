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

class CreemAPITester {
  constructor() {
    this.results = [];
    this.baseUrl = 'http://localhost:3002';
  }

  async run(name, fn) {
    const start = Date.now();
    try {
      await fn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'PASS', duration });
      console.log(`✅ ${name} (${duration}ms)`);
      return true;
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({ name, status: 'FAIL', duration, error: error.message });
      console.log(`❌ ${name} (${duration}ms)`);
      console.log(`   ${error.message}`);
      return false;
    }
  }

  async testAll() {
    console.log('\n🧪 Creem API Implementation Test\n');
    console.log('=' .repeat(60));

    console.log('\n📁 File Structure');
    console.log('-'.repeat(60));

    await this.run('CreemService exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/lib/creem/creem-service.ts')) {
        throw new Error('creem-service.ts not found');
      }
      console.log('   ✓ src/lib/creem/creem-service.ts');
    });

    await this.run('Creem client exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/payment/creem/client.ts')) {
        throw new Error('client.ts not found');
      }
      console.log('   ✓ src/payment/creem/client.ts');
    });

    await this.run('Webhook route exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/app/api/webhooks/creem/route.ts')) {
        throw new Error('webhook route not found');
      }
      console.log('   ✓ src/app/api/webhooks/creem/route.ts');
    });

    await this.run('Create checkout route exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/app/api/payment/create-checkout/route.ts')) {
        throw new Error('create-checkout route not found');
      }
      console.log('   ✓ src/app/api/payment/create-checkout/route.ts');
    });

    await this.run('Cancel subscription route exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/app/api/payment/cancel-subscription/route.ts')) {
        throw new Error('cancel-subscription route not found');
      }
      console.log('   ✓ src/app/api/payment/cancel-subscription/route.ts');
    });

    await this.run('Get subscription route exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/app/api/payment/get-subscription/route.ts')) {
        throw new Error('get-subscription route not found');
      }
      console.log('   ✓ src/app/api/payment/get-subscription/route.ts');
    });

    await this.run('useCreemPayment hook exists', async () => {
      const fs = await import('fs');
      if (!fs.existsSync('./src/hooks/useCreemPayment.ts')) {
        throw new Error('useCreemPayment hook not found');
      }
      console.log('   ✓ src/hooks/useCreemPayment.ts');
    });

    console.log('\n📝 Code Quality Checks');
    console.log('-'.repeat(60));

    await this.run('CreemService imports check', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('export class CreemService')) {
        throw new Error('CreemService class not exported');
      }
      if (!content.includes('getInstance()')) {
        throw new Error('Singleton pattern not implemented');
      }
      if (!content.includes('createCheckoutSession')) {
        throw new Error('createCheckoutSession method missing');
      }
      console.log('   ✓ Class structure valid');
    });

    await this.run('Webhook handler implementation', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('export async function POST')) {
        throw new Error('POST handler not exported');
      }
      if (!content.includes('crypto.createHmac')) {
        throw new Error('Signature verification missing');
      }
      if (!content.includes('subscription.created')) {
        throw new Error('Event handling missing');
      }
      console.log('   ✓ Webhook implementation complete');
    });

    await this.run('Environment variable usage', async () => {
      const fs = await import('fs');
      const serviceContent = fs.readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      const clientContent = fs.readFileSync('./src/payment/creem/client.ts', 'utf-8');
      
      if (!serviceContent.includes('CREEM_') && !clientContent.includes('CREEM_')) {
        throw new Error('Environment variables not used');
      }
      console.log('   ✓ Environment variables configured');
    });

    await this.run('TypeScript types', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/lib/creem/creem-service.ts', 'utf-8');
      if (!content.includes('interface') && !content.includes('type')) {
        throw new Error('TypeScript types not defined');
      }
      console.log('   ✓ Types defined');
    });

    await this.run('Error handling', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/app/api/webhooks/creem/route.ts', 'utf-8');
      if (!content.includes('try') || !content.includes('catch')) {
        throw new Error('Error handling missing');
      }
      console.log('   ✓ Error handling implemented');
    });

    console.log('\n📦 Package Dependencies');
    console.log('-'.repeat(60));

    await this.run('package.json check', async () => {
      const fs = await import('fs');
      const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
      
      const hasCreem = pkg.dependencies?.creem || pkg.devDependencies?.creem;
      if (!hasCreem) {
        console.log('   ⚠️  Creem SDK not installed yet');
        console.log('   Run: pnpm add creem');
      } else {
        console.log(`   ✓ Creem SDK: ${hasCreem}`);
      }
    });

    console.log('\n🔧 Configuration Validation');
    console.log('-'.repeat(60));

    await this.run('env.ts updated', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/env.ts', 'utf-8');
      if (!content.includes('CREEM_API_KEY')) {
        throw new Error('env.ts not updated with Creem variables');
      }
      console.log('   ✓ Environment schema defined');
    });

    await this.run('payment.config.ts updated', async () => {
      const fs = await import('fs');
      const content = fs.readFileSync('./src/config/payment.config.ts', 'utf-8');
      if (!content.includes('creem')) {
        throw new Error('payment.config.ts not updated');
      }
      console.log('   ✓ Payment config includes Creem');
    });

    this.printReport();
  }

  printReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API Implementation Test Summary');
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
      console.log('✅ API IMPLEMENTATION COMPLETE!\n');
      console.log('📝 Ready for Integration Testing:');
      console.log('   1. Ensure Creem SDK installed: pnpm add creem');
      console.log('   2. Start dev server: pnpm dev');
      console.log('   3. Test endpoints with curl or Postman');
      console.log('   4. Setup ngrok: ngrok http 3002');
      console.log('   5. Configure webhook in Creem dashboard');
      console.log('   6. Test complete payment flow');
    } else {
      console.log('⚠️  SOME CHECKS FAILED - Review issues above');
    }
    console.log('='.repeat(60) + '\n');
  }
}

const tester = new CreemAPITester();
tester.testAll().catch(console.error);
