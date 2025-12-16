-- Manual SQL script to create admin user
-- Run this directly in your database if the create-admin.ts script fails

-- Step 1: Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Step 2: Create index on email
CREATE INDEX IF NOT EXISTS admins_email_idx ON admins(email);

-- Step 3: Insert or update admin user
-- Replace 'your-password-hash' with the bcrypt hash of your password
-- You can generate the hash using: node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"

-- Example: Insert admin user (replace the password_hash with your actual hash)
-- INSERT INTO admins (email, name, password_hash) 
-- VALUES ('admin@im2prompt.com', 'Admin User', '$2a$10$YourBcryptHashHere')
-- ON CONFLICT (email) DO UPDATE SET 
--   password_hash = EXCLUDED.password_hash,
--   updated_at = NOW();

-- To generate password hash, run in Node.js:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"

