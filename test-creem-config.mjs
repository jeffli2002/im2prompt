import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local first, then .env
dotenv.config({ path: join(__dirname, '.env.local') });
dotenv.config({ path: join(__dirname, '.env') });

console.log('\n=== Creem Configuration Test ===\n');

const config = {
  apiKey: process.env.CREEM_API_KEY,
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET,
  proProductKey: process.env.CREEM_PRO_PLAN_PRODUCT_KEY,
  proplusProductKey: process.env.CREEM_PROPLUS_PLAN_PRODUCT_KEY,
};

console.log('Environment Variables:');
console.log('- CREEM_API_KEY:', config.apiKey ? `${config.apiKey.substring(0, 10)}...` : '❌ NOT SET');
console.log('- CREEM_WEBHOOK_SECRET:', config.webhookSecret ? `${config.webhookSecret.substring(0, 10)}...` : '❌ NOT SET');
console.log('- CREEM_PRO_PLAN_PRODUCT_KEY:', config.proProductKey || '❌ NOT SET');
console.log('- CREEM_PROPLUS_PLAN_PRODUCT_KEY:', config.proplusProductKey || '❌ NOT SET');

if (!config.apiKey) {
  console.log('\n⚠️  WARNING: CREEM_API_KEY is not set!');
  console.log('Creem integration will not work.\n');
  process.exit(1);
}

console.log('\n=== Testing Creem API Connection ===\n');

const testCustomerCreation = async () => {
  try {
    const response = await fetch('https://api.creem.io/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'test-user-id' },
      }),
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response Body:', responseText);

    if (!response.ok) {
      console.log('\n❌ Failed to create customer');
      console.log('Error:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('\nParsed Error:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        // Not JSON
      }
      
      return false;
    }

    const data = JSON.parse(responseText);
    console.log('\n✅ Customer created successfully!');
    console.log('Customer ID:', data.id);
    
    // Clean up - delete test customer if possible
    if (data.id) {
      try {
        await fetch(`https://api.creem.io/v1/customers/${data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        });
        console.log('✅ Test customer deleted');
      } catch (e) {
        console.log('⚠️  Could not delete test customer:', e.message);
      }
    }
    
    return true;
  } catch (error) {
    console.log('\n❌ Network Error:', error.message);
    return false;
  }
};

testCustomerCreation().then((success) => {
  if (success) {
    console.log('\n✅ Creem configuration is working correctly!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Creem configuration test failed.\n');
    console.log('Common issues:');
    console.log('1. Invalid API key');
    console.log('2. API key does not have correct permissions');
    console.log('3. Creem API endpoint is incorrect');
    console.log('4. Network connectivity issues\n');
    process.exit(1);
  }
});
