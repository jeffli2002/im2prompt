const https = require('https');

const RESEND_API_KEY = 're_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu';
const TEST_EMAIL = 'jefflee2002@gmail.com';
const FROM_EMAIL = 'noreply@im2prompt.com';

console.log('Testing email send via Resend API...\n');

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #4F46E5;">Test Email from im2prompt</h1>
  <p>This is a test email to verify the email service is working correctly.</p>
  <p>If you received this, the email system is functioning properly!</p>
</body>
</html>
`;

const data = JSON.stringify({
  from: FROM_EMAIL,
  to: [TEST_EMAIL],
  subject: '[TEST] Simple Test Email',
  html: html,
});

const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/emails',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('Sending email...');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', response.id);
        process.exit(0);
      } else {
        console.error('❌ Error:', response);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Parse error:', error.message);
      console.error('Response:', responseData);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
