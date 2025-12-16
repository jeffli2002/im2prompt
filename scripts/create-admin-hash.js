// Quick script to generate bcrypt hash for admin password
// Usage: node scripts/create-admin-hash.js your-password

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123456';

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n✅ Password hash generated:');
  console.log('━'.repeat(60));
  console.log(hash);
  console.log('━'.repeat(60));
  console.log('\n📝 Use this hash in the SQL script or database directly.\n');
}).catch((error) => {
  console.error('❌ Error generating hash:', error);
  process.exit(1);
});

