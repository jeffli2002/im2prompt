import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const apiKey = process.env.CREEM_API_KEY;

console.log('\n=== Testing Creem API Endpoints ===\n');

const endpoints = [
  { url: 'https://api.creem.io/v1/customers', method: 'GET', name: 'List Customers (v1)' },
  { url: 'https://api.creem.io/customers', method: 'GET', name: 'List Customers (no version)' },
  { url: 'https://api.creem.io/v1/products', method: 'GET', name: 'List Products (v1)' },
  { url: 'https://api.creem.io/v1/health', method: 'GET', name: 'Health Check' },
  { url: 'https://api.creem.io/health', method: 'GET', name: 'Health Check (no version)' },
];

for (const endpoint of endpoints) {
  try {
    console.log(`Testing: ${endpoint.name}`);
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log(`  Status: ${response.status}`);
    console.log('  Response:', text.slice(0, 200));
    console.log('');
  } catch (error) {
    console.log(`  Error: ${error.message}\n`);
  }
}
