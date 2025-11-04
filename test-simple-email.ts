import { Resend } from 'resend';

const RESEND_API_KEY = 're_crm8cmjP_5cC4SMMJ8Q8qkxgamLg2uVxu';
const TEST_EMAIL = 'jefflee2002@gmail.com';
const FROM_EMAIL = 'noreply@im2prompt.com';

console.log('Testing email send...\n');

const resend = new Resend(RESEND_API_KEY);

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Email</title>
</head>
<body>
  <h1>Test Email from im2prompt</h1>
  <p>This is a test email to verify the email service is working correctly.</p>
</body>
</html>
`;

try {
  console.log('Sending email...');
  const response = await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: '[TEST] Simple Test Email',
    html,
  });

  if (response.error) {
    console.error('❌ Error:', response.error);
    process.exit(1);
  }

  console.log('✅ Email sent successfully!');
  console.log('Message ID:', response.data?.id);
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', (error as Error).message);
  console.error('Stack:', (error as Error).stack);
  process.exit(1);
}
