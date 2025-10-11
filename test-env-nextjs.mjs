import { env } from './src/env.ts';

console.log('\n=== Next.js Environment Check ===\n');
console.log('CREEM_API_KEY:', env.CREEM_API_KEY ? 'SET (' + env.CREEM_API_KEY.substring(0, 15) + '...)' : 'NOT SET');
console.log('CREEM_WEBHOOK_SECRET:', env.CREEM_WEBHOOK_SECRET ? 'SET' : 'NOT SET');
console.log('CREEM_PRO_PLAN_PRODUCT_KEY:', env.CREEM_PRO_PLAN_PRODUCT_KEY || 'NOT SET');
console.log('CREEM_PROPLUS_PLAN_PRODUCT_KEY:', env.CREEM_PROPLUS_PLAN_PRODUCT_KEY || 'NOT SET');
console.log('\n');
