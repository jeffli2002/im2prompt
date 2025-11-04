import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import type { FeedbackEmailParams } from '@/lib/email/email-types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, category, priority, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const emailParams: FeedbackEmailParams = {
      name,
      email,
      subject,
      category: category || 'general',
      priority: priority || 'normal',
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
      },
    };

    const result = await emailService.sendFeedbackEmail(emailParams);

    if (!result.success) {
      console.error('Failed to send feedback email:', result.error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Support ticket submitted successfully',
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing support ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
