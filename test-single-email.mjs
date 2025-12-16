import { config } from 'dotenv';
import { Resend } from 'resend';

config({ path: '.env.production' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = 'jefflee2002@gmail.com';
const FROM_EMAIL = 'noreply@im2prompt.com';

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found');
  process.exit(1);
}

console.log('Testing single email...\n');

const resend = new Resend(RESEND_API_KEY);

const { renderWelcomeTemplate } = await import('./src/lib/email/templates/welcome-template.ts');

const html = renderWelcomeTemplate({
  userName: 'Jeff Lee',
  userEmail: TEST_EMAIL,
  signupMethod: 'email',
  signupCredits: 30,
  dashboardUrl: 'https://im2prompt.com/dashboard',
  imageToPromptUrl: 'https://im2prompt.com/image-to-prompt',
  textToPromptUrl: 'https://im2prompt.com/text-to-prompt',
});

try {
  const response = await resend.emails.send({
    from: FROM_EMAIL,
    to: TEST_EMAIL,
    subject: '[TEST] Welcome to im2prompt!',
    html,
  });

  if (response.error) {
    console.error('❌ Error:', response.error);
    process.exit(1);
  }

  console.log('✅ Email sent successfully!');
  console.log('Message ID:', response.data.id);
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
