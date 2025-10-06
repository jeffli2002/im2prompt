import { NextRequest, NextResponse } from 'next/server';

const COZE_API_URL = 'https://api.coze.cn/open_api/v2/chat';
const COZE_BOT_ID = '7550263539588399142';
const COZE_API_KEY = process.env.COZE_API_KEY;

export async function GET(req: NextRequest) {
  try {
    if (!COZE_API_KEY) {
      return NextResponse.json(
        { error: 'COZE_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Test Coze API with a simple text query using a published bot
    const testPayload = {
      conversation_id: '',
      bot_id: '7498227685932154887', // Use a published bot ID for testing
      user: 'test-user',
      query: 'Hello, can you help me?',
      stream: false,
      auto_save_history: false,
    };

    console.log('Testing Coze API with payload:', testPayload);

    const cozeResponse = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await cozeResponse.text();
    console.log('Coze API response status:', cozeResponse.status);
    console.log('Coze API response:', responseText);

    if (!cozeResponse.ok) {
      return NextResponse.json(
        { 
          error: 'Coze API test failed',
          status: cozeResponse.status,
          response: responseText
        },
        { status: 500 }
      );
    }

    const cozeData = JSON.parse(responseText);
    
    return NextResponse.json({
      success: true,
      message: 'Coze API test successful',
      data: cozeData
    });

  } catch (error) {
    console.error('Coze API test error:', error);
    return NextResponse.json(
      { error: 'Coze API test failed', details: error },
      { status: 500 }
    );
  }
}
